@echo off
chcp 65001 >nul
title Tayy - GitHub + Render (sirf 2 steps)
cd /d "%~dp0"
echo.
echo  ============================================
echo    Tayy - GitHub + Render setup
echo  ============================================
echo.
echo  STEP A - GitHub (browser khulega)
echo  ---------------------------------
echo  1) Login karo
echo  2) Repo name: tayy-halal
echo  3) Public, README mat add karo
echo  4) Create repository
echo.
start https://github.com/new?name=tayy-halal^&description=Tayy+Halal+EU
echo.
set /p GHUSER=Apna GitHub username likho: 
echo.
where git >nul 2>&1
if errorlevel 1 (
  echo Git install nahi hai. Download: https://git-scm.com/download/win
  pause
  exit /b 1
)
git init
git add .
git commit -m "Tayy Halal EU marketplace"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/%GHUSER%/tayy-halal.git
echo.
echo  GitHub login allow karo jab pooche...
git push -u origin main
if errorlevel 1 (
  echo.
  echo  Push fail. Pehle GitHub par repo banao, phir dubara ye file chalao.
  pause
  exit /b 1
)
echo.
echo  STEP B - Render API (browser khulega)
echo  ---------------------------------
start "https://render.com/deploy?repo=https://github.com/%GHUSER%/tayy-halal"
echo.
echo  Render par: Sign in - Deploy dabao - 5 min wait
echo.
set /p RURL=Render URL paste karo (https://tayy-api.onrender.com): 
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\set-render-api.ps1" -RenderUrl "%RURL%"
echo.
echo  Ab DEPLOY-WEBSITE.bat double-click karo.
echo.
pause
