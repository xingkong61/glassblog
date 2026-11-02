import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MarkdownView from "@/components/MarkdownView";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import Comments from "@/components/Comments";
import { getAdjacentPosts, getPost, getRelatedPosts, listPosts } from "@/lib/content";
import { breadcrumbJsonLd, postJsonLd, postUrl } from "@/lib/seo";
import { getSiteConfig } from "@/lib/settings";

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
  const site = getSiteConfig();
  const canonical = postUrl(site, slug);
  return {
    title: post.title,
    description: post.summary,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      tags: post.tags,
      images: post.cover ? [post.cover] : [site.avatar],
    },
    twitter: {
      card: post.cover ? "summary_large_image" : "summary",
      title: post.title,
      description: post.summary,
      images: post.cover ? [post.cover] : [site.avatar],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug, { includeDrafts: process.env.NODE_ENV !== "production" });
  if (!post) notFound();

  const site = getSiteConfig();
  const { prev, next } = getAdjacentPosts(post.slug);
  const related = getRelatedPosts(post.slug);

  return (
    <div className="mx-auto max-w-3xl pt-2">
      <JsonLd data={postJsonLd(site, post)} />
      <JsonLd data={breadcrumbJsonLd(site, post)} />
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
                className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs text-sky-500 transition hover:bg-sky-500/20 dark:text-sky-300"
              >
                # {t}
              </Link>
            ))}
          </div>
        ) : null}

        {post.cover ? (
          <div className="relative mt-4 h-56 w-full overflow-hidden rounded-xl sm:h-80">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <hr className="my-6 border-slate-200/60 dark:border-slate-600/40" />

        <MarkdownView content={post.content} />

        <AdSlot code={getSiteConfig().ads.inArticle} className="mt-8" />
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

      {related.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold text-slate-500 dark:text-slate-400">相关文章</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/posts/${r.slug}`} className="glass glass-hover p-4 text-sm">
                <div className="text-xs text-slate-400">{r.date}</div>
                <div className="mt-1 font-semibold text-slate-700 dark:text-slate-200">{r.title}</div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {site.comments.provider === "giscus" ? <Comments config={site.comments.giscus} /> : null}
    </div>
  );
}
