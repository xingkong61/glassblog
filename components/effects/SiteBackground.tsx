"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

// 全站固定背景：Hero 与下方内容共用同一张图，滚动时背景不动。
// 后台不渲染，保持写作界面原有的浅色/深色背景。
export default function SiteBackground({ image }: { image: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="site-bg" aria-hidden>
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          priority={pathname === "/"}
          sizes="100vw"
          className="site-bg-image"
        />
      ) : (
        <div className="site-bg-fallback" />
      )}
      <div className="site-bg-overlay" />
    </div>
  );
}
