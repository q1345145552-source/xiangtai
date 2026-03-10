import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const sourceUrl = String(form.get("sourceUrl") ?? "").trim();
  const tags = String(form.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请上传文件" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "请填写文档标题" }, { status: 400 });
  }

  const allowed = [".pdf", ".md", ".txt"];
  const lowerName = file.name.toLowerCase();
  if (!allowed.some((ext) => lowerName.endsWith(ext))) {
    return NextResponse.json({ error: "仅支持 PDF、Markdown、TXT" }, { status: 400 });
  }

  const aiBase = process.env.AI_BACKEND_URL ?? "http://127.0.0.1:8001";
  const aiForm = new FormData();
  aiForm.set("file", file, file.name);
  aiForm.set("title", title);
  aiForm.set("sourceUrl", sourceUrl);
  aiForm.set("tags", tags.join(","));

  const ingestResp = await fetch(`${aiBase}/kb/upload`, {
    method: "POST",
    body: aiForm
  });

  if (!ingestResp.ok) {
    return NextResponse.json({ error: "RAG 入库失败，请检查 AI 服务是否启动" }, { status: 502 });
  }

  const row = await prisma.knowledgeDoc.create({
    data: {
      title,
      sourceUrl: sourceUrl || null,
      content: `[文件导入] ${file.name}`,
      tags: tags.join(","),
      version: "v1",
      isActive: true
    }
  });

  return NextResponse.json(row);
}
