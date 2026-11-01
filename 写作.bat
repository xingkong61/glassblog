@echo off
chcp 936 >nul
cd /d %~dp0
title GlassBlog 写作模式
echo ==========================================
echo    GlassBlog 写作模式
echo    浏览器将自动打开本地后台
echo    关闭本窗口即可停止服务
echo ==========================================
where git >nul 2>&1
if errorlevel 1 (
  echo [提示] 未检测到 Git，写作不受影响，但无法用 发布.bat 推送。
)
if not exist node_modules (
  echo 首次运行，正在安装依赖（可能需要几分钟）...
  call npm install
  if errorlevel 1 (
    echo npm 安装失败，请确认已安装 Node.js 18 以上版本。
    pause
    exit /b 1
  )
)
start "" cmd /c "timeout /t 5 >nul & start http://localhost:18601/admin"
call npx next dev -p 18601
pause
