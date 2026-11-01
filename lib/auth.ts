// 后台鉴权：仅本地模式可用；线上（ADMIN_MODE=cloud）一律 404。
import crypto from "node:crypto";
import { getSecrets, hashPassword, saveSecrets } from "./settings";

export const ADMIN_COOKIE = "gb_admin";
export const DEFAULT_PASSWORD = "glassblog";

export function isCloudMode(): boolean {
  return process.env.ADMIN_MODE === "cloud";
}

export function verifyPassword(input: string): boolean {
  if (typeof input !== "string" || input.length === 0) return false;
  const s = getSecrets();
  if (s.adminPasswordHash) return hashPassword(input) === s.adminPasswordHash;
  return input === DEFAULT_PASSWORD;
}

// adminSecret 为默认占位时自动换成随机值（首次调用时完成一次）
function ensureSecret(): string {
  const s = getSecrets();
  if (s.adminSecret && s.adminSecret !== "change-me-in-secrets") return s.adminSecret;
  const generated = crypto.randomBytes(16).toString("hex");
  saveSecrets({ adminSecret: generated });
  return generated;
}

export function makeToken(): string {
  return crypto.createHmac("sha256", ensureSecret()).update("glassblog-admin-v1").digest("hex");
}

export function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  return token === makeToken();
}
