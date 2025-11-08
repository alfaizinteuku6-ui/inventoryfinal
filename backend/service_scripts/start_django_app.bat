@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "YELLOW=Yellow"

%ps_echo% "Starting Django Python App Uvicorn..." -ForegroundColor %YELLOW%

:: Get project root (parent of service_scripts)
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."
set "PROJECT_ROOT=%CD%"

set "PYTHON_PATH=%PROJECT_ROOT%\venv\Scripts\python.exe"
set "RUN_APP_PATH=%PROJECT_ROOT%\run_app.py"

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
    echo.
    %ps_echo% "  Waiting for Uvicorn to be ready..." -ForegroundColor %YELLOW%
    timeout /t 5 /nobreak >nul
    
    :: Check if Uvicorn is responding
    powershell -Command "$response = try { Invoke-WebRequest -Uri 'http://localhost:8000' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop; $true } catch { $false }; if ($response) { Write-Host '  ✓ Django App is responding on port 8000' -ForegroundColor Green } else { Write-Host '  ⚠ Django App started but not yet responding may need more time' -ForegroundColor Yellow }"
    
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
    echo Last 20 lines from app_stderr.log:
    powershell -Command "Get-Content '%PROJECT_ROOT%\logs\app_stderr.log' -Tail 20 -ErrorAction SilentlyContinue"
    echo.
)

if exist "%PROJECT_ROOT%\logs\app_stdout.log" (
    echo Last 10 lines from app_stdout.log:
    powershell -Command "Get-Content '%PROJECT_ROOT%\logs\app_stdout.log' -Tail 10 -ErrorAction SilentlyContinue"
    echo.
)

echo.
echo Troubleshooting steps:
echo 1. Ensure Redis is running: net start RedisServer
echo 2. Check if port 8000 is available
echo 3. Check Django logs in: %PROJECT_ROOT%\logs\
echo 4. Verify run_app.py exists: %RUN_APP_PATH%
echo 5. Test manually: "%PYTHON_PATH%" "%RUN_APP_PATH%"
echo 6. Check virtual environment: "%PYTHON_PATH%" -m pip list
echo.

exit /b 1