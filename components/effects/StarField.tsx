"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  speed: number;
  alpha: number;
  phase: number;
}

// 星空背景：仅暗色模式绘制，柔和缓慢上浮 + 轻微闪烁；减少动态偏好时不闪烁
export default function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let stars: Star[] = [];

    const seed = () => {
      const count = Math.min(160, Math.max(40, Math.round((w * h) / 16000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.4,
        speed: Math.random() * 0.22 + 0.04,
        alpha: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const isDark = () => document.documentElement.classList.contains("dark");

    const render = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      if (isDark()) {
        for (const s of stars) {
          const twinkle = reduce ? 0 : Math.sin(t * 0.0015 + s.phase) * 0.16;
          const alpha = Math.max(0.05, Math.min(0.9, s.alpha + twinkle));
          ctx.beginPath();
          ctx.fillStyle = `rgba(185, 205, 255, ${alpha})`;
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
          if (!reduce) {
            s.y -= s.speed;
            if (s.y < -4) {
              s.y = h + 4;
              s.x = Math.random() * w;
            }
          }
        }
      }
      raf = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="star-field" aria-hidden />;
}
