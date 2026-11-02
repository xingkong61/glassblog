import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicWidget from "@/components/MusicWidget";
import AIAssistant from "@/components/AIAssistant";
import SiteEffects from "@/components/effects/SiteEffects";
import { getSiteConfig, isAiConfigured } from "@/lib/settings";
import { getLatestDigest } from "@/lib/content";

// 系统字体栈：避免构建期拉取 Google Fonts（国内网络不稳定）
const fontStack =
  'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

export async function generateMetadata(): Promise<Metadata> {
  const site = getSiteConfig();
  const base = site.siteUrl.trim().replace(/\/$/, "");
  return {
    metadataBase: base ? new URL(base) : undefined,
    title: {
      default: `${site.siteName} · ${site.subtitle}`,
      template: `%s · ${site.siteName}`,
    },
    description: site.description,
    icons: { icon: "/icon.svg" },
    alternates: base ? { canonical: base } : undefined,
    openGraph: {
      type: "website",
      siteName: site.siteName,
      title: `${site.siteName} · ${site.subtitle}`,
      description: site.description,
      images: [site.avatar],
    },
    twitter: {
      card: "summary",
      title: `${site.siteName} · ${site.subtitle}`,
      description: site.description,
      images: [site.avatar],
    },
  };
}

// 主题防闪烁：首帧前根据 localStorage/系统偏好挂 .dark
const themeScript = `(function(){try{var t=localStorage.getItem("gb-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = getSiteConfig();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased" style={{ fontFamily: fontStack }}>
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <SiteEffects />
        <Navbar siteName={site.siteName} showDigests={Boolean(getLatestDigest())} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
        <Footer />
        {site.analytics.trim() ? (
          <Script id="site-analytics" strategy="afterInteractive">
            {site.analytics}
          </Script>
        ) : null}
        {site.music.enabled && site.music.playlist.length > 0 ? (
          <MusicWidget playlist={site.music.playlist} />
        ) : null}
        <AIAssistant
          name={site.ai.name}
          greeting={site.ai.greeting}
          enabled={site.ai.enabled && isAiConfigured()}
        />
      </body>
    </html>
  );
}
