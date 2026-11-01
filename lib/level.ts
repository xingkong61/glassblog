// 等级系统：纯函数，输入内容统计，输出等级信息。可在设置中整体关闭。

export interface ContentStats {
  posts: number;
  moments: number;
  words: number; // 全站正文总字数
}

export interface LevelInfo {
  level: number;
  title: string;
  exp: number;
  nextExp: number | null; // null = 已满级
  progress: number; // 0~1
}

// 等级称号（原创）
const TITLES = [
  "玻璃尘埃",
  "灵感学徒",
  "碎光旅人",
  "棱镜作者",
  "流光笔匠",
  "虹彩作家",
  "星璃大家",
  "传奇琉璃",
];

// 各级经验门槛（累计值，原创设计：前松后紧）
const THRESHOLDS = [0, 50, 150, 320, 560, 900, 1400, 2100];

export function calcExp(stats: ContentStats): number {
  const posts = Math.max(0, Math.floor(stats.posts));
  const moments = Math.max(0, Math.floor(stats.moments));
  const words = Math.max(0, Math.floor(stats.words));
  return posts * 50 + moments * 10 + Math.floor(words / 300);
}

export function getLevel(stats: ContentStats): LevelInfo {
  const exp = calcExp(stats);
  let level = 1;
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (exp >= THRESHOLDS[i]) level = i + 1;
  }
  const maxLevel = THRESHOLDS.length;
  if (level >= maxLevel) {
    return {
      level: maxLevel,
      title: TITLES[maxLevel - 1],
      exp,
      nextExp: null,
      progress: 1,
    };
  }
  const cur = THRESHOLDS[level - 1];
  const next = THRESHOLDS[level];
  return {
    level,
    title: TITLES[level - 1],
    exp,
    nextExp: next,
    progress: Math.min(1, Math.max(0, (exp - cur) / (next - cur))),
  };
}
