"use client";

import { useEffect, useState } from "react";
import { api, nowMinuteStr } from "@/lib/client";
import { cx } from "@/lib/format";
import type { MomentFull } from "@/lib/types";

const MOODS = ["日常", "开心", "平静", "思考", "感慨", "元气"];

export default function MomentsAdminPage() {
  const [moments, setMoments] = useState<MomentFull[]>([]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("日常");
  const [date, setDate] = useState(nowMinuteStr());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await api<{ moments: MomentFull[] }>("/api/moments");
      setMoments(data.moments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function publish() {
    setError("");
    setBusy(true);
    try {
      await api("/api/moments", {
        method: "POST",
        body: JSON.stringify({ slug: "", date, mood, content }),
      });
      setContent("");
      setDate(nowMinuteStr());
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
    } finally {
      setBusy(false);
    }
  }

  async function remove(slug: string) {
    if (!confirm("删除这条说说？")) return;
    try {
      await api(`/api/moments/${encodeURIComponent(slug)}`, { method: "DELETE" });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败");
    }
  }

  const inputCls =
    "rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">说说</h1>
      <p className="mt-1 text-sm text-slate-400">碎碎念：一句话的日常，会出现在博客「说说」页。</p>

      <div className="glass mt-4 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="此刻的想法…"
          className={cx(inputCls, "w-full resize-y")}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select value={mood} onChange={(e) => setMood(e.target.value)} className={inputCls}>
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className={cx(inputCls, "font-mono text-xs")} />
          <button
            onClick={publish}
            disabled={busy || !content.trim()}
            className="ml-auto rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "发布中…" : "发布说说"}
          </button>
        </div>
        {error ? <p className="mt-2 text-xs text-rose-500">{error}</p> : null}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {moments.map((m) => (
          <div key={m.slug} className="glass flex items-start gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-500 dark:text-indigo-300">{m.mood}</span>
                <span className="font-mono">{m.date}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-200">
                {m.content ?? ""}
              </p>
              <p className="mt-1 text-[11px] text-slate-300 dark:text-slate-600">/{m.slug}</p>
            </div>
            <button
              onClick={() => remove(m.slug)}
              className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-500 transition hover:bg-rose-500/20"
            >
              删除
            </button>
          </div>
        ))}
        {moments.length === 0 ? (
          <div className="glass p-8 text-center text-sm text-slate-400">还没有说说</div>
        ) : null}
      </div>
    </div>
  );
}
