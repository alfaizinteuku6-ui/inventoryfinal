@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "YELLOW=Yellow"

%ps_echo% "Starting Django Python App..." -ForegroundColor %YELLOW%

:: Check if service exists
sc query DjangoPythonApp >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Django App service not found. Please install it first." -ForegroundColor %RED%
    exit /b 1
)

:: Try to start the service
net start DjangoPythonApp >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Django App started successfully" -ForegroundColor %GREEN%
    timeout /t 5 /nobreak >nul
    exit /b 0
)

:: If failed, check if already running
sc query DjangoPythonApp | find "RUNNING" >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Django App is already running" -ForegroundColor %GREEN%
    exit /b 0
)

:: Check error logs
%ps_echo% "  ✗ Failed to start Django App" -ForegroundColor %RED%
echo.
echo Checking Django logs for errors...
echo.

if exist "%PROJECT_ROOT%\logs\app_stderr.log" (
    echo Last 10 lines from app_stderr.log:
    powershell -Command "Get-Content '%PROJECT_ROOT%\logs\app_stderr.log' -Tail 10"
    echo.
)

echo.
echo Troubleshooting steps:
echo 1. Ensure Redis is running
echo 2. Check Django logs in: %PROJECT_ROOT%\logs\
echo 3. Verify run_app.py exists: %RUN_APP_PATH%
echo 4. Test manually: "%PYTHON_PATH%" "%RUN_APP_PATH%"
echo.

exit /b 1
