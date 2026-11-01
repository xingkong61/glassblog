import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { countWords, getPost, isSafeSlug, listPosts, readingMinutesOf } from "@/lib/content";

let root: string;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "gb-content-"));
  process.env.GLASSBLOG_ROOT = root;
  mkdirSync(path.join(root, "content", "posts"), { recursive: true });
});

afterEach(() => {
  delete process.env.GLASSBLOG_ROOT;
  rmSync(root, { recursive: true, force: true });
});

function writePost(name: string, frontmatter: string, body = "正文"): void {
  writeFileSync(path.join(root, "content", "posts", name), `---\n${frontmatter}\n---\n\n${body}\n`, "utf8");
}

describe("内容读取层", () => {
  it("列出文章并按日期倒序", () => {
    writePost("a.md", 'title: 旧文\ndate: 2026-01-01\ntags: [x]');
    writePost("b.md", 'title: 新文\ndate: 2026-06-01');
    const posts = listPosts();
    expect(posts.map((p) => p.slug)).toEqual(["b", "a"]);
    expect(posts[0].title).toBe("新文");
  });

  it("草稿默认不出现，显式开关才可见", () => {
    writePost("draft.md", 'title: 草稿\ndate: 2026-05-01\ndraft: true');
    expect(listPosts()).toHaveLength(0);
    expect(listPosts({ includeDrafts: true })).toHaveLength(1);
    expect(getPost("draft", { includeDrafts: true })).not.toBeNull();
    expect(getPost("draft")).toBeNull(); // 默认按公开语义，草稿不可见
  });

  it("损坏的文件被跳过而不是崩溃", () => {
    writeFileSync(path.join(root, "content", "posts", "broken.md"), "\uffff\u0000 不完整的 YAML: [", "utf8");
    writePost("ok.md", "title: 正常");
    const posts = listPosts();
    expect(posts.map((p) => p.slug)).toContain("ok");
  });

  it("缺 frontmatter 字段时给默认值（标题=文件名，日期=今天）", () => {
    writePost("bare.md", "will: not parse", "# 只有正文");
    const p = getPost("bare")!;
    expect(p.title).toBe("bare");
    expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(p.tags).toEqual([]);
    expect(p.draft).toBe(false);
  });

  it("路径穿越被拒绝", () => {
    expect(isSafeSlug("../etc/passwd")).toBe(false);
    expect(isSafeSlug("a/b")).toBe(false);
    expect(isSafeSlug("a\\b")).toBe(false);
    expect(getPost("../secrets")).toBeNull();
    expect(isSafeSlug("正常-中文-slug_1.0")).toBe(true); // 合法 slug 不被误伤
    expect(getPost("正常-中文-slug_1.0")).toBeNull(); // 不存在时返回 null 但不抛错
  });

  it("字数与阅读时长估算", () => {
    expect(countWords("hello 世界 \n 两次")).toBe(9);
    expect(readingMinutesOf(0)).toBe(1);
    expect(readingMinutesOf(1200)).toBe(3);
  });
});
