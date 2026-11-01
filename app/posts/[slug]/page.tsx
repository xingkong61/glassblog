import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MarkdownView from "@/components/MarkdownView";
import { getAdjacentPosts, getPost, listPosts } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listPosts({ includeDrafts: process.env.NODE_ENV !== "production" }).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug, { includeDrafts: process.env.NODE_ENV !== "production" });
  if (!post) return { title: "文章不存在" };
  return { title: post.title, description: post.summary };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug, { includeDrafts: process.env.NODE_ENV !== "production" });
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(post.slug);

  return (
    <div className="mx-auto max-w-3xl pt-2">
      {post.draft ? (
        <div className="glass mb-4 border-amber-300/60 px-4 py-2 text-center text-xs text-amber-600 dark:text-amber-300">
          草稿预览模式——这篇还没发布，线上访客看不到
        </div>
      ) : null}

      <article className="glass p-6 sm:p-9">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <time dateTime={post.date}>{post.date}</time>
          <span>·</span>
          <span>{post.wordCount} 字</span>
          <span>·</span>
          <span>约 {post.readingMinutes} 分钟</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-slate-800 dark:text-slate-100 sm:text-3xl">
          {post.title}
        </h1>
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

        <hr className="my-6 border-slate-200/60 dark:border-slate-600/40" />

        <MarkdownView content={post.content} />
      </article>

      <nav className="mt-6 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/posts/${prev.slug}`} className="glass glass-hover p-4 text-sm">
            <div className="text-xs text-slate-400">← 更新一篇</div>
            <div className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{prev.title}</div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link href={`/posts/${next.slug}`} className="glass glass-hover p-4 text-sm sm:text-right">
            <div className="text-xs text-slate-400">更早一篇 →</div>
            <div className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{next.title}</div>
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
