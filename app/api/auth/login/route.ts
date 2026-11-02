import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isCloudMode, isValidToken, makeToken, verifyPassword } from "@/lib/auth";
import { loginLockRemaining, recordLoginFailure, resetLoginFailures } from "@/lib/login-guard";
import { cookies } from "next/headers";

// 密码错误时的固定延迟：拖慢暴力破解（5 次失败累计约 3.5 秒）
const FAILURE_DELAY_MS = 700;

export async function POST(req: NextRequest) {
  if (isCloudMode()) return NextResponse.json({ error: "Not Found" }, { status: 404 });

  // 已登录则直接放行
  const store = await cookies();
  if (isValidToken(store.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: true });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const lockedMs = loginLockRemaining(ip);
  if (lockedMs > 0) {
    const minutes = Math.ceil(lockedMs / 60_000);
    return NextResponse.json({ error: `密码错误次数过多，请 ${minutes} 分钟后再试` }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = String(body.password ?? "");
  } catch {
    /* 忽略解析失败 */
  }

  if (!verifyPassword(password)) {
    recordLoginFailure(ip);
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    const remainMs = loginLockRemaining(ip);
    if (remainMs > 0) {
      const minutes = Math.ceil(remainMs / 60_000);
      return NextResponse.json(
        { error: `密码错误次数过多，已锁定 ${minutes} 分钟` },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: "密码不对，再想想？" }, { status: 401 });
  }

  resetLoginFailures(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 本地工具，7 天免登录
  });
  return res;
}
