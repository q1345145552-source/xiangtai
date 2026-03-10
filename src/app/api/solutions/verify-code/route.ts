import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "评估码不能为空" }, { status: 400 });
  }

  try {
    const row = await prisma.evaluationAccessCode.findUnique({
      where: { code }
    });
    if (!row || row.status !== "available") {
      return NextResponse.json({ error: "评估码无效或已使用" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "系统繁忙，请稍后重试或联系客服" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, code });
}
