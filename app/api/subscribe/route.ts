import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getSiteConfig } from "@/lib/settings";
import { addSubscriber } from "@/lib/subscribers";

export const dynamic = "force-dynamic";

// 公开接口：单 IP 10 分钟最多 3 次，防脚本灌库
const LIMIT = 3;
const WINDOW_MS = 10 * 60_000;

export async function POST(req: NextRequest) {
  const site = getSiteConfig();
  if (!site.subscribe.enabled) {
    return NextResponse.json({ error: "订阅暂未开放" }, { status: 404 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`subscribe:${ip}`, LIMIT, WINDOW_MS)) {
    return NextResponse.json({ error: "提交太频繁，过一会儿再试" }, { status: 429 });
  }

  let email = "";
  let honeypot = "";
  try {
    const body = (await req.json()) as { email?: string; website?: string };
    email = String(body.email ?? "");
    honeypot = String(body.website ?? "");
  } catch {
    return NextResponse.json({ error: "请求无效" }, { status: 400 });
  }

  // 蜜罐字段：真人看不到这个输入框，填了就是机器人——静默假装成功
  if (honeypot.trim()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { added } = addSubscriber(email, { source: "site" });
    return NextResponse.json({ ok: true, duplicate: !added });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "订阅失败" }, { status: 400 });
  }
}
