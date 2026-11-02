import { describe, expect, it } from "vitest";
import {
  FAILURE_WINDOW_MS,
  LOCK_MS,
  MAX_FAILURES,
  loginLockRemaining,
  recordLoginFailure,
  resetLoginFailures,
  resetLoginGuards,
} from "@/lib/login-guard";

describe("登录防爆破", () => {
  it("未失败时没有锁定", () => {
    resetLoginGuards();
    expect(loginLockRemaining("1.2.3.4", 1000)).toBe(0);
  });

  it("连续失败到阈值后锁定 15 分钟", () => {
    resetLoginGuards();
    const t0 = 1_000_000;
    for (let i = 0; i < MAX_FAILURES; i++) recordLoginFailure("1.2.3.4", t0 + i);
    const remain = loginLockRemaining("1.2.3.4", t0 + MAX_FAILURES);
    expect(remain).toBe(LOCK_MS - 1);
    // 锁定期内继续失败会重新计时（滑窗锁定）
    recordLoginFailure("1.2.3.4", t0 + MAX_FAILURES);
    expect(loginLockRemaining("1.2.3.4", t0 + MAX_FAILURES + 1)).toBeLessThanOrEqual(LOCK_MS);
  });

  it("锁定到期后自动解除", () => {
    resetLoginGuards();
    const t0 = 2_000_000;
    for (let i = 0; i < MAX_FAILURES; i++) recordLoginFailure("ip", t0);
    expect(loginLockRemaining("ip", t0 + LOCK_MS)).toBe(0);
    expect(loginLockRemaining("ip", t0 + LOCK_MS + 1)).toBe(0);
  });

  it("失败间隔超过窗口时间会重新计数", () => {
    resetLoginGuards();
    const t0 = 3_000_000;
    for (let i = 0; i < MAX_FAILURES - 1; i++) recordLoginFailure("ip", t0 + i);
    recordLoginFailure("ip", t0 + FAILURE_WINDOW_MS + 10_000);
    expect(loginLockRemaining("ip", t0 + FAILURE_WINDOW_MS + 10_001)).toBe(0);
  });

  it("不同 IP 互不影响，成功登录可清零", () => {
    resetLoginGuards();
    for (let i = 0; i < MAX_FAILURES; i++) recordLoginFailure("a", 100);
    expect(loginLockRemaining("a", 101)).toBeGreaterThan(0);
    expect(loginLockRemaining("b", 101)).toBe(0);

    resetLoginFailures("a");
    expect(loginLockRemaining("a", 102)).toBe(0);
  });
});
