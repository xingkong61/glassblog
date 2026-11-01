import { cx } from "@/lib/format";

// 广告位：后台设置里填 HTML/iframe 片段（如广告联盟代码、自营推广卡）。留空则完全不渲染。
export default function AdSlot({ code, className }: { code: string; className?: string }) {
  if (!code || !code.trim()) return null;
  return (
    <div
      className={cx("glass overflow-hidden p-3 text-center", className)}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
