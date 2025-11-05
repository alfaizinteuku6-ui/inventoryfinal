@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "YELLOW=Yellow"

%ps_echo% "Starting Celery Beat..." -ForegroundColor %YELLOW%

:: Check if service exists
sc query DjangoCeleryBeat >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Celery Beat service not found. Please install it first." -ForegroundColor %RED%
    exit /b 1
)

:: Try to start the service
net start DjangoCeleryBeat >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Beat started successfully" -ForegroundColor %GREEN%
    echo.
    exit /b 0
)

:: If failed, check if already running
sc query DjangoCeleryBeat | find "RUNNING" >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Beat is already running" -ForegroundColor %GREEN%
    exit /b 0
)

:: Check error logs
%ps_echo% "  ✗ Failed to start Celery Beat" -ForegroundColor %RED%
echo.
echo Checking Celery Beat logs for errors...
echo.

if exist "%PROJECT_ROOT%\logs\beat_stderr.log" (
    echo Last 10 lines from beat_stderr.log:
    powershell -Command "Get-Content '%PROJECT_ROOT%\logs\beat_stderr.log' -Tail 10"
    echo.
)

echo.
echo Troubleshooting steps:
echo 1. Ensure Django App is running
echo 2. Ensure Redis is running
echo 3. Check beat logs in: %PROJECT_ROOT%\logs\
echo 4. Test manually: "%CELERY_PATH%" -A config beat -l info
echo.

exit /b 1
