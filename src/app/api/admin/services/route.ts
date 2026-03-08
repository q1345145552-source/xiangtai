import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthed } from "@/lib/admin-auth";

export async function GET() {
  const rows = await prisma.servicePage.findMany({
    orderBy: [{ domain: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }]
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const body = await req.json();
  const row = await prisma.servicePage.create({
    data: {
      domain: String(body.domain ?? ""),
      slug: String(body.slug ?? ""),
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      caseText: String(body.caseText ?? ""),
      entryName: String(body.entryName ?? ""),
      entryUrl: String(body.entryUrl ?? ""),
      sortOrder: Number(body.sortOrder ?? 0),
      isActive: Boolean(body.isActive ?? true)
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
  const row = await prisma.servicePage.update({
    where: { id: String(body.id) },
    data: {
      domain: String(body.domain ?? ""),
      slug: String(body.slug ?? ""),
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      caseText: String(body.caseText ?? ""),
      entryName: String(body.entryName ?? ""),
      entryUrl: String(body.entryUrl ?? ""),
      sortOrder: Number(body.sortOrder ?? 0),
      isActive: Boolean(body.isActive ?? true)
    }
  });
  return NextResponse.json(row);
}
