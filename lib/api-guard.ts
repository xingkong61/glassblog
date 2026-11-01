// API 守卫：云模式下一律 404（不给探测机会），本地模式再校验登录态
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isCloudMode, isValidToken } from "./auth";

export async function authGuard(): Promise<NextResponse | null> {
  if (isCloudMode()) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  const store = await cookies();
  if (!isValidToken(store.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  return null;
}
