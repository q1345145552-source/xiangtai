import asyncio
import hashlib
import io
import math
import os
import re
import uuid
from typing import Any

import chromadb
import httpx
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from pypdf import PdfReader

app = FastAPI(title="Xiangtai AI RAG Service", version="1.0.0")

CHROMA_DIR = os.getenv("CHROMA_DIR", "./chroma_data")
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "xiangtai_kb")
EMBED_DIM = max(int(os.getenv("EMBED_DIM", "256")), 64)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1").rstrip("/")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
AI_TIMEOUT = max(int(os.getenv("AI_REQUEST_TIMEOUT_MS", "45000")), 10000) / 1000
GUIDE_TEXT = "如果您需要详细方案，请输入您的需求获取评估码，或联系我们的专业顾问。"

os.makedirs(CHROMA_DIR, exist_ok=True)


class FastHashEmbeddingFunction(EmbeddingFunction[Documents]):
    """Lightweight embedding function to avoid heavy model downloads during deploy."""

    def __call__(self, input: Documents) -> Embeddings:
        return [self._embed(text) for text in input]

    def _embed(self, text: str) -> list[float]:
        vec = [0.0] * EMBED_DIM
        for token in tokenize(text):
            h = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            idx = h % EMBED_DIM
            sign = -1.0 if ((h >> 8) & 1) else 1.0
            vec[idx] += sign
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]


embedding_fn = FastHashEmbeddingFunction()
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = chroma_client.get_or_create_collection(
    name=CHROMA_COLLECTION,
    embedding_function=embedding_fn,
    metadata={"hnsw:space": "cosine"},
)


class ChatRequest(BaseModel):
    question: str
    contextPath: str | None = None
    tags: list[str] | None = None


class TextIngestRequest(BaseModel):
    title: str
    content: str
    sourceUrl: str | None = None
    tags: list[str] | None = None


def normalize_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def tokenize(text: str) -> list[str]:
    cleaned = re.sub(r"[^\w\u4e00-\u9fff]+", " ", text.lower())
    return [w for w in cleaned.split() if 1 < len(w) <= 24]


def chunk_text(text: str, chunk_size: int = 420, overlap: int = 80) -> list[str]:
    clean = text.strip()
    if not clean:
        return []
    chunks: list[str] = []
    idx = 0
    while idx < len(clean):
        end = min(idx + chunk_size, len(clean))
        body = clean[idx:end].strip()
        if body:
            chunks.append(body)
        if end >= len(clean):
            break
        idx = max(end - overlap, idx + 1)
    return chunks


def parse_tags(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [normalize_spaces(x) for x in raw.split(",") if normalize_spaces(x)]


def tags_for_context(context_path: str | None) -> list[str]:
    if not context_path:
        return []
    path = context_path.lower()
    if "government" in path:
        return ["工商类"]
    if "logistics" in path:
        return ["物流类"]
    if "qualification" in path:
        return ["资质类"]
    if "ecommerce" in path:
        return ["电商类"]
    return []


def read_upload_text(filename: str, content: bytes) -> str:
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    if ext == "pdf":
        reader = PdfReader(io.BytesIO(content))
        pages = [p.extract_text() or "" for p in reader.pages]
        return "\n".join(pages).strip()
    if ext in {"md", "txt"}:
        return content.decode("utf-8", errors="ignore").strip()
    raise HTTPException(status_code=400, detail="仅支持 PDF、Markdown 或 TXT 文件")


def ingest_document(title: str, content: str, source_url: str | None, tags: list[str]) -> dict[str, Any]:
    chunks = chunk_text(content)
    if not chunks:
        raise HTTPException(status_code=400, detail="文档内容为空或无法解析")

    doc_id = str(uuid.uuid4())
    ids: list[str] = []
    docs: list[str] = []
    metadatas: list[dict[str, Any]] = []
    tags_csv = ",".join(tags)

    for idx, chunk in enumerate(chunks, start=1):
        ids.append(f"{doc_id}-{idx}")
        docs.append(chunk)
        metadatas.append(
            {
                "doc_id": doc_id,
                "chunk_no": idx,
                "title": title,
                "source_url": source_url or "",
                "tags_csv": tags_csv,
                "keyword_index": " ".join(tokenize(chunk)[:32]),
            }
        )

    collection.add(ids=ids, documents=docs, metadatas=metadatas)
    return {"docId": doc_id, "chunkCount": len(chunks)}


def retrieve_context(question: str, prefer_tags: list[str], top_k: int = 6) -> list[dict[str, Any]]:
    # First query normally; then score manually by tag hit to bias preferred tags.
    query = collection.query(
        query_texts=[question],
        n_results=max(top_k * 4, 12),
        include=["documents", "metadatas", "distances"],
    )
    docs = query.get("documents", [[]])[0]
    metas = query.get("metadatas", [[]])[0]
    dists = query.get("distances", [[]])[0]

    rows: list[dict[str, Any]] = []
    for i in range(len(docs)):
        meta = metas[i] or {}
        tags_csv = str(meta.get("tags_csv", ""))
        row_tags = [x for x in tags_csv.split(",") if x]
        score = float(dists[i] if i < len(dists) else 1.0)
        if prefer_tags and any(t in row_tags for t in prefer_tags):
            score -= 0.08
        rows.append(
            {
                "title": str(meta.get("title", "知识库文档")),
                "sourceUrl": str(meta.get("source_url", "")) or None,
                "content": str(docs[i]),
                "score": score,
            }
        )

    rows.sort(key=lambda x: x["score"])
    filtered = [r for r in rows if r["score"] < 1.35][:top_k]
    return filtered


async def deepseek_chat(question: str, contexts: list[dict[str, Any]]):
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY 未配置")

    context_text = "\n\n".join(
        [
            f"【参考{i+1}】标题：{c['title']}\n来源：{c['sourceUrl'] or '内部知识库'}\n内容：{c['content']}"
            for i, c in enumerate(contexts)
        ]
    )
    user_prompt = (
        f"用户问题：{question}\n\n"
        f"知识库参考：\n{context_text}\n\n"
        "请输出中文专业回答，必须仅基于参考内容，不得编造政策细节。"
    )

    return {
        "model": DEEPSEEK_MODEL,
        "temperature": 0.2,
        "max_tokens": 900,
        "messages": [
            {
                "role": "system",
                "content": "你是湘泰出海AI顾问。回答必须严谨，依据不足时直接建议联系人工顾问。",
            },
            {"role": "user", "content": user_prompt},
        ]
    }


def no_context_response() -> dict[str, Any]:
    answer = (
        "当前知识库暂未命中与该问题直接相关的内容，"
        "为了保证信息准确性，建议联系人工顾问进行一对一确认。\n\n"
        f"{GUIDE_TEXT}"
    )
    return {"answer": answer, "sources": []}


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/kb/upload")
async def kb_upload(
    file: UploadFile = File(...),
    title: str = Form(""),
    sourceUrl: str = Form(""),
    tags: str = Form(""),
):
    content_bytes = await file.read()
    text = read_upload_text(file.filename or "doc", content_bytes)
    effective_title = normalize_spaces(title) or (file.filename or "未命名文档")
    tag_list = parse_tags(tags)
    result = ingest_document(effective_title, text, sourceUrl or None, tag_list)
    return {"ok": True, "title": effective_title, "sourceUrl": sourceUrl or None, "tags": tag_list, **result}


@app.post("/kb/text")
async def kb_text(body: TextIngestRequest):
    title = normalize_spaces(body.title)
    content = body.content.strip()
    if not title or not content:
        raise HTTPException(status_code=400, detail="title 与 content 不能为空")
    tag_list = [normalize_spaces(t) for t in (body.tags or []) if normalize_spaces(t)]
    result = ingest_document(title, content, body.sourceUrl, tag_list)
    return {"ok": True, "title": title, "sourceUrl": body.sourceUrl, "tags": tag_list, **result}


@app.post("/chat")
async def chat(body: ChatRequest):
    question = normalize_spaces(body.question)
    if not question:
        raise HTTPException(status_code=400, detail="question 不能为空")

    prefer_tags = [normalize_spaces(t) for t in (body.tags or []) if normalize_spaces(t)]
    prefer_tags = prefer_tags or tags_for_context(body.contextPath)
    contexts = retrieve_context(question, prefer_tags=prefer_tags, top_k=6)
    if not contexts:
        return JSONResponse(no_context_response())

    payload = await deepseek_chat(question, contexts)
    retries = 3
    delay = 0.8
    answer = ""
    for _ in range(retries):
        try:
            async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
                resp = await client.post(
                    f"{DEEPSEEK_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"},
                    json=payload,
                )
            if resp.status_code >= 400:
                await asyncio.sleep(delay)
                delay *= 1.8
                continue
            data = resp.json()
            answer = (
                data.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
                .strip()
            )
            if answer:
                break
        except Exception:
            await asyncio.sleep(delay)
            delay *= 1.8

    if not answer:
        return JSONResponse(no_context_response())
    answer = f"{answer}\n\n{GUIDE_TEXT}"
    sources = list(dict.fromkeys([c["title"] for c in contexts]))
    return {"answer": answer, "sources": sources}


@app.post("/chat/stream")
async def chat_stream(body: ChatRequest):
    question = normalize_spaces(body.question)
    if not question:
        raise HTTPException(status_code=400, detail="question 不能为空")

    prefer_tags = [normalize_spaces(t) for t in (body.tags or []) if normalize_spaces(t)]
    prefer_tags = prefer_tags or tags_for_context(body.contextPath)
    contexts = retrieve_context(question, prefer_tags=prefer_tags, top_k=6)
    if not contexts:
        async def no_hit():
            text = no_context_response()["answer"]
            yield f"data: {text}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(no_hit(), media_type="text/event-stream")

    payload = await deepseek_chat(question, contexts)
    payload["stream"] = True

    async def event_generator():
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            async with client.stream(
                "POST",
                f"{DEEPSEEK_BASE_URL}/chat/completions",
                headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"},
                json=payload,
            ) as response:
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_line = line[6:]
                        if data_line == "[DONE]":
                            yield f"data: \n\n"
                            yield f"data: {GUIDE_TEXT}\n\n"
                            yield "data: [DONE]\n\n"
                            return
                        yield f"data: {data_line}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
