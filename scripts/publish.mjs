// 发布脚本：被 发布.bat 调用。与 lib/git.ts 逻辑一致（脚本独立运行，不复用 TS 模块）。
// 网络策略：先直连推送；若设置了环境变量 GIT_PROXY（如 http://127.0.0.1:11129），直连失败时走该代理重试一次。
import { execSync } from "node:child_process";

const GIT_PROXY = (process.env.GIT_PROXY || "").trim();

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
    if (!GIT_PROXY) {
      console.error("\n❌ 直连推送失败，且未配置代理。");
      console.error("   如需要代理，先设置环境变量 GIT_PROXY 再发布，例如：");
      console.error('   set GIT_PROXY=http://127.0.0.1:11129 && node scripts\\publish.mjs');
      console.error("   其他常见原因：GitHub 密钥失效（git credential-manager github logout）、网络断开。");
      process.exit(1);
    }
    console.log(`\n[提示] 直连推送失败，改走代理 ${GIT_PROXY} 重试…`);
    try {
      run(`git push origin ${branch}`, {
        ...process.env,
        HTTPS_PROXY: GIT_PROXY,
        HTTP_PROXY: GIT_PROXY,
      });
    } catch (proxyErr) {
      console.error("\n❌ 直连和代理都推不动。常见原因：");
      console.error("   1. 代理客户端没开（GIT_PROXY = " + GIT_PROXY + "）");
      console.error("   2. GitHub 密钥失效 → 运行: git credential-manager github logout");
      console.error("   3. 网络整体断开");
      process.exit(1);
    }
  }

  console.log("\n🚀 推送完成！到服务器执行 bash scripts/deploy-server.sh 即可上线。");
} catch (err) {
  console.error("\n❌ 发布失败：" + (err && err.message ? err.message : err));
  process.exit(1);
}
