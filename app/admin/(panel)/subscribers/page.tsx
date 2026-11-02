"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";

interface Subscriber {
  email: string;
  at: string;
  source?: string;
}

function csvCell(v: string): string {
  return `"${v.replace(/"/g, '""')}"`;
}

export default function SubscribersAdminPage() {
  const [list, setList] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await api<{ subscribers: Subscriber[] }>("/api/subscribers");
      setList(data.subscribers);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function flash(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(list.map((s) => s.email).join("\n"));
      flash(`已复制 ${list.length} 个邮箱 ✓`);
    } catch {
      setErr("复制失败，请手动选择");
    }
  }

  function downloadCsv() {
    const rows = [["email", "subscribed_at", "source"].map(csvCell).join(",")];
    for (const s of list) rows.push([s.email, s.at, s.source ?? "site"].map(csvCell).join(","));
    const blob = new Blob(["\uFEFF" + rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function remove(email: string) {
    if (!confirm(`把 ${email} 从订阅列表移除？`)) return;
    try {
      await api(`/api/subscribers?email=${encodeURIComponent(email)}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">邮件订阅者</h1>
          <p className="mt-1 text-sm text-slate-400">
            前台「订阅」卡片收集到的邮箱，存在本地 data/subscribers.jsonl，不进 git。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-indigo-500/10 px-3 py-1.5 font-semibold text-indigo-600 dark:text-indigo-300">
            共 {list.length} 人
          </span>
          <button
            onClick={copyAll}
            disabled={list.length === 0}
            className="rounded-xl bg-white/60 px-3 py-1.5 text-slate-500 transition hover:bg-white disabled:opacity-40 dark:bg-white/10 dark:text-slate-300"
          >
            复制全部邮箱
          </button>
          <button
            onClick={downloadCsv}
            disabled={list.length === 0}
            className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-emerald-600 transition hover:bg-emerald-500/20 disabled:opacity-40 dark:text-emerald-300"
          >
            下载 CSV
          </button>
        </div>
      </div>

      {msg ? <p className="mt-3 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-300">{msg}</p> : null}
      {err ? <p className="mt-3 rounded-xl bg-rose-500/10 px-4 py-2 text-sm text-rose-500">{err}</p> : null}

      <div className="mt-4 flex flex-col gap-2">
        {loading ? (
          <div className="glass p-8 text-center text-sm text-slate-400">加载中…</div>
        ) : list.length === 0 ? (
          <div className="glass p-10 text-center text-sm text-slate-400">
            还没有订阅者。前台首页侧栏与「每日选刊」页都有订阅卡片。
          </div>
        ) : (
          list.map((s) => (
            <div key={s.email} className="glass flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 truncate font-mono text-sm text-slate-700 dark:text-slate-200">
                {s.email}
              </span>
              <span className="text-xs text-slate-400">{s.at ? s.at.slice(0, 10) : "—"}</span>
              <button
                onClick={() => remove(s.email)}
                className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs text-rose-500 transition hover:bg-rose-500/20"
              >
                移除
              </button>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-400">
        提示：线上（ADMIN_MODE=cloud）后台不可用，可在服务器项目目录执行
        <code className="mx-1 rounded bg-white/60 px-1.5 py-0.5">node scripts/subscribers.mjs export</code>
        导出订阅列表。
      </p>
    </div>
  );
}
