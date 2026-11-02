import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { listSubscribers, removeSubscriber } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await authGuard();
  if (guard) return guard;
  return NextResponse.json({ subscribers: listSubscribers() });
}

export async function DELETE(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;
  const email = new URL(req.url).searchParams.get("email") ?? "";
  const ok = removeSubscriber(email);
  if (!ok) return NextResponse.json({ error: "订阅者不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
