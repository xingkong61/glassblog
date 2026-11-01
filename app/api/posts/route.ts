import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { listPosts } from "@/lib/content";
import { PostPayload, savePost } from "@/lib/posts-io";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await authGuard();
  if (guard) return guard;
  return NextResponse.json({ posts: listPosts({ includeDrafts: true }) });
}

export async function POST(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;
  try {
    const body = (await req.json()) as PostPayload;
    const { slug } = savePost(body);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "保存失败" }, { status: 400 });
  }
}
