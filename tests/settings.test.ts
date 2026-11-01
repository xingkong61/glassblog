import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashPassword, isAiConfigured, readSecrets, readSiteConfig, saveSecrets, saveSiteConfig } from "@/lib/settings";

let root: string;

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "gb-settings-"));
  process.env.GLASSBLOG_ROOT = root;
});

afterEach(() => {
  delete process.env.GLASSBLOG_ROOT;
  rmSync(root, { recursive: true, force: true });
});

describe("站点设置", () => {
  it("无配置文件时返回默认值", () => {
    expect(readSiteConfig().siteName).toBe("玻璃小栈");
    expect(readSiteConfig().levelSystem).toBe(true);
  });

  it("保存后可读回，且补齐未设置的默认字段", () => {
    saveSiteConfig({ siteName: "我的站", social: { github: "https://github.com/x" } });
    const cfg = readSiteConfig();
    expect(cfg.siteName).toBe("我的站");
    expect(cfg.social.github).toBe("https://github.com/x");
    expect(cfg.social.email).toBe(""); // 深合并保留默认
    expect(cfg.ai.enabled).toBe(false);
  });

  it("site.json 落盘存在", () => {
    saveSiteConfig({ author: "某人" });
    expect(existsSync(path.join(root, "config", "site.json"))).toBe(true);
  });
});

describe("密钥", () => {
  it("默认密钥无 AI 配置", () => {
    expect(isAiConfigured()).toBe(false);
  });

  it("配置齐 baseUrl/apiKey/model 后判定可用", () => {
    saveSecrets({ ai: { baseUrl: "https://api.example.com/v1", apiKey: "sk-x", model: "glm-4" } });
    expect(isAiConfigured()).toBe(true);
    expect(readSecrets().ai.model).toBe("glm-4");
  });

  it("密码哈希可验证", () => {
    saveSecrets({ adminPasswordHash: hashPassword("新密码123") });
    const s = readSecrets();
    expect(s.adminPasswordHash).toBe(hashPassword("新密码123"));
    expect(s.adminPasswordHash).not.toBe(hashPassword("错的"));
  });
});
