"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import type { MomentMeta, PostMeta } from "@/lib/types";

export default function AdminDashboard() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [moments, setMoments] = useState<MomentMeta[]>([]);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ posts: PostMeta[] }>("/api/posts"),
      api<{ moments: MomentMeta[] }>("/api/moments").catch(() => ({ moments: [] })),
      api<{ aiConfigured: boolean }>("/api/settings"),
    ])
      .then(([p, m, s]) => {
        setPosts(p.posts);
        setMoments(m.moments);
        setAiConfigured(s.aiConfigured);
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const drafts = posts.filter((p) => p.draft).length;
  const words = posts.reduce((s, p) => s + p.wordCount, 0);

  const cards = [
    { label: "文章", value: posts.length - drafts, sub: `草稿 ${drafts} 篇`, href: "/admin/posts", color: "text-indigo-500" },
    { label: "说说", value: moments.length, sub: "碎碎念", href: "/admin/moments", color: "text-cyan-500" },
    { label: "总字数", value: words.toLocaleString(), sub: "文章累计", href: "/admin/posts", color: "text-fuchsia-500" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">仪表盘</h1>
      <p className="mt-1 text-sm text-slate-400">本地创作，一键发布，线上静态呈现。</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="glass glass-hover p-5">
            <div className={`text-2xl font-bold ${c.color}`}>{loaded ? c.value : "…"}</div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.label}</div>
            <div className="text-xs text-slate-400">{c.sub}</div>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="glass p-5">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">快速开始</h2>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/admin/editor" className="rounded-xl bg-indigo-500/10 px-4 py-2.5 text-indigo-600 transition hover:bg-indigo-500/20 dark:text-indigo-300">
              ✍️ 写一篇文章
            </Link>
            <Link href="/admin/moments" className="rounded-xl bg-cyan-500/10 px-4 py-2.5 text-cyan-600 transition hover:bg-cyan-500/20 dark:text-cyan-300">
              💭 发一条说说
            </Link>
            <Link href="/admin/settings" className="rounded-xl bg-fuchsia-500/10 px-4 py-2.5 text-fuchsia-600 transition hover:bg-fuchsia-500/20 dark:text-fuchsia-300">
              ⚙️ 站点设置
            </Link>
          </div>
        </div>

        <div className="glass p-5">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">发布到线上</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            双击项目里的 <code className="rounded bg-indigo-500/10 px-1 py-0.5 text-indigo-500">发布.bat</code>，
            源码会推送到 GitHub 并触发 Vercel 自动构建。
            首次使用请先看 <code className="rounded bg-indigo-500/10 px-1 py-0.5 text-indigo-500">docs/部署指南.md</code>。
          </p>
          <div className="mt-3 text-xs">
            <span className="text-slate-400">AI 猫猫助理：</span>
            {aiConfigured ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-500">已配置 ✓</span>
            ) : (
              <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-slate-400">
                未配置（设置里填 API key 后启用）
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
