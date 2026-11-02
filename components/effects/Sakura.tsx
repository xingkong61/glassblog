"use client";

import { useEffect, useRef } from "react";

interface Petal {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  angle: number;
  spin: number;
  phase: number;
  alpha: number;
}

// 樱花飘落：仅亮色模式绘制，用 Canvas 画椭圆花瓣（不依赖任何图片素材）
export default function Sakura() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let petals: Petal[] = [];

    const seed = () => {
      const count = w < 768 ? 10 : 22;
      petals = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 5 + 4,
        speed: Math.random() * 0.8 + 0.35,
        drift: Math.random() * 0.6 + 0.2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.03,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.35 + 0.35,
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
      if (!isDark()) {
        for (const p of petals) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = "#f9a8c3";
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.48, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = p.alpha * 0.5;
          ctx.fillStyle = "#fff1f5";
          ctx.beginPath();
          ctx.ellipse(-p.size * 0.2, -p.size * 0.1, p.size * 0.45, p.size * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          p.y += p.speed;
          p.x += Math.sin(t * 0.001 + p.phase) * p.drift;
          p.angle += p.spin;
          if (p.y > h + 12) {
            p.y = -12;
            p.x = Math.random() * w;
          }
          if (p.x < -12) p.x = w + 12;
          if (p.x > w + 12) p.x = -12;
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

  return <canvas ref={ref} className="sakura-field" aria-hidden />;
}
