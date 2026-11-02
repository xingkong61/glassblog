"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100";

// 邮件订阅卡片：提交到 /api/subscribe，成功/重复/错误都在本地反馈
export default function SubscribeCard({ title, note }: { title: string; note: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // 蜜罐，机器人会填
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMsg("");
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; duplicate?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "订阅失败");
      setEmail("");
      setMsg(data.duplicate ? "这个邮箱已经订阅过了 ✓" : "订阅成功 ✓ 已加入更新通知列表");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "订阅失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass p-5">
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">✉️ {title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{note}</p>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className={inputCls}
        />
        {/* 蜜罐：对真人隐藏，机器人解析 HTML 时会填 */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="rounded-xl bg-indigo-500/15 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-500/25 disabled:opacity-50 dark:text-indigo-300"
        >
          {busy ? "提交中…" : "订阅"}
        </button>
      </form>
      {msg ? <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">{msg}</p> : null}
      {err ? <p className="mt-2 text-xs text-rose-500">{err}</p> : null}
    </div>
  );
}
