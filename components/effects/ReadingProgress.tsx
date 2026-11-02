"use client";

import { useEffect, useState } from "react";

// 顶部阅读进度条：只在文章/选刊详情页由 SiteEffects 挂载
export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const calc = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
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

  return <div className="reading-progress" style={{ width: `${pct}%` }} aria-hidden />;
}
