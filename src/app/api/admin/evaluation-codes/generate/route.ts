import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { buildAccessCode } from "@/lib/matching";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await req.json();
  const count = Number(body.count ?? 1);
  if (!Number.isInteger(count) || count < 1 || count > 10) {
    return NextResponse.json({ error: "生成数量必须是 1-10 的整数" }, { status: 400 });
  }

  const createdCodes: string[] = [];
  let tries = 0;

  while (createdCodes.length < count && tries < 200) {
    tries += 1;
    const code = buildAccessCode();
    try {
      await prisma.evaluationAccessCode.create({
        data: { code }
      });
      createdCodes.push(code);
    } catch {
      // Unique conflict: generate another one.
    }
  }

  if (createdCodes.length !== count) {
    return NextResponse.json({ error: "评估码生成失败，请重试" }, { status: 500 });
  }

  return NextResponse.json({ codes: createdCodes });
}
