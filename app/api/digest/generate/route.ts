import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { getDigest } from "@/lib/content";
import { buildDigest } from "@/lib/digest";
import { formatDate } from "@/lib/format";
import { saveDigest } from "@/lib/posts-io";

export const dynamic = "force-dynamic";

// 生成今日选刊：抓素材 + LLM 汇总，落成当天草稿，站长审核后发布
export async function POST(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;

  const date = formatDate(new Date());
  const slug = `digest-${date}`;
  if (getDigest(slug, { includeDrafts: true })) {
    return NextResponse.json(
      { error: "今天的选刊已存在（可能是草稿）。请先在列表里编辑或删除，再重新生成" },
      { status: 409 },
    );
  }

  let topic = "AI 大模型 最新进展";
  try {
    const body = (await req.json()) as { topic?: string };
    if (typeof body.topic === "string" && body.topic.trim()) topic = body.topic.trim().slice(0, 100);
  } catch {
    /* 无 body 时用默认主题 */
  }

  try {
    const { markdown, sources } = await buildDigest(topic);
    saveDigest({ slug, title: `每日选刊 · ${date}`, date, draft: true, content: markdown });
    return NextResponse.json({ ok: true, slug, sources });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "生成失败" }, { status: 500 });
  }
}
