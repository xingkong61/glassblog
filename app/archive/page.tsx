import type { Metadata } from "next";
import Link from "next/link";
import { getArchive } from "@/lib/content";

export const metadata: Metadata = { title: "归档" };

export default function ArchivePage() {
  const groups = getArchive();
  const total = groups.reduce((s, g) => s + g.posts.length, 0);

  return (
    <div className="mx-auto max-w-3xl pt-2">
      <div className="glass px-6 py-5">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">归档</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">共 {total} 篇文章，按年份归档</p>
      </div>

      {groups.map((g) => (
        <section key={g.year} className="glass mt-5 p-6">
          <h2 className="text-2xl font-bold text-indigo-500/90 dark:text-indigo-300">{g.year}</h2>
          <ul className="mt-3 flex flex-col gap-1">
            {g.posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/posts/${p.slug}`}
                  className="group flex items-baseline gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/40 dark:hover:bg-white/5"
                >
                  <span className="shrink-0 font-mono text-xs text-slate-400 dark:text-slate-500">
                    {p.date.slice(5)}
                  </span>
                  <span className="truncate text-sm text-slate-700 transition group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-300">
                    {p.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {groups.length === 0 ? (
        <div className="glass mt-5 p-10 text-center text-sm text-slate-400">还没有文章</div>
      ) : null}
    </div>
  );
}
