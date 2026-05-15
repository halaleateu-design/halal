@echo off
chcp 65001 >nul
title GO - GitHub + Render (sirf 2 steps)
cd /d "%~dp0"
echo.
echo  ============================================
echo    GO - GitHub + Render setup
echo  ============================================
echo.
echo  STEP A - GitHub push
echo  ---------------------------------
echo  Repo: halaleateu-design/halal
echo  https://github.com/halaleateu-design/halal
echo.
start https://github.com/halaleateu-design/halal
echo.
where git >nul 2>&1
if errorlevel 1 (
  echo Git install nahi hai. Download: https://git-scm.com/download/win
  pause
  exit /b 1
)
git remote remove origin 2>nul
git remote add origin https://github.com/halaleateu-design/halal.git
git branch -M main
git add -A
git diff --cached --quiet
if errorlevel 1 git commit -m "GO Halal eat EU — site + API"
echo.
echo  GitHub login allow karo (token = password)...
git push -u origin main
if errorlevel 1 (
  echo.
  echo  Push fail. PUSH-GITHUB.bat chalao ya token banao:
  echo  https://github.com/settings/tokens
  pause
  exit /b 1
)
echo.
echo  STEP B - Render API (browser khulega)
echo  ---------------------------------
start "https://render.com/deploy?repo=https://github.com/halaleateu-design/halal"
echo.
echo  Render par: Sign in - Deploy dabao - 5 min wait
echo.
set /p RURL=Render URL paste karo (https://go-api.onrender.com): 
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\set-render-api.ps1" -RenderUrl "%RURL%"
echo.
echo  Ab DEPLOY-WEBSITE.bat double-click karo.
echo.
pause
