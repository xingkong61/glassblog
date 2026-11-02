import { describe, expect, it } from "vitest";
import { absoluteUrl, breadcrumbJsonLd, postJsonLd, postUrl, siteBase, websiteJsonLd } from "@/lib/seo";
import type { PostFull, SiteConfig } from "@/lib/types";

const site: SiteConfig = {
  siteName: "玻璃小栈",
  siteUrl: "https://www.xingkongly.top/",
  subtitle: "一块会发光的毛玻璃",
  description: "记录技术、生活与灵感的个人博客",
  author: "博主",
  avatar: "/avatar.png",
  social: { github: "", bilibili: "", email: "", xiaohongshu: "" },
  icp: "",
  footerText: "",
  analytics: "",
  levelSystem: false,
  music: { enabled: false, playlist: [] },
  ai: { enabled: false, name: "小玻", prompt: "", greeting: "" },
  ads: { inArticle: "", sidebar: "" },
  subscribe: { enabled: true, title: "订阅更新", note: "通知" },
  comments: {
    provider: "none",
    giscus: {
      repo: "",
      repoId: "",
      category: "",
      categoryId: "",
      mapping: "pathname",
      reactions: true,
      inputPosition: "top",
    },
  },
};

const post: PostFull = {
  slug: "hello",
  title: "你好，玻璃小栈",
  date: "2026-11-01",
  tags: ["AI", "博客"],
  draft: false,
  pinned: false,
  summary: "一篇测试文章",
  cover: "/uploads/a.webp",
  wordCount: 100,
  readingMinutes: 1,
  content: "正文",
};

describe("SEO 构造", () => {
  it("siteBase 去尾部斜杠，空值返回空串", () => {
    expect(siteBase(site)).toBe("https://www.xingkongly.top");
    expect(siteBase({ siteUrl: "" })).toBe("");
  });

  it("postUrl：siteUrl 为空时返回 undefined", () => {
    expect(postUrl({ siteUrl: "" }, "hello")).toBeUndefined();
    expect(postUrl(site, "hello")).toBe("https://www.xingkongly.top/posts/hello");
  });

  it("absoluteUrl：相对路径补全域名，绝对链接原样返回", () => {
    expect(absoluteUrl(site, "/uploads/a.webp")).toBe("https://www.xingkongly.top/uploads/a.webp");
    expect(absoluteUrl(site, "https://cdn.example.com/b.png")).toBe("https://cdn.example.com/b.png");
  });

  it("postJsonLd 含核心字段、绝对图片与关键词", () => {
    const ld = postJsonLd(site, post);
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe("你好，玻璃小栈");
    expect(ld.url).toBe("https://www.xingkongly.top/posts/hello");
    expect(ld.mainEntityOfPage).toBe("https://www.xingkongly.top/posts/hello");
    expect(ld.image).toBe("https://www.xingkongly.top/uploads/a.webp");
    expect(ld.keywords).toBe("AI,博客");
  });

  it("websiteJsonLd：无 siteUrl 时降级不输出 url", () => {
    const ld = websiteJsonLd({ ...site, siteUrl: "" });
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.url).toBeUndefined();
  });

  it("breadcrumbJsonLd 生成两级列表", () => {
    const ld = breadcrumbJsonLd(site, post);
    const items = ld.itemListElement as Array<{ position: number; item?: string }>;
    expect(items).toHaveLength(2);
    expect(items[0].item).toBe("https://www.xingkongly.top");
    expect(items[1].item).toBe("https://www.xingkongly.top/posts/hello");
  });
});
