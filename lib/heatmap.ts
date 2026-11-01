// 贡献度热力图：把文章/说说日期聚合成按周网格（GitHub 风格，原创实现）。
// 输出 weeks[i][j] = 某周第 j 天的计数，前端直接渲染格子。

export interface HeatCell {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface Heatmap {
  weeks: HeatCell[][]; // 外层按周，内层 7 天（周一~周日）
  maxCount: number;
  total: number;
}

function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function buildHeatmap(dates: string[], weeks = 18, today = new Date()): Heatmap {
  const counts = new Map<string, number>();
  for (const raw of dates) {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    const key = dayKey(d);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  // 本周周日为终点，往前推 weeks*7 天，起点对齐到周一
  const end = new Date(today);
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7)); // 推到本周日（今天就是周日则不动）
  const totalDays = weeks * 7;

  const cells: HeatCell[] = [];
  let max = 0;
  let total = 0;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    const count = counts.get(key) ?? 0;
    if (count > max) max = count;
    total += count;
    cells.push({ date: key, count });
  }

  const grid: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    grid.push(cells.slice(w * 7, w * 7 + 7));
  }

  return { weeks: grid, maxCount: max, total };
}
