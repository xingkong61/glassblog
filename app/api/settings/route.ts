import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/api-guard";
import { getSiteConfig, isAiConfigured, readSecrets, saveSecrets, saveSiteConfig } from "@/lib/settings";
import type { Secrets, SiteConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await authGuard();
  if (guard) return guard;
  // 绝不回传密钥明文，只回传"是否已配置"
  const bed = readSecrets().imageBed;
  return NextResponse.json({
    site: getSiteConfig(),
    aiConfigured: isAiConfigured(),
    imageBed: { type: bed.type, apiUrl: bed.apiUrl, tokenConfigured: Boolean(bed.token) },
  });
}

export async function PUT(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;
  try {
    const body = (await req.json()) as { site?: Partial<SiteConfig>; secrets?: Partial<Secrets> };
    if (body.site) {
      if (typeof body.site !== "object") throw new Error("site 配置无效");
      saveSiteConfig(body.site as Record<string, unknown>);
    }
    if (body.secrets) {
      // 只允许更新 ai / imageBed / tavily 三块，防止越权改密码字段
      const patch: Record<string, unknown> = {};
      if (body.secrets.ai) patch.ai = body.secrets.ai;
      if (body.secrets.imageBed) patch.imageBed = body.secrets.imageBed;
      if (body.secrets.tavily) patch.tavily = body.secrets.tavily;
      saveSecrets(patch);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "保存失败" }, { status: 400 });
  }
}
