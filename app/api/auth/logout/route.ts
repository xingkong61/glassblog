import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isCloudMode } from "@/lib/auth";

export async function POST() {
  if (isCloudMode()) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
