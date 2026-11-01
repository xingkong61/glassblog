// 站点设置与密钥读写。site.json 进 git（可公开），secrets.local.json 不进 git。
import { cache } from "react";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import type { Secrets, SiteConfig } from "./types";

const CONFIG_PATH = path.join(process.cwd(), "config", "site.json");
const SECRETS_PATH = path.join(process.cwd(), "config", "secrets.local.json");

export const DEFAULT_SITE: SiteConfig = {
  siteName: "玻璃小栈",
  subtitle: "一块会发光的毛玻璃",
  description: "记录技术、生活与灵感的个人博客",
  author: "博主",
  avatar: "/avatar.svg",
  social: { github: "", bilibili: "", email: "", xiaohongshu: "" },
  icp: "",
  footerText: "用玻璃之心，写透明之文。",
  levelSystem: true,
  music: { enabled: false, playlist: [] },
  ai: {
    enabled: false,
    name: "小玻",
    prompt: "你是博客里的猫咪助理，说话简短可爱，偶尔用喵结尾。",
    greeting: "喵？找我有什么事~",
  },
  ads: { inArticle: "", sidebar: "" },
};

export const DEFAULT_SECRETS: Secrets = {
  adminPasswordHash: null, // null 时后台用默认密码 glassblog 登录，登录后建议在设置页修改
  adminSecret: "change-me-in-secrets",
  ai: { baseUrl: "", apiKey: "", model: "" },
  imageBed: { type: "local", apiUrl: "", token: "" },
};

function deepMerge<T>(base: T, patch: Record<string, unknown>): T {
  if (patch === null || patch === undefined) return base;
  if (typeof base !== "object" || base === null || Array.isArray(base)) {
    return patch as T;
  }
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = deepMerge((base as Record<string, unknown>)[k], v as Record<string, unknown>);
  }
  return out as T;
}

export const getSiteConfig = cache((): SiteConfig => {
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) as Record<string, unknown>;
    return deepMerge(DEFAULT_SITE, raw);
  } catch {
    return DEFAULT_SITE;
  }
});

export function saveSiteConfig(patch: Record<string, unknown>): SiteConfig {
  const merged = deepMerge(getSiteConfig(), patch);
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  return merged;
}

export const getSecrets = cache((): Secrets => {
  try {
    const raw = JSON.parse(fs.readFileSync(SECRETS_PATH, "utf8")) as Record<string, unknown>;
    return deepMerge(DEFAULT_SECRETS, raw);
  } catch {
    return DEFAULT_SECRETS;
  }
});

export function saveSecrets(patch: Record<string, unknown>): Secrets {
  const merged = deepMerge(getSecrets(), patch);
  fs.mkdirSync(path.dirname(SECRETS_PATH), { recursive: true });
  fs.writeFileSync(SECRETS_PATH, JSON.stringify(merged, null, 2) + "\n", "utf8");
  return merged;
}

export function hashPassword(plain: string): string {
  return crypto.createHash("sha256").update(`glassblog::${plain}`).digest("hex");
}

export function isAiConfigured(s: Secrets = getSecrets()): boolean {
  return Boolean(s.ai.apiKey && s.ai.baseUrl && s.ai.model);
}
