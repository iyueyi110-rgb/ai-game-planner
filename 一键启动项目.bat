@echo off
chcp 65001 >nul
set "PROJECT_DIR=%~dp0"
set "APP_URL=http://localhost:5173"

where node.exe >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Node.js，请先安装 Node.js 后再启动项目。
  echo 下载地址：https://nodejs.org/
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo 未检测到 npm，请确认 Node.js 已正确安装。
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"

if not exist "node_modules" (
  echo 正在安装项目依赖，请稍等...
  call npm install
  if errorlevel 1 (
    echo 依赖安装失败，请检查网络或 npm 配置。
    pause
    exit /b 1
  )
)

echo 正在启动 AI Game Planner...
echo 启动后浏览器会打开：%APP_URL%
start "" powershell.exe -WindowStyle Hidden -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process '%APP_URL%'"
call npm run dev -- --host 127.0.0.1 --port 5173 --strictPort

pause
