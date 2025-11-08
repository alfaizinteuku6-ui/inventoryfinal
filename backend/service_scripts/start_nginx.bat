@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "YELLOW=Yellow"

%ps_echo% "Starting Nginx Server..." -ForegroundColor %YELLOW%

:: Get project root (parent of service_scripts)
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."
set "PROJECT_ROOT=%CD%"

:: Check if service exists
sc query NginxServer >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ NginxServer service not found. Please install it first." -ForegroundColor %RED%
    exit /b 1
)

:: Try to start the service
net start NginxServer >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Nginx started successfully" -ForegroundColor %GREEN%
    echo.
    %ps_echo% "  Access your application at:" -ForegroundColor %CYAN%
    echo     https://localhost
    echo     http://localhost (redirects to HTTPS)
    echo.
    timeout /t 5 /nobreak >nul
    exit /b 0
)

:: If failed, check if already running
sc query NginxServer | find "RUNNING" >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Nginx is already running" -ForegroundColor %GREEN%
    exit /b 0
)

:: Check error logs
%ps_echo% "  ✗ Failed to start Nginx" -ForegroundColor %RED%
echo.
echo Checking Nginx logs for errors...
echo.

if exist "%PROJECT_ROOT%\nginx\logs\error.log" (
    echo Last 10 lines from error.log:
    powershell -Command "Get-Content '%PROJECT_ROOT%\nginx\logs\error.log' -Tail 10 -ErrorAction SilentlyContinue"
    echo.
)

if exist "%PROJECT_ROOT%\logs\nginx_stderr.log" (
    echo Last 10 lines from nginx_stderr.log:
    powershell -Command "Get-Content '%PROJECT_ROOT%\logs\nginx_stderr.log' -Tail 10 -ErrorAction SilentlyContinue"
    echo.
)

echo.
echo Troubleshooting steps:
echo 1. Ensure Django App is running (net start DjangoPythonApp)
echo 2. Check Nginx configuration: %PROJECT_ROOT%\nginx\conf\nginx.conf
echo 3. Check if ports 80 and 443 are available
echo 4. Check Nginx logs in: %PROJECT_ROOT%\nginx\logs\
echo 5. Test manually: cd %PROJECT_ROOT%\nginx ^&^& nginx.exe
echo.

exit /b 1