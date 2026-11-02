import type { Metadata } from "next";
import Link from "next/link";
import { getTagCounts } from "@/lib/content";

export const metadata: Metadata = { title: "标签" };

export default function TagsPage() {
  const tags = getTagCounts();

  return (
    <div className="mx-auto max-w-3xl pt-2">
      <div className="glass px-6 py-5">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">标签</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">共 {tags.length} 个标签</p>
      </div>

      <div className="glass mt-5 p-6">
        {tags.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">还没有标签</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="glass glass-hover rounded-full px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="text-sky-500 dark:text-sky-300"># {tag}</span>
                <span className="ml-1.5 text-xs text-slate-400">{count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
