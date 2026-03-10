import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const content = String(body.content ?? "").trim();
  const sourceUrl = String(body.sourceUrl ?? "").trim();
  const tags = String(body.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!title || !content) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }

  const aiBase = process.env.AI_BACKEND_URL ?? "http://127.0.0.1:8001";
  const ingestResp = await fetch(`${aiBase}/kb/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      content,
      sourceUrl: sourceUrl || null,
      tags
    })
  });
  if (!ingestResp.ok) {
    return NextResponse.json({ error: "RAG 入库失败，请检查 AI 服务是否启动" }, { status: 502 });
  }

  const row = await prisma.knowledgeDoc.create({
    data: {
      title,
      content,
      tags: tags.join(","),
      sourceUrl: sourceUrl || null,
      version: String(body.version ?? "v1"),
      isActive: true
    }
  });
  return NextResponse.json(row);
}
