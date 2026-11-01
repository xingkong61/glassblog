export interface PostMeta {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  draft: boolean;
  summary: string;
  cover?: string;
  wordCount: number;
  readingMinutes: number;
}

export interface PostFull extends PostMeta {
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
  levelSystem: boolean;
  music: { enabled: boolean; playlist: MusicItem[] };
  ai: { enabled: boolean; name: string; prompt: string; greeting: string };
  ads: { inArticle: string; sidebar: string };
}

export interface Secrets {
  adminPasswordHash: string | null;
  adminSecret: string;
  ai: { baseUrl: string; apiKey: string; model: string };
  imageBed: { type: "local" | "custom"; apiUrl: string; token: string };
}
