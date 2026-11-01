// 发布脚本：被 发布.bat 调用。与 lib/git.ts 逻辑一致（脚本独立运行，不复用 TS 模块）。
// 网络策略：先直连推送；连接失败时自动改走 Windows 系统代理（本机 127.0.0.1:11129）重试一次。
import { execSync } from "node:child_process";

const FALLBACK_PROXY = "http://127.0.0.1:11129"; // 本机系统代理端口（reg query ProxyServer 查得）

function run(cmd, env = process.env) {
  console.log("> " + cmd);
  execSync(cmd, { stdio: "inherit", env });
}

try {
  try {
    execSync("git remote get-url origin", { stdio: "ignore" });
  } catch {
    console.error("\n❌ 还没有配置远程仓库 origin。");
    console.error("   请先按 docs\\部署指南.md 完成 GitHub 仓库配置，例如：");
    console.error('   git remote add origin https://github.com/你的用户名/glassblog.git');
    process.exit(1);
  }

  const status = execSync("git status --porcelain", { encoding: "utf8" }).trim();
  if (!status) {
    console.log("\n✅ 没有需要发布的改动，线上已是最新。");
    process.exit(0);
  }

  run("git add -A");
  run(`git commit -m "publish: ${new Date().toISOString()}"`);
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim() || "main";

  try {
    run(`git push origin ${branch}`);
  } catch (directErr) {
    console.log("\n[提示] 直连推送失败，改走系统代理重试…");
    try {
      run(`git push origin ${branch}`, {
        ...process.env,
        HTTPS_PROXY: FALLBACK_PROXY,
        HTTP_PROXY: FALLBACK_PROXY,
      });
    } catch (proxyErr) {
      console.error("\n❌ 直连和代理都推不动。常见原因：");
      console.error("   1. 代理客户端没开（本机回退端口 " + FALLBACK_PROXY + "）");
      console.error("   2. GitHub 密钥失效 → 运行: git credential-manager github logout");
      console.error("   3. 网络整体断开");
      process.exit(1);
    }
  }

  console.log("\n🚀 推送完成！Vercel 会在 1-2 分钟内自动构建上线。");
} catch (err) {
  console.error("\n❌ 发布失败：" + (err && err.message ? err.message : err));
  process.exit(1);
}
