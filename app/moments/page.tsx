import type { Metadata } from "next";
import { getStats, listMomentsFull, listPosts } from "@/lib/content";
import { buildHeatmap } from "@/lib/heatmap";
import { getLevel } from "@/lib/level";
import { getSiteConfig } from "@/lib/settings";
import MarkdownView from "@/components/MarkdownView";

export const dynamic = "force-static";

export const metadata: Metadata = { title: "说说" };

const MOOD_EMOJI: Record<string, string> = {
  日常: "🌤️",
  开心: "😄",
  平静: "🍃",
  思考: "🤔",
  感慨: "🌙",
  元气: "⚡",
};

const HEAT_COLORS = [
  "bg-slate-200/60 dark:bg-slate-700/40",
  "bg-sky-200 dark:bg-sky-800",
  "bg-sky-300 dark:bg-sky-600",
  "bg-sky-400 dark:bg-sky-500",
  "bg-sky-500 dark:bg-sky-400",
];

function heatClass(count: number, max: number): string {
  if (count <= 0) return HEAT_COLORS[0];
  const level = Math.min(4, Math.ceil((count / Math.max(1, max)) * 4));
  return HEAT_COLORS[level];
}

export default function MomentsPage() {
  const site = getSiteConfig();
  const moments = listMomentsFull();
  const posts = listPosts();
  const heat = buildHeatmap([
    ...posts.map((p) => p.date),
    ...moments.map((m) => m.date),
  ]);
  const level = site.levelSystem ? getLevel(getStats()) : null;

  return (
    <div className="mx-auto max-w-3xl pt-2">
      <div className="glass px-6 py-5">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">说说 · 动态</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          共 {moments.length} 条碎碎念
          {level ? ` · 当前 Lv.${level.level} ${level.title}` : ""}
        </p>

        {/* 贡献度热力图 */}
        <div className="mt-4">
          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {heat.weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {week.map((cell) => (
                  <div
                    key={cell.date}
                    title={`${cell.date} · ${cell.count} 篇更新`}
                    className={`h-3 w-3 shrink-0 rounded-[3px] ${heatClass(cell.count, heat.maxCount)}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-1.5 text-[11px] text-slate-400">
            近 18 周更新 {heat.total} 次 · 写作热力
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex flex-col gap-4">
        {/* 时间轴竖线 */}
        <div className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-sky-300/70 via-cyan-300/50 to-transparent dark:from-sky-500/40 dark:via-cyan-500/30" />

        {moments.map((m) => (
          <article key={m.slug} className="relative pl-7">
            <div className="absolute top-6 left-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-gradient-to-br from-sky-400 to-cyan-400 shadow dark:border-slate-800" />
            <div className="glass glass-hover p-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-sky-500 dark:text-sky-300">
                  {MOOD_EMOJI[m.mood] ?? "💭"} {m.mood}
                </span>
                <span className="font-mono">{m.date}</span>
              </div>
              <div className="mt-2 text-[15px] text-slate-700 dark:text-slate-200">
                <MarkdownView content={m.content} />
              </div>
            </div>
          </article>
        ))}

        {moments.length === 0 ? (
          <div className="glass p-10 text-center text-sm text-slate-400">还没有说说，去后台发一条吧</div>
        ) : null}
      </div>
    </div>
  );
}
