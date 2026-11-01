import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { deleteMoment } from "@/lib/posts-io";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await authGuard();
  if (guard) return guard;
  const { slug } = await params;
  const ok = deleteMoment(slug);
  if (!ok) return NextResponse.json({ error: "说说不存在" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
