import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "xt_admin_session";
const DEFAULT_ADMIN_SESSION_TOKEN = "xt-admin-dev";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin API routes (except login)
  if (pathname.startsWith("/api/admin/") && pathname !== "/api/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const expected = process.env.ADMIN_SESSION_TOKEN ?? DEFAULT_ADMIN_SESSION_TOKEN;

    if (token !== expected) {
      return NextResponse.json(
        { error: "未授权，请先登录管理后台" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"]
};
