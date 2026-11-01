import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { getAboutMarkdown } from "@/lib/content";
import { saveAbout } from "@/lib/posts-io";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await authGuard();
  if (guard) return guard;
  return NextResponse.json({ content: getAboutMarkdown() });
}

export async function PUT(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;
  try {
    const body = (await req.json()) as { content?: string };
    saveAbout(String(body.content ?? ""));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 400 });
  }
}
