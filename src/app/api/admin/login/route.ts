import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAdminSession } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { username, password } = (await req.json()) as { username?: string; password?: string };
  if (!username || !password) {
    return NextResponse.json({ error: "用户名或密码为空" }, { status: 400 });
  }

  const fallbackUsername = process.env.ADMIN_USERNAME ?? "admin";
  const fallbackPassword = process.env.ADMIN_PASSWORD ?? "123456";
  let dbMatched = false;

  try {
    const admin = await prisma.adminUser.findUnique({ where: { username } });
    dbMatched = Boolean(admin && admin.password === password);
  } catch {
    // Database might be unavailable in some hosted environments.
    dbMatched = false;
  }

  const envMatched = username === fallbackUsername && password === fallbackPassword;
  if (!dbMatched && !envMatched) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
