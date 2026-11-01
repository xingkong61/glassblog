@echo off
chcp 936 >nul
cd /d %~dp0
title GlassBlog 一键发布
echo ==========================================
echo    GlassBlog 一键发布
echo    将本地改动推送到 GitHub，Vercel 自动构建
echo ==========================================
where git >nul 2>&1
if errorlevel 1 (
  echo [错误] 未检测到 Git，请先安装 Git。
  pause
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo [错误] 未检测到 Node.js，请先安装。
  pause
  exit /b 1
)
call node scripts\publish.mjs
echo.
pause
