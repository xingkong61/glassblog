#!/usr/bin/env bash
# GlassBlog 服务器更新脚本（Oracle / 任意 Linux 服务器）
# 用法：在服务器项目根目录执行 bash scripts/deploy-server.sh
# 可选环境变量：APP_NAME（pm2 进程名，默认 glassblog）、BRANCH（默认 main）
set -euo pipefail

APP_NAME="${APP_NAME:-glassblog}"
BRANCH="${BRANCH:-main}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> 拉取代码（$BRANCH）"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> 安装依赖"
npm ci

echo "==> 构建"
npm run build

if command -v pm2 >/dev/null 2>&1; then
  echo "==> 重启 pm2 进程"
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" --update-env
  else
    pm2 start npm --name "$APP_NAME" -- start
  fi
  pm2 save
else
  echo "!! 未安装 pm2，构建完成但未自动重启。请手动重启 Node 服务。"
fi

echo "✅ 更新完成：https://你的域名"
