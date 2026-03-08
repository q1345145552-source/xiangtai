import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function GET() {
  const rows = await prisma.solutionPlan.findMany({
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = await req.json();
  const row = await prisma.solutionPlan.create({
    data: {
      title: String(body.title ?? ""),
      industry: String(body.industry ?? ""),
      tags: String(body.tags ?? ""),
      content: String(body.content ?? ""),
      status: String(body.status ?? "active")
    }
  });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少ID" }, { status: 400 });
  }
  const row = await prisma.solutionPlan.update({
    where: { id: String(body.id) },
    data: {
      title: String(body.title ?? ""),
      industry: String(body.industry ?? ""),
      tags: String(body.tags ?? ""),
      content: String(body.content ?? ""),
      status: String(body.status ?? "active")
    }
  });
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = await req.json();
  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "缺少ID" }, { status: 400 });
  }

  const row = await prisma.solutionPlan.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "方案不存在" }, { status: 404 });
  }
  if (row.industry !== "问卷大方案") {
    return NextResponse.json({ error: "仅支持删除大方案快照" }, { status: 400 });
  }

  await prisma.solutionPlan.delete({ where: { id } });
  return NextResponse.json({ ok: true, id });
}
