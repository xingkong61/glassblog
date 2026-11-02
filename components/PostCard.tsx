import Link from "next/link";
import Image from "next/image";
import type { PostMeta } from "@/lib/types";
import { cx } from "@/lib/format";

// 文章卡：有封面时采用「左右交错大图」布局（参考目标站首页文章流）
export default function PostCard({
  post,
  featured = false,
  index = 0,
}: {
  post: PostMeta;
  featured?: boolean;
  index?: number;
}) {
  const imageRight = index % 2 === 1;

  const body = (
    <div className={cx("flex flex-col justify-center", post.cover ? "p-5 sm:p-7" : "p-5 sm:p-6")}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <time dateTime={post.date}>{post.date}</time>
        <span>·</span>
        <span>约 {post.readingMinutes} 分钟</span>
        {featured ? (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-amber-600 dark:text-amber-300">
            📌 置顶
          </span>
        ) : null}
      </div>

      <h2 className="mt-2 text-lg font-bold text-slate-800 dark:text-slate-100 sm:text-xl">
        <Link
          href={`/posts/${post.slug}`}
          className="transition hover:text-sky-600 dark:hover:text-sky-300"
        >
          {post.title}
        </Link>
      </h2>

      {post.summary ? (
        <p className="clamp-3 mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {post.summary}
        </p>
      ) : null}

      {post.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link
              key={t}
              href={`/tags/${encodeURIComponent(t)}`}
              className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-600 transition hover:bg-sky-500/20 dark:text-sky-300"
            >
              # {t}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (!post.cover) {
    return (
      <article className="glass glass-hover overflow-hidden">
        {body}
      </article>
    );
  }

  return (
    <article className="glass glass-hover group overflow-hidden">
      <div className="grid sm:grid-cols-[42%_1fr]">
        <div
          className={cx(
            "relative h-52 overflow-hidden sm:h-full sm:min-h-[232px]",
            imageRight ? "sm:order-2" : "sm:order-1",
          )}
        >
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, 42vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div className={cx(imageRight ? "sm:order-1" : "sm:order-2")}>{body}</div>
      </div>
    </article>
  );
}
