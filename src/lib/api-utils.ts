import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";

/**
 * Standard API error response helper
 */
export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard API success response helper
 */
export function apiSuccess(data: unknown, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Guard that checks admin authentication and returns 401 if not authenticated.
 * Returns null if authenticated (proceed with handler).
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const authed = await isAdminAuthed();
  if (!authed) {
    return apiError("未授权，请先登录", 401);
  }
  return null;
}

/**
 * Safely parse JSON body with error handling
 */
export async function safeParseBody<T = Record<string, unknown>>(req: NextRequest): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    const data = (await req.json()) as T;
    return { data, error: null };
  } catch {
    return { data: null, error: apiError("请求体格式错误", 400) };
  }
}

/**
 * Extract string field from body with default value
 */
export function str(body: Record<string, unknown>, key: string, fallback: string = ""): string {
  return String(body[key] ?? fallback).trim();
}

/**
 * Extract number field from body with default value
 */
export function num(body: Record<string, unknown>, key: string, fallback: number = 0): number {
  const v = Number(body[key]);
  return isNaN(v) ? fallback : v;
}
