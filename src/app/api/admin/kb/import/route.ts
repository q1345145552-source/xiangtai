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
  if (!title || !content) {
    return NextResponse.json({ error: "标题和内容不能为空" }, { status: 400 });
  }
  const row = await prisma.knowledgeDoc.create({
    data: {
      title,
      content,
      sourceUrl: sourceUrl || null,
      version: String(body.version ?? "v1"),
      isActive: true
    }
  });
  return NextResponse.json(row);
}
