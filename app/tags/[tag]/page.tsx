import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { listPosts } from "@/lib/content";

interface Props {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getTagSlugs().map((tag) => ({ tag: encodeURIComponent(tag) }));
}

function getTagSlugs(): string[] {
  const tags = new Set<string>();
  for (const p of listPosts({ includeDrafts: process.env.NODE_ENV !== "production" })) {
    for (const t of p.tags) tags.add(t);
  }
  return [...tags];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `标签：${decodeURIComponent(tag)}` };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = listPosts({ includeDrafts: process.env.NODE_ENV !== "production" }).filter((p) =>
    p.tags.includes(decoded),
  );

  return (
    <div className="mx-auto max-w-3xl pt-2">
      <div className="glass px-6 py-5">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          <span className="text-sky-500 dark:text-sky-300">#</span> {decoded}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{posts.length} 篇文章</p>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {posts.map((p, i) => (
          <PostCard key={p.slug} post={p} index={i} />
        ))}
        {posts.length === 0 ? (
          <div className="glass p-10 text-center text-sm text-slate-400">这个标签下还没有文章</div>
        ) : null}
      </div>

      <div className="mt-6 text-center">
        <Link href="/tags" className="text-sm text-sky-500 hover:underline dark:text-sky-300">
          ← 全部标签
        </Link>
      </div>
    </div>
  );
}
