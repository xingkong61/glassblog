// SEO 构造工具：canonical 与 JSON-LD 结构化数据。
// siteUrl 未配置时降级：不输出绝对 URL 字段，其余字段仍有效。
import type { PostFull, PostMeta, SiteConfig } from "./types";

export function siteBase(site: Pick<SiteConfig, "siteUrl">): string {
  return site.siteUrl.trim().replace(/\/$/, "");
}

export function postUrl(site: Pick<SiteConfig, "siteUrl">, slug: string): string | undefined {
  const base = siteBase(site);
  if (!base) return undefined;
  return `${base}/posts/${encodeURIComponent(slug)}`;
}

export function absoluteUrl(site: Pick<SiteConfig, "siteUrl">, url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const base = siteBase(site);
  if (!base) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function websiteJsonLd(site: SiteConfig): Record<string, unknown> {
  const base = siteBase(site);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.siteName,
    description: site.description,
    inLanguage: "zh-CN",
    ...(base ? { url: base } : {}),
  };
}

export function postJsonLd(site: SiteConfig, post: PostFull): Record<string, unknown> {
  const url = postUrl(site, post.slug);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    inLanguage: "zh-CN",
    wordCount: post.wordCount,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: site.author },
    ...(url ? { url, mainEntityOfPage: url } : {}),
    ...(post.cover ? { image: absoluteUrl(site, post.cover) } : {}),
    ...(post.tags.length > 0 ? { keywords: post.tags.join(",") } : {}),
  };
}

export function breadcrumbJsonLd(site: SiteConfig, post: PostMeta): Record<string, unknown> {
  const base = siteBase(site);
  const url = postUrl(site, post.slug);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: site.siteName, ...(base ? { item: base } : {}) },
      { "@type": "ListItem", position: 2, name: post.title, ...(url ? { item: url } : {}) },
    ],
  };
}
