@echo off
chcp 65001 >nul
title GO - Website live
cd /d "%~dp0"
echo.
echo  Website folder:
echo  %cd%
echo.
echo  Option A - SAB SE AASAAN (drag-drop):
echo  ---------------------------------
start https://app.netlify.com
explorer "%cd%"
echo.
echo  Netlify khula + folder khula.
echo  Site "fanciful-moxie-6b5bba" par jao ^> Deploys ^> drag folder.
echo.
pause
echo.
echo  Option B - Command line (login chahiye):
echo  ---------------------------------
call npx --yes netlify-cli deploy --prod --dir .
pause
