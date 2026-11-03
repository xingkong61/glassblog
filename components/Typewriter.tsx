"use client";

import { useEffect, useState } from "react";

// 打字机副标题：逐字打字 → 停留 → 逐字删除 → 停留 → 循环。
// 减少动态偏好时直接显示全文，不做循环。
export default function Typewriter({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    if (!text) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }

    let timer = 0;
    if (mode === "typing") {
      if (count < text.length) {
        timer = window.setTimeout(() => setCount((n) => n + 1), 90);
      } else {
        // 打完停留 2 秒再开始删除
        timer = window.setTimeout(() => setMode("deleting"), 2000);
      }
    } else if (count > 0) {
      timer = window.setTimeout(() => setCount((n) => n - 1), 55);
    } else {
      // 删空后停 0.8 秒再重新打
      timer = window.setTimeout(() => setMode("typing"), 800);
    }

    return () => window.clearTimeout(timer);
  }, [count, mode, text]);

  return (
    <span aria-label={text}>
      {text.slice(0, count)}
      <span className="type-cursor" aria-hidden />
    </span>
  );
}
