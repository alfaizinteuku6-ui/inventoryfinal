@echo off
setlocal enabledelayedexpansion
:: This script sets up environment variables for all service scripts
:: It creates an environment file that other scripts can call

set "ENV_FILE=%PROJECT_ROOT%\service_env.bat"

:: Detect NSSM path with proper priority order
set "DETECTED_NSSM_PATH="

:: Check system architecture for proper NSSM folder
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set "NSSM_ARCH=win64"
) else if "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    set "NSSM_ARCH=win64"
) else (
    set "NSSM_ARCH=win32"
)

:: Priority 1: Check in PROJECT_ROOT\nssm\[architecture] (standard NSSM extraction location)
if exist "%PROJECT_ROOT%\nssm\!NSSM_ARCH!\nssm.exe" (
    set "DETECTED_NSSM_PATH=%PROJECT_ROOT%\nssm\!NSSM_ARCH!\nssm.exe"
    goto :nssm_found
)

:: Priority 2: Check if NSSM is in system PATH
where nssm >nul 2>nul
if %errorlevel% equ 0 (
    for /f "delims=" %%i in ('where nssm') do (
        set "DETECTED_NSSM_PATH=%%i"
        goto :nssm_found
    )
)

:: Priority 3: Check in PROJECT_ROOT\nssm folder (both architectures)
if exist "%PROJECT_ROOT%\nssm\win64\nssm.exe" (
    set "DETECTED_NSSM_PATH=%PROJECT_ROOT%\nssm\win64\nssm.exe"
    goto :nssm_found
)
if exist "%PROJECT_ROOT%\nssm\win32\nssm.exe" (
    set "DETECTED_NSSM_PATH=%PROJECT_ROOT%\nssm\win32\nssm.exe"
    goto :nssm_found
)

:: Priority 4: Check in SCRIPT_DIR
if exist "%SCRIPT_DIR%nssm.exe" (
    set "DETECTED_NSSM_PATH=%SCRIPT_DIR%nssm.exe"
    goto :nssm_found
)

:: Priority 5: Check in PROJECT_ROOT
if exist "%PROJECT_ROOT%\nssm.exe" (
    set "DETECTED_NSSM_PATH=%PROJECT_ROOT%\nssm.exe"
    goto :nssm_found
)

:nssm_found

:: Verify NSSM was found
if not defined DETECTED_NSSM_PATH (
    powershell -Command Write-Host "  ✗ NSSM not found!" -ForegroundColor Red
    echo.
    echo NSSM could not be located. Please ensure setup_nssm.bat has run successfully.
    echo Expected location: %PROJECT_ROOT%\nssm\!NSSM_ARCH!\nssm.exe
    echo.
    exit /b 1
)

:: Verify the detected path actually exists
if not exist "!DETECTED_NSSM_PATH!" (
    powershell -Command Write-Host "  ✗ NSSM path detected but file doesn't exist: !DETECTED_NSSM_PATH!" -ForegroundColor Red
    echo.
    exit /b 1
)

:: Create environment file
(
    echo @echo off
    echo :: Auto-generated environment variables
    echo :: Generated: %date% %time%
    echo.
    echo set "PROJECT_ROOT=%PROJECT_ROOT%"
    echo set "SCRIPT_DIR=%SCRIPT_DIR%"
    echo set "FUNCTIONS_DIR=%FUNCTIONS_DIR%"
    echo set "SCRIPTS_DIR=%SCRIPTS_DIR%"
    echo.
    echo set "NSSM_PATH=!DETECTED_NSSM_PATH!"
    echo.
    echo set "REDIS_DIR=%PROJECT_ROOT%\redis"
    echo set "REDIS_EXE=%PROJECT_ROOT%\redis\redis-server.exe"
    echo set "REDIS_CONF=%PROJECT_ROOT%\redis\redis.conf"
    echo.
    echo set "NGINX_DIR=%PROJECT_ROOT%\nginx"
    echo set "NGINX_EXE=%PROJECT_ROOT%\nginx\nginx.exe"
    echo.
    echo set "PYTHON_PATH=%PROJECT_ROOT%\venv\Scripts\python.exe"
    echo set "CELERY_PATH=%PROJECT_ROOT%\venv\Scripts\celery.exe"
    echo set "RUN_APP_PATH=%PROJECT_ROOT%\run_app.py"
    echo.
    echo set "ps_echo=powershell -Command Write-Host"
    echo set "GREEN=Green"
    echo set "RED=Red"
    echo set "CYAN=Cyan"
    echo set "YELLOW=Yellow"
) > "%ENV_FILE%"

powershell -Command Write-Host "  ✓ Environment variables configured" -ForegroundColor Green
echo Environment file: %ENV_FILE%
echo NSSM Path: !DETECTED_NSSM_PATH!
echo.

exit /b 0