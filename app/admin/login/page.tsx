"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "登录失败");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-sm p-8">
        <div className="text-center text-4xl">🔒</div>
        <h1 className="mt-3 text-center text-lg font-bold text-slate-800 dark:text-slate-100">
          GlassBlog 管理后台
        </h1>
        <p className="mt-1 text-center text-xs text-slate-400">默认密码 glassblog，登录后请在设置里修改</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="后台密码"
          autoFocus
          className="mt-5 w-full rounded-xl border border-white/60 bg-white/60 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100"
        />
        {error ? <p className="mt-2 text-xs text-rose-500">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "验证中…" : "进入后台"}
        </button>
      </form>
    </div>
  );
}
