import Link from "next/link";
import type { Metadata } from "next";
import SubscribeCard from "@/components/SubscribeCard";
import { listDigests } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";

export const metadata: Metadata = {
  title: "每日选刊",
  description: "AI 抓取、站长审核的每日精选：AI 动态与论文雷达",
};

export default function DigestsPage() {
  const digests = listDigests();
  const site = getSiteConfig();
  return (
    <div className="mx-auto max-w-3xl pt-2">
      <div className="glass px-6 py-5">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 sm:text-2xl">📬 每日选刊</h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          AI 抓取素材、站长人工审核的每日精选：AI 动态 + 论文雷达。
        </p>
      </div>

      {site.subscribe.enabled ? (
        <div className="mt-5">
          <SubscribeCard title={site.subscribe.title} note={site.subscribe.note} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3">
        {digests.length === 0 ? (
          <div className="glass p-10 text-center text-sm text-slate-400">还没有选刊，过几天再来看看吧</div>
        ) : (
          digests.map((d) => (
            <Link
              key={d.slug}
              href={`/digests/${encodeURIComponent(d.slug)}`}
              className="glass glass-hover flex items-center gap-4 px-5 py-4"
            >
              <span className="shrink-0 font-mono text-xs text-slate-400">{d.date}</span>
              <span className="min-w-0 flex-1 truncate font-semibold text-slate-700 dark:text-slate-200">{d.title}</span>
              <span className="shrink-0 text-xs text-slate-400">{d.wordCount} 字 →</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
