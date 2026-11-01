import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { publishChanges } from "@/lib/git";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;
  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  const result = publishChanges(dryRun);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
