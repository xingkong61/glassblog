import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { verifyPassword } from "@/lib/auth";
import { hashPassword, saveSecrets } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;
  try {
    const body = (await req.json()) as { current?: string; next?: string };
    const current = String(body.current ?? "");
    const next = String(body.next ?? "");
    if (next.length < 6) {
      return NextResponse.json({ error: "新密码至少 6 位" }, { status: 400 });
    }
    if (!verifyPassword(current)) {
      return NextResponse.json({ error: "当前密码不对" }, { status: 400 });
    }
    saveSecrets({ adminPasswordHash: hashPassword(next) });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "请求无效" }, { status: 400 });
  }
}
