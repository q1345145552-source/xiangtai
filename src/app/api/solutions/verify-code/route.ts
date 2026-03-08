import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "评估码不能为空" }, { status: 400 });
  }

  const row = await prisma.evaluationAccessCode.findUnique({
    where: { code }
  });
  if (!row || row.status !== "available") {
    return NextResponse.json({ error: "评估码无效或已使用" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, code });
}
