// 登录防爆破：按来源 IP 记录失败次数，连续失败到阈值后锁定一段时间。
// 进程内状态，重启即清除；对本机工具与单实例自建服务器足够。
interface Entry {
  failures: number;
  lockedUntil: number;
  lastFailureAt: number;
}

const entries = new Map<string, Entry>();

export const MAX_FAILURES = 5;
export const LOCK_MS = 15 * 60_000; // 锁 15 分钟
export const FAILURE_WINDOW_MS = 15 * 60_000; // 超过 15 分钟没再失败则重新计数
const MAX_KEYS = 5000;

function prune(now: number): void {
  if (entries.size < MAX_KEYS) return;
  for (const [key, e] of entries) {
    if (e.lockedUntil <= now && now - e.lastFailureAt > FAILURE_WINDOW_MS) entries.delete(key);
  }
}

export function loginLockRemaining(key: string, now = Date.now()): number {
  const e = entries.get(key);
  if (!e || e.lockedUntil <= now) return 0;
  return e.lockedUntil - now;
}

export function recordLoginFailure(key: string, now = Date.now()): void {
  const prev = entries.get(key);
  const e: Entry =
    prev && now - prev.lastFailureAt <= FAILURE_WINDOW_MS
      ? prev
      : { failures: 0, lockedUntil: 0, lastFailureAt: now };

  e.failures += 1;
  e.lastFailureAt = now;
  if (e.failures >= MAX_FAILURES) {
    e.lockedUntil = now + LOCK_MS;
  }
  entries.set(key, e);
  prune(now);
}

export function resetLoginFailures(key: string): void {
  entries.delete(key);
}

// 测试用：清空全部状态
export function resetLoginGuards(): void {
  entries.clear();
}
