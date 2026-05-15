@echo off
chcp 65001 >nul
title GO — Push to GitHub (halaleateu-design/halal)
cd /d "%~dp0"

echo.
echo  ============================================
echo    Push code to GitHub
echo    https://github.com/halaleateu-design/halal
echo  ============================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo Git install karo: https://git-scm.com/download/win
  pause
  exit /b 1
)

git remote remove origin 2>nul
git remote add origin https://github.com/halaleateu-design/halal.git
git branch -M main

echo.
echo  GitHub login window aayegi — allow karo.
echo  Password ki jagah Personal Access Token use karo:
echo  https://github.com/settings/tokens  (scope: repo)
echo.

git push -u origin main
if errorlevel 1 (
  echo.
  echo  Push fail. Token banao, phir dubara ye file chalao.
  start https://github.com/settings/tokens?type=beta
  pause
  exit /b 1
)

echo.
echo  Done! Repo: https://github.com/halaleateu-design/halal
echo.
pause
