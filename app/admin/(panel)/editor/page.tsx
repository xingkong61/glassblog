"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { api, todayStr } from "@/lib/client";
import { cx, sanitizeSlug } from "@/lib/format";
import type { PostFull } from "@/lib/types";

function EditorInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug") ?? "";

  const [title, setTitle] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(todayStr());
  const [tagsStr, setTagsStr] = useState("");
  const [summary, setSummary] = useState("");
  const [cover, setCover] = useState("");
  const [draft, setDraft] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editSlug) return;
    api<{ post: PostFull }>(`/api/posts/${encodeURIComponent(editSlug)}`)
      .then(({ post }) => {
        setTitle(post.title);
        setAutoSlug(false);
        setSlug(post.slug);
        setDate(post.date);
        setTagsStr(post.tags.join(", "));
        setSummary(post.summary);
        setCover(post.cover ?? "");
        setDraft(post.draft);
        setPinned(post.pinned);
        setContent(post.content);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "加载文章失败"));
  }, [editSlug]);

  const effectiveSlug = autoSlug ? sanitizeSlug(title) : slug;

  async function save(asDraft: boolean) {
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload = {
        slug: effectiveSlug,
        title,
        date,
        tags: tagsStr.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
        draft: asDraft,
        pinned,
        summary,
        cover: cover || undefined,
        content,
      };
      if (editSlug) {
        await api(`/api/posts/${encodeURIComponent(editSlug)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        const { slug: newSlug } = await api<{ slug: string }>("/api/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.replace(`/admin/editor?slug=${encodeURIComponent(newSlug)}`);
      }
      setMessage(asDraft ? "已保存为草稿 ✓" : "已发布 ✓（线上要等 发布.bat 推送后生效）");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File) {
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "上传失败");

      const ta = textareaRef.current;
      if (ta) {
        const at = ta.selectionStart ?? content.length;
        const insert = `\n![](${data.url})\n`;
        setContent(content.slice(0, at) + insert + content.slice(at));
      } else {
        setContent(content + `\n![](${data.url})\n`);
      }
      setMessage("图片已上传并插入 ✓");
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const inputCls =
    "rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {editSlug ? "编辑文章" : "写新文章"}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview((v) => !v)}
            className="rounded-xl bg-white/60 px-3 py-2 text-sm text-slate-600 transition hover:bg-white dark:bg-white/10 dark:text-slate-300"
          >
            {preview ? "隐藏预览" : "显示预览"}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving || uploading}
            className="rounded-xl bg-amber-400/20 px-4 py-2 text-sm font-semibold text-amber-600 transition hover:bg-amber-400/30 disabled:opacity-50 dark:text-amber-300"
          >
            存草稿
          </button>
          <button
            onClick={() => save(false)}
            disabled={saving || uploading}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存发布"}
          </button>
        </div>
      </div>

      {message ? <p className="mt-3 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-3 rounded-xl bg-rose-500/10 px-4 py-2 text-sm text-rose-500">{error}</p> : null}

      {/* 元信息区 */}
      <div className="glass mt-4 grid gap-3 p-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 text-slate-400">标题</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" className={cx(inputCls, "w-full")} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 text-slate-400">日期</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={cx(inputCls, "w-full")} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 text-slate-400">标签</span>
          <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="用逗号分隔，如：随笔, 建站" className={cx(inputCls, "w-full")} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="w-10 shrink-0 text-slate-400">别名</span>
          <input
            value={effectiveSlug}
            disabled={Boolean(editSlug)}
            onChange={(e) => {
              setAutoSlug(false);
              setSlug(e.target.value);
            }}
            placeholder="URL 路径（留空按标题生成）"
            className={cx(inputCls, "w-full disabled:opacity-60")}
          />
        </label>
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <span className="w-10 shrink-0 pt-2 text-slate-400">摘要</span>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="留空则自动截取正文开头" className={cx(inputCls, "w-full resize-y")} />
        </label>
        <div className="flex items-center gap-2 text-sm sm:col-span-2">
          <span className="w-10 shrink-0 text-slate-400">封面</span>
          {cover ? (
            <span className="flex items-center gap-2 text-xs text-slate-400">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt="封面" className="h-8 w-14 rounded object-cover" />
              <button onClick={() => setCover("")} className="text-rose-400 hover:underline">移除</button>
            </span>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-xl bg-white/60 px-3 py-1.5 text-xs text-slate-500 transition hover:bg-white disabled:opacity-50 dark:bg-white/10 dark:text-slate-300"
            >
              {uploading ? "上传中…" : "上传封面图（可选）"}
            </button>
          )}
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="h-4 w-4 accent-indigo-500"
            />
            📌 置顶到列表最前
          </label>
        </div>
      </div>

      {/* 编辑器 + 预览 */}
      <div className={cx("mt-4 grid gap-4", preview ? "lg:grid-cols-2" : "grid-cols-1")}>
        <div className="glass p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-400">Markdown</span>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-600 transition hover:bg-cyan-500/20 disabled:opacity-50 dark:text-cyan-300"
            >
              🖼️ 插入图片
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f);
              }}
            />
          </div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# 用 Markdown 写正文…"
            className="h-[60vh] w-full resize-y rounded-xl border border-white/40 bg-white/40 p-4 font-mono text-sm leading-relaxed outline-none focus:border-indigo-400 dark:border-white/5 dark:bg-slate-900/60 dark:text-slate-100"
          />
        </div>

        {preview ? (
          <div className="glass p-5">
            <div className="mb-2 text-xs font-semibold text-slate-400">预览</div>
            <div className="h-[60vh] overflow-y-auto pr-1">
              {content.trim() ? (
                <div className="prose-glass">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-slate-300">开始输入后这里会实时渲染</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="glass p-8 text-center text-sm text-slate-400">加载编辑器…</div>}>
      <EditorInner />
    </Suspense>
  );
}
