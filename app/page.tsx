import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getStats, listPosts } from "@/lib/content";
import { getLevel } from "@/lib/level";
import { getSiteConfig } from "@/lib/settings";

export default async function HomePage() {
  const site = getSiteConfig();
  const posts = listPosts({ includeDrafts: process.env.NODE_ENV !== "production" });
  const stats = getStats();
  const level = site.levelSystem ? getLevel(stats) : null;

  const socials: Array<[string, string]> = (
    [
      ["GitHub", site.social.github],
      ["B站", site.social.bilibili],
      ["邮箱", site.social.email ? `mailto:${site.social.email}` : ""],
      ["小红书", site.social.xiaohongshu],
    ] as Array<[string, string]>
  ).filter(([, href]) => href);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 pt-2 lg:grid-cols-[1fr_320px]">
      {/* 文章流 */}
      <section className="flex flex-col gap-5">
        <div className="glass px-6 py-5">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl">
            {site.subtitle}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{site.description}</p>
        </div>

        {posts.length === 0 ? (
          <div className="glass p-10 text-center text-sm text-slate-400">
            还没有文章。到本地后台写下第一篇吧 →
            <code className="ml-1 rounded bg-indigo-500/10 px-1.5 py-0.5 text-indigo-500">/admin</code>
          </div>
        ) : (
          posts.map((p) => <PostCard key={p.slug} post={p} />)
        )}
      </section>

      {/* 侧栏 */}
      <aside className="flex flex-col gap-5">
        <div className="glass p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.avatar}
            alt={site.author}
            className="mx-auto h-20 w-20 rounded-full border-2 border-white/70 shadow-lg"
          />
          <div className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">{site.author}</div>
          {level ? (
            <div className="mt-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500 dark:text-indigo-300">
                Lv.{level.level} · {level.title}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400"
                  style={{ width: `${Math.round(level.progress * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                {level.nextExp ? `${level.exp} / ${level.nextExp} 经验` : `满级 · ${level.exp} 经验`}
              </div>
            </div>
          ) : null}
          {socials.length > 0 ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {socials.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noreferrer"
                  className="rounded-full bg-white/50 px-3 py-1 text-xs text-slate-600 transition hover:bg-white/80 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                >
                  {label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="glass p-5">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">统计</h3>
          <div className="mt-3 grid grid-cols-3 text-center">
            <div>
              <div className="text-lg font-bold text-indigo-500 dark:text-indigo-300">{stats.posts}</div>
              <div className="text-[11px] text-slate-400">文章</div>
            </div>
            <div>
              <div className="text-lg font-bold text-cyan-500 dark:text-cyan-300">{stats.moments}</div>
              <div className="text-[11px] text-slate-400">说说</div>
            </div>
            <div>
              <div className="text-lg font-bold text-fuchsia-500 dark:text-fuchsia-300">
                {(stats.words / 10000).toFixed(1)}w
              </div>
              <div className="text-[11px] text-slate-400">字数</div>
            </div>
          </div>
          <Link
            href="/archive"
            className="mt-4 block rounded-xl bg-indigo-500/10 py-2 text-center text-xs font-semibold text-indigo-500 transition hover:bg-indigo-500/20 dark:text-indigo-300"
          >
            浏览全部文章 →
          </Link>
        </div>
      </aside>
    </div>
  );
}
