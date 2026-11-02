import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deleteMoment, deletePost, saveAbout, saveMoment, savePost, sanitizeSlug } from "@/lib/posts-io";
import { getPost, listMoments, listPosts } from "@/lib/content";

let root: string;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "gb-io-"));
  process.env.GLASSBLOG_ROOT = root;
});

afterEach(() => {
  delete process.env.GLASSBLOG_ROOT;
  rmSync(root, { recursive: true, force: true });
});

describe("文章写入", () => {
  it("保存→列表可见→读回字段一致→删除", () => {
    const { slug } = savePost({
      slug: "",
      title: "我的新文章",
      date: "2026-11-01",
      tags: ["测试"],
      draft: false,
      summary: "摘要",
      content: "# 正文\n内容",
    });
    expect(slug).toBe("我的新文章");
    expect(listPosts({ includeDrafts: true })).toHaveLength(1);
    const post = getPost("我的新文章", { includeDrafts: true })!;
    expect(post.title).toBe("我的新文章");
    expect(post.tags).toEqual(["测试"]);
    expect(post.content).toContain("正文");
    expect(deletePost(slug)).toBe(true);
    expect(listPosts({ includeDrafts: true })).toHaveLength(0);
  });

  it("slug 自动清洗：空白转连字符、非法字符剔除", () => {
    expect(sanitizeSlug("  Hello World! ")).toBe("Hello-World");
    expect(sanitizeSlug("a/b\\c:d")).toBe("abcd");
  });

  it("重名保存等于更新（覆盖写）", () => {
    savePost({ slug: "same", title: "v1", date: "2026-01-01", tags: [], draft: false, summary: "", content: "1" });
    savePost({ slug: "same", title: "v2", date: "2026-01-02", tags: [], draft: false, summary: "", content: "2" });
    expect(listPosts({ includeDrafts: true })).toHaveLength(1);
    expect(getPost("same", { includeDrafts: true })!.title).toBe("v2");
  });

  it("空标题被拒绝", () => {
    expect(() =>
      savePost({ slug: "", title: "  ", date: "2026-01-01", tags: [], draft: false, summary: "", content: "x" }),
    ).toThrow(/标题/);
  });

  it("置顶字段保存后可读回，省略时默认不置顶", () => {
    savePost({ slug: "pin", title: "置顶文", date: "2026-01-01", tags: [], draft: false, pinned: true, summary: "", content: "x" });
    savePost({ slug: "plain", title: "普通文", date: "2026-01-02", tags: [], draft: false, summary: "", content: "x" });
    expect(getPost("pin", { includeDrafts: true })!.pinned).toBe(true);
    expect(getPost("plain", { includeDrafts: true })!.pinned).toBe(false);
  });
});

describe("说说与关于页", () => {
  it("说说保存→列表→删除", () => {
    saveMoment({ slug: "", date: "2026-11-01 10:00", mood: "开心", content: "第一条说说" });
    expect(listMoments()).toHaveLength(1);
    expect(listMoments()[0].mood).toBe("开心");
    expect(deleteMoment(listMoments()[0].slug)).toBe(true);
  });

  it("关于页保存后可读", async () => {
    saveAbout("## 自定义关于\n内容");
    const { getAboutMarkdown } = await import("@/lib/content");
    expect(getAboutMarkdown()).toContain("自定义关于");
  });
});
