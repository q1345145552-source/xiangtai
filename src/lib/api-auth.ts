import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";

/**
 * Unified admin authentication guard for API routes.
 * Returns null if authenticated, or a 401 response if not.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "未授权，请先登录管理后台" }, { status: 401 });
  }
  return null;
}

/**
 * Helper to parse and validate required fields from request body.
 */
export function parseBody(body: Record<string, unknown>, fields: string[]): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const field of fields) {
    const val = body[field];
    if (val === undefined || val === null || String(val).trim() === "") {
      missing.push(field);
    }
  }
  return { valid: missing.length === 0, missing };
}
