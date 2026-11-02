import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getDigest, getLatestDigest, listDigests } from "@/lib/content";
import { buildDigestPrompt, parseArxivEntries } from "@/lib/digest";
import { deleteDigest, saveDigest } from "@/lib/posts-io";

const ARXIV_FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>ArXiv Query</title>
  <entry>
    <id>http://arxiv.org/abs/2611.00001v1</id>
    <title>  Scaling Laws for
  Glassy Blogs  </title>
    <summary>  We study
 scaling laws.  </summary>
    <published>2026-11-01T00:00:00Z</published>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2611.00002v1</id>
    <title>Another Paper</title>
    <summary>Abstract here.</summary>
    <published>2026-10-31T00:00:00Z</published>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/broken</id>
    <summary>没有标题的条目应被跳过</summary>
  </entry>
</feed>`;

describe("arXiv 解析", () => {
  it("按 entry 切块并折叠空白，缺标题的跳过", () => {
    const items = parseArxivEntries(ARXIV_FIXTURE);
    expect(items).toHaveLength(2);
    expect(items[0].kind).toBe("paper");
    expect(items[0].title).toBe("Scaling Laws for Glassy Blogs");
    expect(items[0].summary).toBe("We study scaling laws.");
    expect(items[0].url).toBe("http://arxiv.org/abs/2611.00001v1");
    expect(items[0].source).toBe("arXiv");
    expect(items[1].title).toBe("Another Paper");
  });

  it("空响应返回空数组", () => {
    expect(parseArxivEntries("<feed></feed>")).toEqual([]);
  });
});

describe("选刊提示词", () => {
  it("包含素材与板块要求", () => {
    const prompt = buildDigestPrompt([
      { kind: "news", title: "News A", summary: "s1", source: "Tavily" },
      { kind: "paper", title: "Paper B", summary: "s2", source: "arXiv" },
    ]);
    expect(prompt).toContain("[新闻] News A");
    expect(prompt).toContain("[论文] Paper B");
    expect(prompt).toContain("AI 动态");
    expect(prompt).toContain("论文雷达");
    expect(prompt).toContain("不要编造");
  });
});

describe("选刊读写层", () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "gb-digest-"));
    process.env.GLASSBLOG_ROOT = root;
  });

  afterEach(() => {
    delete process.env.GLASSBLOG_ROOT;
    rmSync(root, { recursive: true, force: true });
  });

  it("保存/列出/读取/删除全流程，草稿默认不可见", () => {
    const { slug } = saveDigest({
      slug: "",
      title: "每日选刊 · 2026-11-02",
      date: "2026-11-02",
      draft: true,
      content: "## AI 动态\n1. **测试条目** —— 摘要。",
    });
    expect(slug).toBe("digest-2026-11-02");

    expect(listDigests()).toHaveLength(0); // 草稿默认隐藏
    expect(listDigests({ includeDrafts: true })).toHaveLength(1);
    expect(getDigest(slug)).toBeNull();

    const draft = getDigest(slug, { includeDrafts: true });
    expect(draft?.title).toBe("每日选刊 · 2026-11-02");
    expect(draft?.content).toContain("测试条目");

    // 发布后可见，且成为最新一期
    saveDigest({ slug, title: "每日选刊 · 2026-11-02", date: "2026-11-02", draft: false, content: "## AI 动态\n1. **测试条目** —— 摘要。" });
    expect(listDigests()).toHaveLength(1);
    expect(getLatestDigest()?.slug).toBe(slug);

    expect(deleteDigest(slug)).toBe(true);
    expect(listDigests({ includeDrafts: true })).toHaveLength(0);
  });

  it("空标题/空正文被拒绝", () => {
    expect(() => saveDigest({ slug: "", title: "  ", date: "2026-11-02", draft: true, content: "x" })).toThrow();
    expect(() => saveDigest({ slug: "", title: "t", date: "2026-11-02", draft: true, content: "  " })).toThrow();
  });

  it("路径穿越被拒绝", () => {
    expect(deleteDigest("../secrets")).toBe(false);
    expect(getDigest("../secrets", { includeDrafts: true })).toBeNull();
  });
});
