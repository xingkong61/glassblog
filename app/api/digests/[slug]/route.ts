import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { getDigest } from "@/lib/content";
import { DigestPayload, deleteDigest, saveDigest } from "@/lib/posts-io";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await authGuard();
  if (guard) return guard;
  const { slug } = await params;
  const digest = getDigest(slug, { includeDrafts: true });
  if (!digest) return NextResponse.json({ error: "选刊不存在" }, { status: 404 });
  return NextResponse.json({ digest });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const guard = await authGuard();
  if (guard) return guard;
  const { slug } = await params;
  try {
    const body = (await req.json()) as DigestPayload;
    if (body.slug && body.slug !== slug) {
      return NextResponse.json({ error: "不支持修改别名，如需改名请新建后删除旧刊" }, { status: 400 });
    }
    saveDigest({ ...body, slug });
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "保存失败" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await authGuard();
  if (guard) return guard;
  const { slug } = await params;
  const ok = deleteDigest(slug);
  if (!ok) return NextResponse.json({ error: "选刊不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
