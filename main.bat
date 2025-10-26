@echo off
setlocal enabledelayedexpansion
title Django + React Production Manager

:: Initialize colors and utils first
set "ps_echo=powershell -NoProfile -Command Write-Host"
set "BLUE=Blue"
set "GREEN=Green"
set "YELLOW=Yellow"
set "RED=Red"
set "CYAN=Cyan"
set "MAGENTA=Magenta"

cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Django + React Production Manager" -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

:: Check prerequisites
call scripts\check_python.bat
if errorlevel 1 exit /b 1

call scripts\check_node.bat
if errorlevel 1 exit /b 1

echo.
pause

:: Show main menu
call scripts\menu.bat

exit /b 0