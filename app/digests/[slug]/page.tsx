import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MarkdownView from "@/components/MarkdownView";
import Comments from "@/components/Comments";
import { getDigest, listDigests } from "@/lib/content";
import { getSiteConfig } from "@/lib/settings";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listDigests({ includeDrafts: process.env.NODE_ENV !== "production" }).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const digest = getDigest(slug, { includeDrafts: process.env.NODE_ENV !== "production" });
  if (!digest) return { title: "选刊不存在" };
  return {
    title: digest.title,
    description: digest.content.replace(/[#>*`\-[\]]/g, "").slice(0, 80),
  };
}

export default async function DigestPage({ params }: Props) {
  const { slug } = await params;
  const digest = getDigest(slug, { includeDrafts: process.env.NODE_ENV !== "production" });
  if (!digest) notFound();

  const site = getSiteConfig();

  return (
    <div className="mx-auto max-w-3xl pt-2">
      {digest.draft ? (
        <div className="glass mb-4 border-amber-300/60 px-4 py-2 text-center text-xs text-amber-600 dark:text-amber-300">
          草稿预览模式——这一期还没发布，线上访客看不到
        </div>
      ) : null}

      <article className="glass p-6 sm:p-9">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <time dateTime={digest.date}>{digest.date}</time>
          <span>·</span>
          <span>{digest.wordCount} 字</span>
          <span>·</span>
          <span>📬 每日选刊</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold leading-snug text-slate-800 dark:text-slate-100 sm:text-3xl">
          {digest.title}
        </h1>

        <hr className="my-6 border-slate-200/60 dark:border-slate-600/40" />

        <MarkdownView content={digest.content} />
      </article>

      {site.comments.provider === "giscus" ? <Comments config={site.comments.giscus} /> : null}
    </div>
  );
}
