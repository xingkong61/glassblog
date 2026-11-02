// 简易进程内限流器：按 key 固定窗口计数。
// 说明：多进程/多实例部署时计数只在单实例内生效——足以拦截单 IP 高频刷接口，不是严格全局上限。
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10000;

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const hit = buckets.get(key);
  if (!hit || now >= hit.resetAt) {
    if (buckets.size >= MAX_KEYS) {
      for (const [k, b] of buckets) {
        if (now >= b.resetAt) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  hit.count += 1;
  return hit.count <= limit;
}

// 测试用：清空所有窗口
export function resetRateLimits(): void {
  buckets.clear();
}
