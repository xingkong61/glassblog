import Link from "next/link";
import Image from "next/image";
import PostCard from "@/components/PostCard";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/Hero";
import SubscribeCard from "@/components/SubscribeCard";
import { getLatestDigest, getStats, listPosts } from "@/lib/content";
import { getLevel } from "@/lib/level";
import { websiteJsonLd } from "@/lib/seo";
import { getSiteConfig } from "@/lib/settings";

export default async function HomePage() {
  const site = getSiteConfig();
  const posts = listPosts({ includeDrafts: process.env.NODE_ENV !== "production" });
  // 首页只渲染最新一批，避免文章多了以后首屏 HTML 无限膨胀；全量在 /archive
  const HOME_LIMIT = 20;
  const visiblePosts = posts.slice(0, HOME_LIMIT);
  const stats = getStats();
  const level = site.levelSystem ? getLevel(stats) : null;
  const digest = getLatestDigest();

  const socials: Array<[string, string]> = (
    [
      ["GitHub", site.social.github],
      ["B站", site.social.bilibili],
      ["邮箱", site.social.email ? `mailto:${site.social.email}` : ""],
      ["小红书", site.social.xiaohongshu],
    ] as Array<[string, string]>
  ).filter(([, href]) => href);

  return (
    <>
      <JsonLd data={websiteJsonLd(site)} />

      <div className="-mt-6">
        {/* 整屏 Hero：横向铺满视口，导航在首页透明覆盖其上 */}
        <Hero siteName={site.siteName} subtitle={site.subtitle} />

        <div className="mx-auto max-w-6xl pt-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* 文章流 */}
            <section id="recent-posts" className="flex scroll-mt-24 flex-col gap-5">
              {digest ? (
                <Link href={`/digests/${digest.slug}`} className="glass glass-hover block px-6 py-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-300">
                    <span>📬 每日选刊 · {digest.date}</span>
                    <span className="font-normal text-slate-400">读这一期 →</span>
                  </div>
                  <div className="mt-2 font-bold text-slate-800 dark:text-slate-100">{digest.title}</div>
                  <p className="clamp-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {digest.content.replace(/[#>*`\-[\]]/g, "").slice(0, 100)}
                  </p>
                </Link>
              ) : null}

              {posts.length === 0 ? (
                <div className="glass p-10 text-center text-sm text-slate-400">
                  还没有文章。到本地后台写下第一篇吧 →
                  <code className="ml-1 rounded bg-sky-500/10 px-1.5 py-0.5 text-sky-600">/admin</code>
                </div>
              ) : (
                visiblePosts.map((p, i) => (
                  <PostCard key={p.slug} post={p} index={i} featured={p.pinned} />
                ))
              )}

              {posts.length > HOME_LIMIT ? (
                <Link
                  href="/archive"
                  className="glass glass-hover block px-5 py-4 text-center text-sm font-semibold text-sky-600 dark:text-sky-300"
                >
                  还有 {posts.length - HOME_LIMIT} 篇，去归档看全部 →
                </Link>
              ) : null}
            </section>

            {/* 侧栏 */}
            <aside className="flex flex-col gap-5">
              <div className="glass p-6 text-center">
                <Image
                  src={site.avatar}
                  alt={site.author}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="avatar-glow mx-auto h-20 w-20 rounded-full border-2 border-white/70 object-cover"
                />
                <div className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">{site.author}</div>
                {level ? (
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-300">
                      Lv.{level.level} · {level.title}
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400"
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
                        className="rounded-full bg-white/50 px-3 py-1 text-xs text-slate-600 transition hover:bg-white/80 hover:text-sky-600 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20 dark:hover:text-sky-300"
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
                    <div className="text-lg font-bold text-sky-500 dark:text-sky-300">{stats.posts}</div>
                    <div className="text-[11px] text-slate-400">文章</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-teal-500 dark:text-teal-300">{stats.moments}</div>
                    <div className="text-[11px] text-slate-400">说说</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-pink-400 dark:text-pink-300">
                      {(stats.words / 10000).toFixed(1)}w
                    </div>
                    <div className="text-[11px] text-slate-400">字数</div>
                  </div>
                </div>
                <Link
                  href="/archive"
                  className="mt-4 block rounded-xl bg-sky-500/10 py-2 text-center text-xs font-semibold text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-300"
                >
                  浏览全部文章 →
                </Link>
              </div>

              {site.subscribe.enabled ? (
                <SubscribeCard title={site.subscribe.title} note={site.subscribe.note} />
              ) : null}

              <AdSlot code={site.ads.sidebar} />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
