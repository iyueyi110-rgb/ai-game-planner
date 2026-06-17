@echo off
set "PROJECT_DIR=%~dp0"

where wt.exe >nul 2>nul
if %errorlevel% equ 0 (
  start "" wt.exe -d "%PROJECT_DIR%" powershell.exe -NoLogo -NoExit -Command "$Host.UI.RawUI.WindowTitle='AI Game Planner Terminal'; Write-Host 'Project directory:'; Get-Location"
  exit /b
)

start "" powershell.exe -NoLogo -NoExit -Command "Set-Location -LiteralPath '%PROJECT_DIR%'; $Host.UI.RawUI.WindowTitle='AI Game Planner Terminal'; Write-Host 'Project directory:'; Get-Location"
