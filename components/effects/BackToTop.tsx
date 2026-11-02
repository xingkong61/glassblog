"use client";

import { useEffect, useState } from "react";

// 返回顶部：滚动 240px 后出现，按钮上显示当前阅读百分比
export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(window.scrollY > 240);
      setPct(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="返回顶部"
      className="glass glass-hover fixed bottom-6 right-5 z-50 flex h-12 w-12 flex-col items-center justify-center rounded-full text-sky-600 dark:text-sky-300"
    >
      <span className="text-[13px] font-semibold leading-none">{pct}%</span>
      <span className="mt-0.5 text-[11px] leading-none opacity-60">↑</span>
    </button>
  );
}
