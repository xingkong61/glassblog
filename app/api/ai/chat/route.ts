import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, aiRuntimeConfig } from "@/lib/settings";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// 公开接口（前台访客可用）：仅当站长启用且配好 key 时才工作，密钥永不外传
export async function POST(req: NextRequest) {
  const site = getSiteConfig();
  const ai = aiRuntimeConfig();

  if (!site.ai.enabled || !ai.apiKey || !ai.baseUrl || !ai.model) {
    return NextResponse.json({ error: "助理未启用" }, { status: 404 });
  }

  let message = "";
  let history: ChatMessage[] = [];
  try {
    const body = (await req.json()) as { message?: string; history?: ChatMessage[] };
    message = String(body.message ?? "").slice(0, 2000);
    history = Array.isArray(body.history)
      ? body.history
          .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-8) // 最多带最近 8 条上下文
          .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }))
      : [];
  } catch {
    return NextResponse.json({ error: "请求无效" }, { status: 400 });
  }
  if (!message.trim()) {
    return NextResponse.json({ error: "想聊点什么呀？" }, { status: 400 });
  }

  const systemPrompt = [
    site.ai.prompt || "你是博客里的猫咪助理，说话简短可爱。",
    `这是博客「${site.siteName}」（${site.subtitle}），博主是 ${site.author}。回答保持简短（一般不超过 150 字），用中文。`,
  ].join("\n");

  try {
    const res = await fetch(`${ai.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ai.apiKey}`,
      },
      body: JSON.stringify({
        model: ai.model,
        messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
        temperature: 0.8,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error("[glassblog] AI 上游错误", res.status);
      return NextResponse.json({ error: "助理打盹儿了，稍后再试" }, { status: 502 });
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return NextResponse.json({ error: "助理没吭声，再问一次？" }, { status: 502 });
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[glassblog] AI 请求失败", err);
    return NextResponse.json({ error: "网络不太顺畅，稍后再试" }, { status: 502 });
  }
}
