import { describe, expect, it } from "vitest";
import { calcExp, getLevel } from "@/lib/level";

describe("等级系统纯函数", () => {
  it("空站经验为 0，等级 1", () => {
    const lv = getLevel({ posts: 0, moments: 0, words: 0 });
    expect(lv.exp).toBe(0);
    expect(lv.level).toBe(1);
    expect(lv.progress).toBe(0);
  });

  it("经验公式：文章×50 + 说说×10 + 字数/300", () => {
    expect(calcExp({ posts: 2, moments: 3, words: 900 })).toBe(2 * 50 + 3 * 10 + 3);
  });

  it("负数与非法输入被钳制", () => {
    expect(calcExp({ posts: -5, moments: NaN as unknown as number, words: -100 })).toBe(0);
  });

  it("跨过门槛升级，进度按区间计算", () => {
    const lv2 = getLevel({ posts: 2, moments: 0, words: 0 }); // 100 经验 → Lv.2（50~150 区间中点）
    expect(lv2.level).toBe(2);
    expect(lv2.nextExp).toBe(150);
    expect(lv2.progress).toBeCloseTo(0.5, 2);

    const lv3 = getLevel({ posts: 3, moments: 0, words: 0 }); // 150 经验恰好到达 Lv.3
    expect(lv3.level).toBe(3);
    expect(lv3.progress).toBeCloseTo(0, 2);
  });

  it("顶格满级：nextExp 为 null，进度 1", () => {
    const lv = getLevel({ posts: 100, moments: 100, words: 100000 });
    expect(lv.level).toBe(8);
    expect(lv.nextExp).toBeNull();
    expect(lv.progress).toBe(1);
    expect(lv.title).toBe("传奇琉璃");
  });
});
