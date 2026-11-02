// 邮件订阅存储层：data/subscribers.jsonl，一行一个 JSON。
// 存本地磁盘、不进 git（.gitignore 已排除 data/），避免邮箱地址进仓库。
import fs from "node:fs";
import path from "node:path";
import { getRoot } from "./content";

export interface Subscriber {
  email: string;
  at: string; // ISO 时间
  source?: string;
}

export const EMAIL_MAX = 254;

function dataDir(): string {
  return path.join(getRoot(), "data");
}

function storeFile(): string {
  return path.join(dataDir(), "subscribers.jsonl");
}

export function normalizeEmail(input: unknown): string {
  return String(input ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (email.length === 0 || email.length > EMAIL_MAX) return false;
  if (/\s/.test(email)) return false;
  // 宽松但实用的格式校验：本地部分@域名.顶级域，且不含连续 @ 或结尾点
  return /^[^@]+@[^@]+\.[^@.]{2,}$/.test(email);
}

// 读取全部订阅者：容忍坏行，按邮箱去重（保留最早一条），按时间倒序
export function listSubscribers(): Subscriber[] {
  let raw = "";
  try {
    raw = fs.readFileSync(storeFile(), "utf8");
  } catch {
    return [];
  }

  const seen = new Set<string>();
  const out: Subscriber[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const item = JSON.parse(line) as Partial<Subscriber>;
      const email = normalizeEmail(item.email);
      if (!isValidEmail(email) || seen.has(email)) continue;
      seen.add(email);
      out.push({
        email,
        at: typeof item.at === "string" ? item.at : "",
        ...(typeof item.source === "string" && item.source ? { source: item.source } : {}),
      });
    } catch {
      continue; // 单行损坏不影响其余数据
    }
  }
  return out.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
}

export function addSubscriber(
  emailRaw: unknown,
  opts: { source?: string; now?: Date } = {},
): { added: boolean; email: string } {
  const email = normalizeEmail(emailRaw);
  if (!isValidEmail(email)) throw new Error("邮箱格式不正确");

  if (listSubscribers().some((s) => s.email === email)) {
    return { added: false, email };
  }

  fs.mkdirSync(dataDir(), { recursive: true });
  const record: Subscriber = { email, at: (opts.now ?? new Date()).toISOString() };
  if (opts.source) record.source = opts.source;
  fs.appendFileSync(storeFile(), JSON.stringify(record) + "\n", "utf8");
  return { added: true, email };
}

export function removeSubscriber(emailRaw: unknown): boolean {
  const email = normalizeEmail(emailRaw);
  const all = listSubscribers();
  const next = all.filter((s) => s.email !== email);
  if (next.length === all.length) return false;

  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(storeFile(), next.map((s) => JSON.stringify(s)).join("\n") + (next.length ? "\n" : ""), "utf8");
  return true;
}
