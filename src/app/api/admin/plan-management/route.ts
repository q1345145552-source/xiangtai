import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "缺少记录ID" }, { status: 400 });
  }

  const row = await prisma.solutionEvaluation.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  await prisma.solutionEvaluation.delete({ where: { id } });
  return NextResponse.json({ ok: true, id });
}
