import { describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";

describe("限流器", () => {
  it("限额内放行，超额拒绝", () => {
    resetRateLimits();
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimit("a", 3, 60_000, t0 + i)).toBe(true);
    expect(rateLimit("a", 3, 60_000, t0 + 4)).toBe(false);
    expect(rateLimit("a", 3, 60_000, t0 + 5)).toBe(false);
  });

  it("窗口过期后重新计数", () => {
    resetRateLimits();
    const t0 = 2_000_000;
    expect(rateLimit("b", 1, 1000, t0)).toBe(true);
    expect(rateLimit("b", 1, 1000, t0 + 500)).toBe(false);
    expect(rateLimit("b", 1, 1000, t0 + 1001)).toBe(true);
  });

  it("不同 key 互不影响", () => {
    resetRateLimits();
    const t0 = 3_000_000;
    expect(rateLimit("c", 1, 1000, t0)).toBe(true);
    expect(rateLimit("d", 1, 1000, t0)).toBe(true);
    expect(rateLimit("c", 1, 1000, t0 + 1)).toBe(false);
    expect(rateLimit("d", 1, 1000, t0 + 1)).toBe(false);
  });
});
