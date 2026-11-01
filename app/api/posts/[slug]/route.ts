import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { getPost } from "@/lib/content";
import { PostPayload, deletePost, savePost } from "@/lib/posts-io";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await authGuard();
  if (guard) return guard;
  const { slug } = await params;
  const post = getPost(slug, { includeDrafts: true });
  if (!post) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await authGuard();
  if (guard) return guard;
  const { slug } = await params;
  try {
    const body = (await req.json()) as PostPayload;
    if (body.slug && body.slug !== slug) {
      return NextResponse.json({ error: "不支持修改别名，如需改名请新建后删除旧文" }, { status: 400 });
    }
    savePost({ ...body, slug });
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "保存失败" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await authGuard();
  if (guard) return guard;
  const { slug } = await params;
  const ok = deletePost(slug);
  if (!ok) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
