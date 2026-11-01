"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant({
  name,
  greeting,
  enabled,
}: {
  name: string;
  greeting: string;
  enabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  // greeting 只在组件里展示，不算对话历史
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [open, messages.length, greeting]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages, busy]);

  if (!enabled) return null;

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setError("");
    setBusy(true);
    const history = messages.filter((m, i) => !(i === 0 && m.role === "assistant" && m.content === greeting));
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-8) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "助理没吭声");
      setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "出错了");
      setMessages((m) => m.slice(0, -1)); // 把发出去的收回
      setInput(text);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {open ? (
        <div className="glass flex h-[26rem] w-80 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/40 px-4 py-2.5 dark:border-white/5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">🐱 {name}</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="关闭助理"
              className="text-slate-400 transition hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div ref={bodyRef} className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-gradient-to-r from-indigo-500 to-cyan-500 text-white"
                    : "bg-white/70 text-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
                }`}
              >
                {m.content}
              </div>
            ))}
            {busy ? (
              <div className="max-w-[85%] rounded-2xl bg-white/70 px-3.5 py-2 text-sm text-slate-400 dark:bg-slate-800/70">
                {name} 正在思考…
              </div>
            ) : null}
            {error ? <p className="text-center text-xs text-rose-400">{error}</p> : null}
          </div>

          <div className="flex items-center gap-2 border-t border-white/40 p-3 dark:border-white/5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`和${name}聊聊…`}
              className="min-w-0 flex-1 rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="打开AI助理"
        className="glass glass-hover flex h-12 w-12 items-center justify-center text-xl"
        title={`${name}·AI助理`}
      >
        🐱
      </button>
    </div>
  );
}
