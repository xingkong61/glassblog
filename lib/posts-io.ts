// 内容写入层：后台保存/删除文章与说说。读取层在 lib/content.ts。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getRoot, isSafeSlug } from "./content";
import { sanitizeSlug } from "./format";

export { sanitizeSlug };

export interface PostPayload {
  slug: string; // 新建时可为空串，自动从标题生成
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
  summary: string;
  cover?: string;
  content: string;
}

function postDir(): string {
  return path.join(getRoot(), "content", "posts");
}

function momentsDir(): string {
  return path.join(getRoot(), "content", "moments");
}

function serialize(meta: Record<string, unknown>, content: string): string {
  return matter.stringify(content, meta);
}

export function savePost(payload: PostPayload): { slug: string } {
  if (!payload.title.trim()) throw new Error("标题不能为空");
  const slug = sanitizeSlug(payload.slug || payload.title);
  if (!isSafeSlug(slug)) throw new Error("文件名不合法，请改一个英文/数字的别名");

  const meta: Record<string, unknown> = {
    title: payload.title.trim(),
    date: payload.date,
    tags: payload.tags,
    draft: payload.draft,
    summary: payload.summary,
  };
  if (payload.cover) meta.cover = payload.cover;

  fs.mkdirSync(postDir(), { recursive: true });
  fs.writeFileSync(path.join(postDir(), `${slug}.md`), serialize(meta, payload.content), "utf8");
  return { slug };
}

export function deletePost(slug: string): boolean {
  if (!isSafeSlug(slug)) return false;
  const full = path.join(postDir(), `${slug}.md`);
  if (!fs.existsSync(full)) return false;
  fs.rmSync(full);
  return true;
}

export interface MomentPayload {
  slug: string; // 可为空串，自动按时间生成
  date: string;
  mood: string;
  content: string;
}

export function saveMoment(payload: MomentPayload): { slug: string } {
  const slug = sanitizeSlug(payload.slug || `m-${payload.date.replace(/[-: ]/g, "")}-${Math.floor(Math.random() * 1000)}`);
  if (!isSafeSlug(slug)) throw new Error("文件名不合法");
  if (!payload.content.trim()) throw new Error("说说内容不能为空");

  const meta = { date: payload.date, mood: payload.mood || "日常" };
  fs.mkdirSync(momentsDir(), { recursive: true });
  fs.writeFileSync(path.join(momentsDir(), `${slug}.md`), serialize(meta, payload.content), "utf8");
  return { slug };
}

export function deleteMoment(slug: string): boolean {
  if (!isSafeSlug(slug)) return false;
  const full = path.join(momentsDir(), `${slug}.md`);
  if (!fs.existsSync(full)) return false;
  fs.rmSync(full);
  return true;
}

export function saveAbout(content: string): void {
  const dir = path.join(getRoot(), "content");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "about.md"), content, "utf8");
}
