import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isCloudMode, isValidToken, makeToken, verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  if (isCloudMode()) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  // 已登录则直接放行
  const store = await cookies();
  if (isValidToken(store.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: true });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = String(body.password ?? "");
  } catch {
    /* 忽略解析失败 */
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "密码不对，再想想？" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 本地工具，7 天免登录
  });
  return res;
}
