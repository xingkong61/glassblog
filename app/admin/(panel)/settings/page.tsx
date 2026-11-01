"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";
import type { SiteConfig } from "@/lib/types";

const inputCls =
  "w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-100";

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="glass p-5">
      <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h2>
      {desc ? <p className="mt-0.5 text-xs text-slate-400">{desc}</p> : null}
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [aiForm, setAiForm] = useState({ baseUrl: "", apiKey: "", model: "" });
  const [aboutContent, setAboutContent] = useState("");
  const [pwd, setPwd] = useState({ current: "", next: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  function patch(p: Partial<SiteConfig>) {
    setSite((s) => (s ? { ...s, ...p } : s));
  }

  useEffect(() => {
    Promise.all([
      api<{ site: SiteConfig; aiConfigured: boolean }>("/api/settings"),
      api<{ content: string }>("/api/about"),
    ])
      .then(([s, a]) => {
        setSite(s.site);
        setAboutContent(a.content);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "加载失败"));
  }, []);

  function flash(text: string) {
    setMsg(text);
    setErr("");
    setTimeout(() => setMsg(""), 2500);
  }

  async function saveSite() {
    if (!site) return;
    setSaving(true);
    try {
      await api("/api/settings", { method: "PUT", body: JSON.stringify({ site }) });
      flash("站点设置已保存 ✓");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function saveAi() {
    setSaving(true);
    try {
      await api("/api/settings", { method: "PUT", body: JSON.stringify({ secrets: { ai: aiForm } }) });
      flash("AI 配置已保存 ✓（三项都填才会显示助理）");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function saveAbout() {
    setSaving(true);
    try {
      await api("/api/about", { method: "PUT", body: JSON.stringify({ content: aboutContent }) });
      flash("关于页已保存 ✓");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    try {
      await api("/api/password", { method: "PUT", body: JSON.stringify(pwd) });
      setPwd({ current: "", next: "" });
      flash("密码已修改 ✓ 下次登录用新密码");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "修改失败");
    }
  }

  async function uploadAvatar(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      setErr(data.error ?? "上传失败");
      return;
    }
    patch({ avatar: data.url });
    flash("头像已上传，记得点下方保存 ✓");
  }

  if (!site) {
    return <div className="glass p-8 text-center text-sm text-slate-400">加载设置…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">设置</h1>

      {msg ? <p className="mt-3 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:text-emerald-300">{msg}</p> : null}
      {err ? <p className="mt-3 rounded-xl bg-rose-500/10 px-4 py-2 text-sm text-rose-500">{err}</p> : null}

      <div className="mt-4 grid gap-4">
        <Card title="基本信息" desc="站名、简介会显示在首页与浏览器标签">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-400">
              站点名称
              <input value={site.siteName} onChange={(e) => patch({ siteName: e.target.value })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              一句话副标题
              <input value={site.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              站点描述（SEO 用）
              <input value={site.description} onChange={(e) => patch({ description: e.target.value })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              博主昵称
              <input value={site.author} onChange={(e) => patch({ author: e.target.value })} className={cx(inputCls, "mt-1")} />
            </label>
          </div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.avatar} alt="头像" className="h-12 w-12 rounded-full border border-white/60" />
            <button
              onClick={() => avatarRef.current?.click()}
              className="rounded-xl bg-white/60 px-3 py-1.5 text-xs text-slate-500 transition hover:bg-white dark:bg-white/10 dark:text-slate-300"
            >
              上传新头像
            </button>
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadAvatar(f);
                if (avatarRef.current) avatarRef.current.value = "";
              }}
            />
          </div>
        </Card>

        <Card title="社交链接" desc="留空的不会显示在首页名片">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-400">
              GitHub
              <input value={site.social.github} onChange={(e) => patch({ social: { ...site.social, github: e.target.value } })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              B站主页
              <input value={site.social.bilibili} onChange={(e) => patch({ social: { ...site.social, bilibili: e.target.value } })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              邮箱
              <input value={site.social.email} onChange={(e) => patch({ social: { ...site.social, email: e.target.value } })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              小红书主页
              <input value={site.social.xiaohongshu} onChange={(e) => patch({ social: { ...site.social, xiaohongshu: e.target.value } })} className={cx(inputCls, "mt-1")} />
            </label>
          </div>
        </Card>

        <Card title="页脚" desc="ICP 备案号留空则不显示；商用站点备案后填这里">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-400">
              ICP 备案号
              <input value={site.icp} onChange={(e) => patch({ icp: e.target.value })} placeholder="如：京ICP备XXXXXXXX号" className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              页脚签名
              <input value={site.footerText} onChange={(e) => patch({ footerText: e.target.value })} className={cx(inputCls, "mt-1")} />
            </label>
          </div>
        </Card>

        <Card title="商用配置" desc="统计与广告：粘贴代码片段即生效，留空则完全不渲染">
          <label className="text-xs text-slate-400">
            统计代码（粘贴 JS 体，不带 &lt;script&gt; 标签；百度统计/umami 等）
            <textarea
              value={site.analytics}
              onChange={(e) => patch({ analytics: e.target.value })}
              rows={3}
              placeholder="var _hmt = _hmt || []; (function() { ... })();"
              className={cx(inputCls, "mt-1 resize-y font-mono")}
            />
          </label>
          <label className="text-xs text-slate-400">
            侧栏广告位（HTML/iframe 片段）
            <textarea
              value={site.ads.sidebar}
              onChange={(e) => patch({ ads: { ...site.ads, sidebar: e.target.value } })}
              rows={2}
              placeholder='<a href="..."><img src="..." /></a>'
              className={cx(inputCls, "mt-1 resize-y font-mono")}
            />
          </label>
          <label className="text-xs text-slate-400">
            文章底部广告位（HTML/iframe 片段；纯 JS 脚本建议用联盟提供的 iframe 版）
            <textarea
              value={site.ads.inArticle}
              onChange={(e) => patch({ ads: { ...site.ads, inArticle: e.target.value } })}
              rows={2}
              className={cx(inputCls, "mt-1 resize-y font-mono")}
            />
          </label>
        </Card>

        <Card title="等级系统" desc="首页名片的等级与经验条；不想展示可整体关闭">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={site.levelSystem}
              onChange={(e) => patch({ levelSystem: e.target.checked })}
              className="h-4 w-4 accent-indigo-500"
            />
            启用等级系统
          </label>
        </Card>

        <Card title="网易云 BGM 挂件" desc="填网易云歌曲页地址栏里的那串数字 ID。启用后前台左下角出现播放器">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={site.music.enabled}
              onChange={(e) => patch({ music: { ...site.music, enabled: e.target.checked } })}
              className="h-4 w-4 accent-indigo-500"
            />
            启用 BGM 挂件
          </label>
          <div className="flex flex-col gap-2">
            {site.music.playlist.map((item, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input
                  value={item.id}
                  onChange={(e) => {
                    const playlist = [...site.music.playlist];
                    playlist[i] = { ...item, id: e.target.value.replace(/\D/g, "") };
                    patch({ music: { ...site.music, playlist } });
                  }}
                  placeholder="歌曲ID"
                  className={cx(inputCls, "w-32 font-mono")}
                />
                <input
                  value={item.title}
                  onChange={(e) => {
                    const playlist = [...site.music.playlist];
                    playlist[i] = { ...item, title: e.target.value };
                    patch({ music: { ...site.music, playlist } });
                  }}
                  placeholder="歌名"
                  className={cx(inputCls, "w-36")}
                />
                <input
                  value={item.artist}
                  onChange={(e) => {
                    const playlist = [...site.music.playlist];
                    playlist[i] = { ...item, artist: e.target.value };
                    patch({ music: { ...site.music, playlist } });
                  }}
                  placeholder="歌手"
                  className={cx(inputCls, "w-28")}
                />
                <button
                  onClick={() =>
                    patch({ music: { ...site.music, playlist: site.music.playlist.filter((_, j) => j !== i) } })
                  }
                  className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-500 transition hover:bg-rose-500/20"
                >
                  移除
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                patch({ music: { ...site.music, playlist: [...site.music.playlist, { id: "", title: "", artist: "" }] } })
              }
              className="self-start rounded-xl bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-600 transition hover:bg-cyan-500/20 dark:text-cyan-300"
            >
              + 添加一首
            </button>
          </div>
        </Card>

        <Card title="AI 猫猫助理" desc="填任意 OpenAI 兼容接口（智谱/通义/DeepSeek/自建中转均可）。三项都填并勾选启用后，前台出现助理。线上部署时也可以用 Vercel 环境变量 AI_BASE_URL / AI_API_KEY / AI_MODEL 替代">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={site.ai.enabled}
              onChange={(e) => patch({ ai: { ...site.ai, enabled: e.target.checked } })}
              className="h-4 w-4 accent-indigo-500"
            />
            在前台启用助理
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-slate-400">
              助理名字
              <input value={site.ai.name} onChange={(e) => patch({ ai: { ...site.ai, name: e.target.value } })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              打招呼语
              <input value={site.ai.greeting} onChange={(e) => patch({ ai: { ...site.ai, greeting: e.target.value } })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              模型名
              <input value={aiForm.model} onChange={(e) => setAiForm({ ...aiForm, model: e.target.value })} placeholder="如 glm-4-flash" className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400 sm:col-span-3">
              API 地址（OpenAI 兼容，一般以 /v1 结尾）
              <input value={aiForm.baseUrl} onChange={(e) => setAiForm({ ...aiForm, baseUrl: e.target.value })} placeholder="https://open.bigmodel.cn/api/paas/v4" className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400 sm:col-span-3">
              API Key（保存在本地 secrets，不进 git、不回传显示）
              <input type="password" value={aiForm.apiKey} onChange={(e) => setAiForm({ ...aiForm, apiKey: e.target.value })} placeholder="sk-…" className={cx(inputCls, "mt-1")} />
            </label>
          </div>
          <label className="text-xs text-slate-400">
            性格提示词（System Prompt）
            <textarea value={site.ai.prompt} onChange={(e) => patch({ ai: { ...site.ai, prompt: e.target.value } })} rows={2} className={cx(inputCls, "mt-1 resize-y")} />
          </label>
          <div className="flex gap-2">
            <button onClick={saveAi} disabled={saving} className="rounded-xl bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-500/25 disabled:opacity-50 dark:text-cyan-300">
              保存 AI 配置
            </button>
          </div>
        </Card>

        <Card title="关于页" desc="Markdown 写作，保存后前台「关于」页立即生效">
          <textarea
            value={aboutContent}
            onChange={(e) => setAboutContent(e.target.value)}
            rows={8}
            className={cx(inputCls, "resize-y font-mono")}
          />
          <button onClick={saveAbout} disabled={saving} className="self-start rounded-xl bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-500/25 disabled:opacity-50 dark:text-indigo-300">
            保存关于页
          </button>
        </Card>

        <Card title="修改后台密码" desc="默认密码 glassblog，第一次用建议改掉">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-400">
              当前密码
              <input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} className={cx(inputCls, "mt-1")} />
            </label>
            <label className="text-xs text-slate-400">
              新密码（≥6 位）
              <input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} className={cx(inputCls, "mt-1")} />
            </label>
          </div>
          <button onClick={changePassword} className="self-start rounded-xl bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/20">
            修改密码
          </button>
        </Card>

        <button
          onClick={saveSite}
          disabled={saving}
          className="self-start rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存以上站点设置"}
        </button>
      </div>
    </div>
  );
}

function cx(a: string, b: string): string {
  return `${a} ${b}`;
}
