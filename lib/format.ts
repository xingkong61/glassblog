export function formatDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return String(d);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function formatDateTime(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return String(d);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${formatDate(date)} ${p(date.getHours())}:${p(date.getMinutes())}`;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

// 文件别名清洗：空白转连字符、剔除文件系统/URL 非法字符
export function sanitizeSlug(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\\/:*?"<>|#%&{}$!'@+`=^~]/g, "")
    .slice(0, 80);
}
