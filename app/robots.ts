import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/settings";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteConfig();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: site.siteUrl ? `${site.siteUrl.replace(/\/$/, "")}/sitemap.xml` : undefined,
  };
}
