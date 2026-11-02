export interface PostMeta {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  draft: boolean;
  pinned: boolean; // 置顶：列表中排在最前并带角标
  summary: string;
  cover?: string;
  wordCount: number;
  readingMinutes: number;
}

export interface PostFull extends PostMeta {
  content: string;
}

export interface DigestMeta {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  draft: boolean;
  wordCount: number;
}

export interface DigestFull extends DigestMeta {
  content: string;
}

export interface MomentMeta {
  slug: string;
  date: string; // YYYY-MM-DD HH:mm
  mood: string;
  wordCount: number;
}

export interface MomentFull extends MomentMeta {
  content: string;
}

export interface MusicItem {
  id: string; // 网易云歌曲 id
  title: string;
  artist: string;
}

export interface SiteConfig {
  siteName: string;
  siteUrl: string; // 线上地址（https://xxx），用于 SEO/sitemap/RSS；留空则不生成绝对链接
  subtitle: string;
  description: string;
  author: string;
  avatar: string;
  social: {
    github: string;
    bilibili: string;
    email: string;
    xiaohongshu: string;
  };
  icp: string;
  footerText: string;
  analytics: string; // 统计代码 JS 体（不带 <script> 标签），如百度统计/umami 片段
  levelSystem: boolean;
  music: { enabled: boolean; playlist: MusicItem[] };
  ai: { enabled: boolean; name: string; prompt: string; greeting: string };
  ads: { inArticle: string; sidebar: string };
  subscribe: {
    enabled: boolean;
    title: string;
    note: string;
  };
  comments: {
    provider: "none" | "giscus";
    giscus: {
      repo: string; // owner/repo
      repoId: string;
      category: string;
      categoryId: string;
      mapping: string; // pathname | title | og:title ...
      reactions: boolean;
      inputPosition: "top" | "bottom";
    };
  };
}

export interface Secrets {
  adminPasswordHash: string | null;
  adminSecret: string;
  ai: { baseUrl: string; apiKey: string; model: string };
  imageBed: { type: "local" | "custom"; apiUrl: string; token: string };
  tavily: { apiKey: string }; // 每日选刊的新闻素材源（可选，留空则只用 arXiv）
}
