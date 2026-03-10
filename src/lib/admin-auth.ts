import { cookies } from "next/headers";

const ADMIN_COOKIE = "xt_admin_session";
const DEFAULT_ADMIN_SESSION_TOKEN = "xt-admin-dev";

function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? DEFAULT_ADMIN_SESSION_TOKEN;
}

export async function isAdminAuthed() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  return token === getAdminSessionToken();
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, getAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}
