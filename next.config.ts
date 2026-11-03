import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev 与 build 用不同的输出目录：避免「写作.bat」开着时执行 next build 覆盖 .next，
  // 导致后台的 CSS/JS 全部 404（表现为后台样式丢失、编辑器打不开）
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // 不暴露 X-Powered-By，省一点响应头体积
  poweredByHeader: false,
  images: {
    // 有 sharp 时优先产出 avif/webp，减少首屏图片体积
    formats: ["image/avif", "image/webp"],
    // 优化后的图片在服务端缓存 30 天
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // 允许站长在设置里填外部图床链接（http/https 任意域名）
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        // 上传图文件名带时间戳+随机串，内容不会变，可长缓存
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // 站点图标/头像文件名固定：缓存一天，换图后不会长期不更新
        source: "/avatar.png",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/icon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        // 基础安全头：禁止 MIME 嗅探、限制 referrer、禁止被外站嵌套
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
