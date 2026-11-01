import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteConfig();
  if (!site.siteUrl) return [];

  const base = site.siteUrl.replace(/\/$/, "");
  const pages = ["", "/archive", "/tags", "/moments", "/about"].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const posts = listPosts().map((p) => ({
    url: `${base}/posts/${encodeURIComponent(p.slug)}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...pages, ...posts];
}
