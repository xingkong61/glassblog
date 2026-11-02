"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { cx } from "@/lib/format";
import type { PostMeta } from "@/lib/types";

type Filter = "all" | "published" | "draft";

export default function PostsAdminPage() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ posts: PostMeta[] }>("/api/posts");
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(slug: string, title: string) {
    if (!confirm(`确定删除《${title}》？此操作不可恢复。`)) return;
    try {
      await api(`/api/posts/${encodeURIComponent(slug)}`, { method: "DELETE" });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  }

  const shown = posts.filter((p) =>
    filter === "all" ? true : filter === "draft" ? p.draft : !p.draft,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">文章管理</h1>
        <Link
          href="/admin/editor"
          className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          ✍️ 写新文章
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        {(
          [
            ["all", `全部 ${posts.length}`],
            ["published", `已发布 ${posts.filter((p) => !p.draft).length}`],
            ["draft", `草稿 ${posts.filter((p) => p.draft).length}`],
          ] as Array<[Filter, string]>
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cx(
              "rounded-full px-3.5 py-1.5 text-xs transition",
              filter === key
                ? "bg-sky-500/15 font-semibold text-sky-600 dark:text-sky-300"
                : "bg-white/50 text-slate-500 hover:bg-white/80 dark:bg-white/5 dark:text-slate-400",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}

      <div className="mt-4 flex flex-col gap-3">
        {loading ? (
          <div className="glass p-8 text-center text-sm text-slate-400">加载中…</div>
        ) : shown.length === 0 ? (
          <div className="glass p-8 text-center text-sm text-slate-400">这里空空如也</div>
        ) : (
          shown.map((p) => (
            <div key={p.slug} className="glass flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{p.title}</span>
                  {p.draft ? (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] text-amber-600 dark:text-amber-300">
                      草稿
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {p.date} · {p.wordCount} 字 · /{p.slug}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {!p.draft ? (
                  <Link
                    href={`/posts/${encodeURIComponent(p.slug)}`}
                    target="_blank"
                    className="rounded-lg bg-white/60 px-3 py-1.5 text-slate-500 transition hover:bg-white dark:bg-white/10"
                  >
                    查看
                  </Link>
                ) : null}
                <Link
                  href={`/admin/editor?slug=${encodeURIComponent(p.slug)}`}
                  className="rounded-lg bg-sky-500/10 px-3 py-1.5 text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-300"
                >
                  编辑
                </Link>
                <button
                  onClick={() => remove(p.slug, p.title)}
                  className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-rose-500 transition hover:bg-rose-500/20"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
