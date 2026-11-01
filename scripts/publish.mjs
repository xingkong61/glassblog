// 发布脚本：被 发布.bat 调用。与 lib/git.ts 逻辑一致（脚本独立运行，不复用 TS 模块）。
import { execSync } from "node:child_process";

function run(cmd) {
  console.log("> " + cmd);
  execSync(cmd, { stdio: "inherit" });
}

try {
  try {
    execSync("git remote get-url origin", { stdio: "ignore" });
  } catch {
    console.error("\n❌ 还没有配置远程仓库 origin。");
    console.error("   请先按 docs\\部署指南.md 完成 GitHub 仓库配置，例如：");
    console.error('   git remote add origin git@github.com:你的用户名/仓库名.git');
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
  run(`git push origin ${branch}`);
  console.log("\n🚀 推送完成！Vercel 会在 1-2 分钟内自动构建上线。");
} catch (err) {
  console.error("\n❌ 发布失败：" + (err && err.message ? err.message : err));
  console.error("   常见原因：没网 / GitHub 密钥失效 / 仓库名写错。");
  process.exit(1);
}
