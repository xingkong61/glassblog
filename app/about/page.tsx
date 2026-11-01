import type { Metadata } from "next";
import MarkdownView from "@/components/MarkdownView";
import { getAboutMarkdown } from "@/lib/content";

export const metadata: Metadata = { title: "关于" };

export default function AboutPage() {
  const md = getAboutMarkdown();
  return (
    <div className="mx-auto max-w-3xl pt-2">
      <article className="glass p-6 sm:p-9">
        <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">关于</h1>
        <MarkdownView content={md} />
      </article>
    </div>
  );
}
