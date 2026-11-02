import Link from "next/link";
import Image from "next/image";
import type { PostMeta } from "@/lib/types";
import { cx } from "@/lib/format";

export default function PostCard({ post, featured = false }: { post: PostMeta; featured?: boolean }) {
  return (
    <article className={cx("glass glass-hover p-5 sm:p-6")}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <time dateTime={post.date}>{post.date}</time>
        <span>·</span>
        <span>约 {post.readingMinutes} 分钟</span>
        {featured ? (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-amber-600 dark:text-amber-300">
            置顶
          </span>
        ) : null}
      </div>

      <h2 className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100 sm:text-xl">
        <Link href={`/posts/${post.slug}`} className="transition hover:text-indigo-600 dark:hover:text-indigo-300">
          {post.title}
        </Link>
      </h2>

      {post.cover ? (
        <div className="relative mt-3 h-40 w-full overflow-hidden rounded-xl sm:h-48">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-cover"
          />
        </div>
      ) : null}

      {post.summary ? (
        <p className="clamp-2 mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{post.summary}</p>
      ) : null}

      {post.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link
              key={t}
              href={`/tags/${encodeURIComponent(t)}`}
              className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-500 transition hover:bg-indigo-500/20 dark:text-indigo-300"
            >
              # {t}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
