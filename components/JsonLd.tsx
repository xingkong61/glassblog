// JSON-LD 结构化数据注入点（SEO：搜索引擎富媒体结果）
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
