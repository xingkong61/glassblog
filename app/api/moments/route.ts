import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { listMomentsFull } from "@/lib/content";
import { MomentPayload, saveMoment } from "@/lib/posts-io";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await authGuard();
  if (guard) return guard;
  return NextResponse.json({ moments: listMomentsFull() });
}

export async function POST(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;
  try {
    const body = (await req.json()) as MomentPayload;
    const { slug } = saveMoment(body);
    return NextResponse.json({ ok: true, slug });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "保存失败" }, { status: 400 });
  }
}
