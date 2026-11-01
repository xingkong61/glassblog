// 客户端请求小工具：统一 JSON 头与错误抛出
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `请求失败(${res.status})`);
  return data;
}

export function todayStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function nowMinuteStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${todayStr()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
