import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { authGuard } from "@/lib/api-guard";
import { getRoot } from "@/lib/content";

export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const guard = await authGuard();
  if (guard) return guard;

  let file: File;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (!(f instanceof File)) return NextResponse.json({ error: "没有收到文件" }, { status: 400 });
    file = f;
  } catch {
    return NextResponse.json({ error: "上传数据无效" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "仅支持图片文件" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "图片超过 10MB 上限" }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    // 压缩：长边 ≤1920，转 webp；动图保持原样直存
    const isGif = file.type === "image/gif";
    let out: Buffer;
    let ext: string;
    if (isGif) {
      out = buf;
      ext = "gif";
    } else {
      out = await sharp(buf)
        .rotate()
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      ext = "webp";
    }

    const name = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}.${ext}`;
    const dir = path.join(getRoot(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), out);

    return NextResponse.json({ ok: true, url: `/uploads/${name}`, bytes: out.length });
  } catch (err) {
    console.error("[glassblog] 图片处理失败", err);
    return NextResponse.json({ error: "图片处理失败，文件可能已损坏" }, { status: 400 });
  }
}
