import { describe, expect, it } from "vitest";
import { buildHeatmap } from "@/lib/heatmap";

describe("贡献度热力图", () => {
  it("按周分格：weeks=18 则 18 周 × 7 天", () => {
    const hm = buildHeatmap([], 18, new Date("2026-11-01T12:00:00"));
    expect(hm.weeks).toHaveLength(18);
    for (const week of hm.weeks) expect(week).toHaveLength(7);
    expect(hm.total).toBe(0);
    expect(hm.maxCount).toBe(0);
  });

  it("同一天多篇聚合计数，日期对齐", () => {
    const hm = buildHeatmap(
      ["2026-10-30", "2026-10-30", "2026-10-30 09:00", "2026-10-01"],
      18,
      new Date("2026-11-01T12:00:00"),
    );
    expect(hm.total).toBe(4);
    expect(hm.maxCount).toBe(3);
    const flat = hm.weeks.flat();
    const d1030 = flat.find((c) => c.date === "2026-10-30");
    expect(d1030?.count).toBe(3);
  });

  it("非法日期被忽略；最后一格是今天", () => {
    const today = new Date("2026-11-01T12:00:00");
    const hm = buildHeatmap(["不是日期", "2026-11-01"], 4, today);
    const flat = hm.weeks.flat();
    expect(flat[flat.length - 1].date).toBe("2026-11-01");
    expect(flat[flat.length - 1].count).toBe(1);
  });
});
