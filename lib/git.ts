// 发布流水线：git add/commit/push，支持 dry-run。仅本地模式调用。
import { execSync } from "node:child_process";
import { getRoot } from "./content";

export interface PublishResult {
  ok: boolean;
  message: string;
  detail?: string;
}

// 代理配置：读环境变量 GIT_PROXY（如 http://127.0.0.1:11129），未配置则不走代理
export function configuredProxy(): string {
  return (process.env.GIT_PROXY ?? "").trim();
}

export function proxyEnv(proxy: string): Record<string, string> {
  const p = proxy.trim();
  return p ? { HTTPS_PROXY: p, HTTP_PROXY: p } : {};
}

export function publishChanges(dryRun = false): PublishResult {
  const root = getRoot();
  const run = (cmd: string) => execSync(cmd, { cwd: root, encoding: "utf8" });

  try {
    run("git remote get-url origin");
  } catch {
    return {
      ok: false,
      message: "还没有配置远程仓库 origin",
      detail: "请先按 docs/部署指南.md 完成 GitHub 仓库配置（git remote add origin ...）",
    };
  }

  let status = "";
  try {
    status = run("git status --porcelain").trim();
  } catch {
    return { ok: false, message: "这里不是 git 仓库（或 git 不可用）" };
  }

  if (!status) {
    return { ok: true, message: "没有新改动，线上已是最新。" };
  }
  if (dryRun) {
    return { ok: true, message: "dry-run 预览（不会真的推送）：", detail: status };
  }

  try {
    execSync("git add -A", { cwd: root, stdio: "ignore" });
    execSync(`git commit -m "publish: ${new Date().toISOString()}"`, { cwd: root, stdio: "ignore" });
    const branch = run("git rev-parse --abbrev-ref HEAD").trim() || "main";
    try {
      execSync(`git push origin ${branch}`, { cwd: root, stdio: "ignore" });
    } catch {
      // 直连失败：仅在配置了 GIT_PROXY 时走代理重试
      const proxy = configuredProxy();
      if (!proxy) {
        throw new Error("直连推送失败。若需要代理，请设置环境变量 GIT_PROXY（例如 http://127.0.0.1:11129）后重试");
      }
      execSync(`git push origin ${branch}`, {
        cwd: root,
        stdio: "ignore",
        env: { ...process.env, ...proxyEnv(proxy) },
      });
    }
    return { ok: true, message: "已推送到 GitHub。到服务器执行 scripts/deploy-server.sh 后上线。" };
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return { ok: false, message: "推送失败（检查网络 / 代理设置 GIT_PROXY / GitHub 密钥）", detail };
  }
}
