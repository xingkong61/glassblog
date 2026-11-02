"use client";

import { useEffect, useRef } from "react";
import { cx } from "@/lib/format";

// 广告位：后台设置里填 HTML/JS 片段（AdSense/百度联盟/自营推广卡），留空则完全不渲染。
// 浏览器规范里经 innerHTML 插入的 <script> 不会执行，因此这里把片段中的脚本提取出来
// 逐个创建真实 script 元素挂载，程序化广告代码才能生效。
export default function AdSlot({ code, className }: { code: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasCode = Boolean(code && code.trim());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";
    if (!hasCode) return;

    const tpl = document.createElement("template");
    tpl.innerHTML = code;
    const scripts = Array.from(tpl.content.querySelectorAll("script"));
    el.appendChild(tpl.content);
    for (const inert of scripts) {
      const live = document.createElement("script");
      for (const attr of Array.from(inert.attributes)) {
        live.setAttribute(attr.name, attr.value);
      }
      if (inert.textContent) live.textContent = inert.textContent;
      inert.replaceWith(live);
    }
  }, [code, hasCode]);

  if (!hasCode) return null;
  return <div ref={ref} className={cx("glass overflow-hidden p-3 text-center", className)} />;
}
