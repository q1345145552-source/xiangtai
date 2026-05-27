import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAdminSession } from "@/lib/admin-auth";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { apiError, apiSuccess, safeParseBody, str } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  const { data: body, error } = await safeParseBody(req);
  if (error) return error;

  const username = str(body!, "username");
  const password = str(body!, "password");
  if (!username || !password) {
    return apiError("用户名或密码为空");
  }

  const fallbackUsername = process.env.ADMIN_USERNAME ?? "admin";
  const fallbackPassword = process.env.ADMIN_PASSWORD ?? "123456";
  let dbMatched = false;

  try {
    const admin = await prisma.adminUser.findUnique({ where: { username } });
    if (admin) {
      dbMatched = verifyPassword(password, admin.password);
    }
  } catch {
    dbMatched = false;
  }

  // Fallback env-based auth (backward compatible)
  const envMatched = username === fallbackUsername && password === fallbackPassword;

  if (!dbMatched && !envMatched) {
    return apiError("用户名或密码错误", 401);
  }

  // If env-matched and user exists in DB with plain text, upgrade to hashed
  if (envMatched && !dbMatched) {
    try {
      const existing = await prisma.adminUser.findUnique({ where: { username } });
      if (existing && !/^[a-f0-9]{64}$/i.test(existing.password)) {
        await prisma.adminUser.update({
          where: { username },
          data: { password: hashPassword(password) }
        });
      }
    } catch {
      // Non-critical, just continue
    }
  }

  await setAdminSession();
  return apiSuccess({ ok: true });
}
