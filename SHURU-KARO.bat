@echo off
chcp 65001 >nul
title GO - Shuru karo (yahan se)
cd /d "%~dp0"
color 0A
echo.
echo   =============================================
echo     GO  +  Halal EU
echo     Deploy - sirf 2 files
echo   =============================================
echo.
echo   [1] DEPLOY-WEBSITE.bat
echo       Website Netlify par live
echo       (drag-drop YA login)
echo.
echo   [2] GITHUB-AUR-RENDER.bat
echo       Signup / Sell / Rider forms ke liye API
echo       (ek dafa - GitHub + Render)
echo.
echo   Pehle [1] chalao, phir [2].
echo.
echo   Folder: %cd%
echo.
pause
echo.
choice /C 12 /M "Kaunsa chalana hai? [1] Website  [2] GitHub+Render"
if errorlevel 2 goto render
start "" "%~dp0DEPLOY-WEBSITE.bat"
goto end
:render
start "" "%~dp0GITHUB-AUR-RENDER.bat"
:end
