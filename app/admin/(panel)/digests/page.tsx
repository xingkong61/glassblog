"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { cx } from "@/lib/format";
import type { DigestFull, DigestMeta } from "@/lib/types";

const inputCls =
  "rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none transition focus:border-sky-400 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100";

export default function DigestsAdminPage() {
  const [digests, setDigests] = useState<DigestMeta[]>([]);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState<DigestFull | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eContent, setEContent] = useState("");
  const [eDraft, setEDraft] = useState(true);

  function flash(text: string) {
    setMsg(text);
    setErr("");
  }

  async function load() {
    try {
      const data = await api<{ digests: DigestMeta[] }>("/api/digests");
      setDigests(data.digests);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "加载失败");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function generate() {
    setErr("");
    setMsg("");
    setGenerating(true);
    try {
      const { slug, sources } = await api<{ slug: string; sources: number }>("/api/digest/generate", {
        method: "POST",
        body: JSON.stringify({ topic }),
      });
      flash(`已生成草稿 ✓（基于 ${sources} 条素材）请审核后发布`);
      await load();
      await openEdit(slug);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "生成失败");
    } finally {
      setGenerating(false);
    }
  }

  async function openEdit(slug: string) {
    try {
      const { digest } = await api<{ digest: DigestFull }>(`/api/digests/${encodeURIComponent(slug)}`);
      setEditing(digest);
      setETitle(digest.title);
      setEContent(digest.content);
      setEDraft(digest.draft);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "打开失败");
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await api(`/api/digests/${encodeURIComponent(editing.slug)}`, {
        method: "PUT",
        body: JSON.stringify({ slug: editing.slug, title: eTitle, date: editing.date, draft: eDraft, content: eContent }),
      });
      flash(eDraft ? "已保存草稿 ✓" : "已发布 ✓（线上要等发布推送后生效）");
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function remove(slug: string, title: string) {
    if (!confirm(`确定删除《${title}》？此操作不可恢复。`)) return;
    try {
      await api(`/api/digests/${encodeURIComponent(slug)}`, { method: "DELETE" });
      if (editing?.slug === slug) setEditing(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">每日选刊</h1>
      <p className="mt-1 text-sm text-slate-400">
        AI 抓取 arXiv 论文与新闻素材、汇总成中文选刊草稿，你审核发布。需要先在「设置」里配好 AI（Tavily key 可选，填了才有新闻板块）。
      </p>

      {msg ? <p className="mt-3 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-300">{msg}</p> : null}
      {err ? <p className="mt-3 rounded-xl bg-rose-500/10 px-4 py-2 text-sm text-rose-500">{err}</p> : null}

      {/* 生成区 */}
      <div className="glass mt-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="新闻主题（可选）：如「AI 大模型 最新进展」"
            className={cx(inputCls, "min-w-60 flex-1")}
          />
          <button
            onClick={generate}
            disabled={generating}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {generating ? "生成中…" : "✨ 生成今日选刊"}
          </button>
        </div>
        {generating ? (
          <p className="mt-2 text-xs text-slate-400">正在抓取素材并用 AI 汇总，通常需要 30 秒到 2 分钟，别关页面…</p>
        ) : null}
      </div>

      {/* 编辑区 */}
      {editing ? (
        <div className="glass mt-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <input value={eTitle} onChange={(e) => setETitle(e.target.value)} className={cx(inputCls, "min-w-60 flex-1")} />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={eDraft} onChange={(e) => setEDraft(e.target.checked)} className="h-4 w-4 accent-sky-500" />
              存为草稿
            </label>
            <button
              onClick={saveEdit}
              disabled={saving || !eTitle.trim() || !eContent.trim()}
              className="rounded-xl bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-500/25 disabled:opacity-50 dark:text-sky-300"
            >
              {saving ? "保存中…" : eDraft ? "保存草稿" : "审核通过并发布"}
            </button>
            <button
              onClick={() => setEditing(null)}
              className="rounded-xl bg-white/60 px-3 py-2 text-sm text-slate-500 transition hover:bg-white dark:bg-white/10 dark:text-slate-300"
            >
              关闭
            </button>
          </div>
          <textarea
            value={eContent}
            onChange={(e) => setEContent(e.target.value)}
            rows={16}
            className={cx(inputCls, "mt-3 w-full resize-y font-mono")}
          />
          <p className="mt-2 text-xs text-slate-400">
            发布前请核对：AI 可能概括失真，逐条对照原文；不满意的条目直接删改。/{editing.slug}
          </p>
        </div>
      ) : null}

      {/* 列表 */}
      <div className="mt-5 flex flex-col gap-3">
        {digests.length === 0 ? (
          <div className="glass p-8 text-center text-sm text-slate-400">还没有选刊，点上面「生成今日选刊」试试</div>
        ) : (
          digests.map((d) => (
            <div key={d.slug} className="glass flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-100">{d.title}</span>
                  {d.draft ? (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] text-amber-600 dark:text-amber-300">草稿</span>
                  ) : null}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  {d.date} · {d.wordCount} 字 · /{d.slug}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {!d.draft ? (
                  <Link
                    href={`/digests/${encodeURIComponent(d.slug)}`}
                    target="_blank"
                    className="rounded-lg bg-white/60 px-3 py-1.5 text-slate-500 transition hover:bg-white dark:bg-white/10"
                  >
                    查看
                  </Link>
                ) : null}
                <button
                  onClick={() => openEdit(d.slug)}
                  className="rounded-lg bg-sky-500/10 px-3 py-1.5 text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-300"
                >
                  编辑
                </button>
                <button
                  onClick={() => remove(d.slug, d.title)}
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
