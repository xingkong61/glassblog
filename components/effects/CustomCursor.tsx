"use client";

import { useEffect, useRef } from "react";

// 拖尾圆点光标：仅精确指针设备、未开启减少动态时启用；不替换系统光标，只叠加一层柔光
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      el.classList.remove("is-hidden");
    };
    const onLeave = () => el.classList.add("is-hidden");
    const onEnter = () => el.classList.remove("is-hidden");
    const onDown = () => {
      el.style.width = "22px";
      el.style.height = "22px";
      el.style.opacity = "0.36";
    };
    const onUp = () => {
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.opacity = "0.22";
    };

    const loop = () => {
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;
      el.style.transform = `translate3d(${x - 7}px, ${y - 7}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return <div ref={ref} className="trail-cursor is-hidden" aria-hidden />;
}
