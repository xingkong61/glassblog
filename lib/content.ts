// 内容层：content/ 目录下的 Markdown 即数据。所有函数带容错——单篇损坏不影响整站。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { formatDate } from "./format";
import type { DigestFull, DigestMeta, MomentFull, MomentMeta, PostFull, PostMeta } from "./types";

// 根目录可被环境变量覆盖（测试隔离用），默认取进程工作目录
export function getRoot(): string {
  return process.env.GLASSBLOG_ROOT ?? process.cwd();
}

function postsDir(): string {
  return path.join(getRoot(), "content", "posts");
}

function momentsDir(): string {
  return path.join(getRoot(), "content", "moments");
}

function digestsDir(): string {
  return path.join(getRoot(), "content", "digests");
}

function aboutFile(): string {
  return path.join(getRoot(), "content", "about.md");
}

export function isSafeSlug(slug: string): boolean {
  return (
    slug.length > 0 &&
    !slug.includes("\\") &&
    !slug.includes("/") &&
    !slug.includes("..") &&
    !/[\u0000-\u001f]/.test(slug)
  );
}

export function slugifyFilename(name: string): string {
  return name.replace(/\.md$/i, "");
}

export function countWords(text: string): number {
  // 中英混合近似：去掉空白后按字符计数
  return text.replace(/\s+/g, "").length;
}

export function readingMinutesOf(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 400));
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function strArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim());
}

interface RawDoc {
  slug: string;
  data: Record<string, unknown>;
  content: string;
  mtime: Date;
}

function readDoc(dir: string, file: string): RawDoc | null {
  try {
    const full = path.join(dir, file);
    const raw = fs.readFileSync(full, "utf8");
    const stat = fs.statSync(full);
    const parsed = matter(raw);
    return {
      slug: slugifyFilename(file),
      data: (parsed.data ?? {}) as Record<string, unknown>,
      content: parsed.content,
      mtime: stat.mtime,
    };
  } catch (err) {
    console.warn(`[glassblog] 跳过无法解析的内容文件: ${file}`, err);
    return null;
  }
}

function toPostMeta(doc: RawDoc): PostMeta {
  const wordCount = countWords(doc.content);
  const date = str(doc.data.date, formatDate(doc.mtime));
  const summary = str(doc.data.summary, doc.content.replace(/[#>*`\-\[\]]/g, "").slice(0, 80));
  const cover = typeof doc.data.cover === "string" && doc.data.cover.trim() ? doc.data.cover.trim() : undefined;
  return {
    slug: doc.slug,
    title: str(doc.data.title, doc.slug),
    date,
    tags: strArray(doc.data.tags),
    draft: doc.data.draft === true,
    pinned: doc.data.pinned === true,
    summary,
    cover,
    wordCount,
    readingMinutes: readingMinutesOf(wordCount),
  };
}

function listMarkdownFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((f) => /\.md$/i.test(f));
  } catch {
    return []; // 目录不存在视为空
  }
}

export function listPosts(opts: { includeDrafts?: boolean } = {}): PostMeta[] {
  const posts: PostMeta[] = [];
  for (const file of listMarkdownFiles(postsDir())) {
    const doc = readDoc(postsDir(), file);
    if (!doc) continue;
    const meta = toPostMeta(doc);
    if (meta.draft && !opts.includeDrafts) continue;
    posts.push(meta);
  }
  // 置顶优先，其次按日期倒序
  return posts.sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug < b.slug ? 1 : -1),
  );
}

export function getPost(slug: string, opts: { includeDrafts?: boolean } = {}): PostFull | null {
  if (!isSafeSlug(slug)) return null;
  const file = `${slug}.md`;
  if (!listMarkdownFiles(postsDir()).some((f) => f.toLowerCase() === file.toLowerCase())) return null;
  const doc = readDoc(postsDir(), file);
  if (!doc) return null;
  const meta = toPostMeta(doc);
  if (meta.draft && !opts.includeDrafts) return null;
  return { ...meta, content: doc.content };
}

export function getAdjacentPosts(slug: string): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = listPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    // prev = 更新一篇（列表中前一个）
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  };
}

// 相关文章：按标签重合度排序，重合相同则新文优先；无重合返回空
export function getRelatedPosts(slug: string, limit = 4): PostMeta[] {
  const posts = listPosts();
  const current = posts.find((p) => p.slug === slug);
  if (!current || current.tags.length === 0) return [];
  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({ post: p, score: p.tags.filter((t) => current.tags.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .slice(0, limit)
    .map((x) => x.post);
}

export function getArchive(): Array<{ year: number; posts: PostMeta[] }> {
  const groups = new Map<number, PostMeta[]>();
  for (const p of listPosts()) {
    const year = parseInt(p.date.slice(0, 4), 10) || new Date().getFullYear();
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(p);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, posts]) => ({ year, posts }));
}

export function getTagCounts(): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const p of listPosts()) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

// ---------- 说说 ----------

function toMomentMeta(doc: RawDoc): MomentMeta {
  const wordCount = countWords(doc.content);
  return {
    slug: doc.slug,
    date: str(doc.data.date, formatDate(doc.mtime)),
    mood: str(doc.data.mood, "日常"),
    wordCount,
  };
}

export function listMoments(): MomentMeta[] {
  const list: MomentMeta[] = [];
  for (const file of listMarkdownFiles(momentsDir())) {
    const doc = readDoc(momentsDir(), file);
    if (!doc) continue;
    list.push(toMomentMeta(doc));
  }
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function listMomentsFull(): MomentFull[] {
  const list: MomentFull[] = [];
  for (const file of listMarkdownFiles(momentsDir())) {
    const doc = readDoc(momentsDir(), file);
    if (!doc) continue;
    list.push({ ...toMomentMeta(doc), content: doc.content });
  }
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getMoment(slug: string): MomentFull | null {
  if (!isSafeSlug(slug)) return null;
  const doc = readDoc(momentsDir(), `${slug}.md`);
  if (!doc) return null;
  return { ...toMomentMeta(doc), content: doc.content };
}

// ---------- 每日选刊 ----------

function toDigestMeta(doc: RawDoc): DigestMeta {
  return {
    slug: doc.slug,
    title: str(doc.data.title, `每日选刊 · ${formatDate(doc.mtime)}`),
    date: str(doc.data.date, formatDate(doc.mtime)),
    draft: doc.data.draft === true,
    wordCount: countWords(doc.content),
  };
}

export function listDigests(opts: { includeDrafts?: boolean } = {}): DigestMeta[] {
  const list: DigestMeta[] = [];
  for (const file of listMarkdownFiles(digestsDir())) {
    const doc = readDoc(digestsDir(), file);
    if (!doc) continue;
    const meta = toDigestMeta(doc);
    if (meta.draft && !opts.includeDrafts) continue;
    list.push(meta);
  }
  return list.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getDigest(slug: string, opts: { includeDrafts?: boolean } = {}): DigestFull | null {
  if (!isSafeSlug(slug)) return null;
  const file = `${slug}.md`;
  if (!listMarkdownFiles(digestsDir()).some((f) => f.toLowerCase() === file.toLowerCase())) return null;
  const doc = readDoc(digestsDir(), file);
  if (!doc) return null;
  const meta = toDigestMeta(doc);
  if (meta.draft && !opts.includeDrafts) return null;
  return { ...meta, content: doc.content };
}

// 最新一期已发布选刊（首页卡片用）
export function getLatestDigest(): DigestFull | null {
  const latest = listDigests()[0];
  if (!latest) return null;
  return getDigest(latest.slug);
}

// ---------- 关于页 ----------

export function getAboutMarkdown(): string {
  try {
    return matter(fs.readFileSync(aboutFile(), "utf8")).content;
  } catch {
    return "关于页面尚未填写。到本地后台「设置」里写点什么吧。";
  }
}

// ---------- 全站统计（等级系统用） ----------

export function getStats(): { posts: number; moments: number; words: number } {
  const posts = listPosts();
  const moments = listMoments();
  return {
    posts: posts.length,
    moments: moments.length,
    words: posts.reduce((s, p) => s + p.wordCount, 0) + moments.reduce((s, m) => s + m.wordCount, 0),
  };
}
