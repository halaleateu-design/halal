@echo off
title Tayy - Netlify Website Deploy
cd /d "%~dp0"
echo.
echo ========================================
echo   Tayy website - Netlify deploy
echo ========================================
echo.
echo Pehli dafa: browser mein Netlify login khulega.
echo.
pause
call npx --yes netlify-cli deploy --prod --dir .
if errorlevel 1 (
  echo.
  echo Netlify login nahi hua ya error aaya.
  echo Manual: https://app.netlify.com - drag folder yahan se:
  echo %cd%
  echo.
  pause
  exit /b 1
)
echo.
echo DONE! Website live ho gayi.
pause
