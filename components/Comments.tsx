"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import type { SiteConfig } from "@/lib/types";

type GiscusConfig = SiteConfig["comments"]["giscus"];

// giscus 评论：基于 GitHub Discussions 的零后端评论。
// 只在 provider=giscus 且 repo/repoId 都填了时渲染；主题跟随站点深浅色切换。
export default function Comments({ config }: { config: GiscusConfig }) {
  const enabled = Boolean(config.repo.trim() && config.repoId.trim());
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<"light" | "dark">("light");

  // 等挂载后读取真实主题再注入脚本，避免首帧用错配色
  useEffect(() => {
    const root = document.documentElement;
    const sync = (initial: boolean) => {
      const next: "light" | "dark" = root.classList.contains("dark") ? "dark" : "light";
      themeRef.current = next;
      setTheme(next);
      if (!initial) postTheme(next);
    };
    sync(true);
    const observer = new MutationObserver(() => sync(false));
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 站点切换主题时，通过 postMessage 让已加载的评论框同步换色
  function postTheme(next: "light" | "dark") {
    const iframe = wrapRef.current?.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme: next } } }, "https://giscus.app");
  }

  if (!enabled || !theme) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400">💬 评论</h2>
      <div ref={wrapRef} className="glass overflow-hidden p-2">
        <Script
          src="https://giscus.app/client.js"
          data-repo={config.repo}
          data-repo-id={config.repoId}
          {...(config.category ? { "data-category": config.category } : {})}
          {...(config.categoryId ? { "data-category-id": config.categoryId } : {})}
          data-mapping={config.mapping || "pathname"}
          data-strict="0"
          data-reactions-enabled={config.reactions ? "1" : "0"}
          data-emit-metadata="0"
          data-input-position={config.inputPosition}
          data-theme={theme}
          data-lang="zh-CN"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </div>
    </section>
  );
}
