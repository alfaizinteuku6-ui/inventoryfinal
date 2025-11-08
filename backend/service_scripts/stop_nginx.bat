@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "YELLOW=Yellow"

%ps_echo% "Stopping Nginx Server..." -ForegroundColor %YELLOW%

:: Check if service exists
sc query NginxServer >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ NginxServer service not found" -ForegroundColor %RED%
    exit /b 1
)

:: Try to stop the service
net stop NginxServer >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Nginx stopped successfully" -ForegroundColor %GREEN%
    exit /b 0
)

:: Check if already stopped
sc query NginxServer | find "STOPPED" >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Nginx is already stopped" -ForegroundColor %GREEN%
    exit /b 0
)

%ps_echo% "  ✗ Failed to stop Nginx" -ForegroundColor %RED%
exit /b 1