@echo off
setlocal enabledelayedexpansion

:: Check for admin rights and auto-elevate if needed
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: Color definitions
set "RED=Red"
set "GREEN=Green"
set "YELLOW=Yellow"
set "CYAN=Cyan"
set "BLUE=Blue"
set "ps_echo=powershell -Command Write-Host"

cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   NSSM Windows Service Setup" -ForegroundColor %BLUE%
%ps_echo% "   Redis + Django App + Celery" -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.
%ps_echo% "  Running with Administrator privileges ✓" -ForegroundColor %GREEN%
echo.

:: Get current directory and project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%\"
cd /d "%PROJECT_ROOT%"
set "PROJECT_ROOT=%CD%"

echo Project Root: %PROJECT_ROOT%
echo.

:: Export variables for child scripts
set "SCRIPTS_DIR=%PROJECT_ROOT%\service_scripts"
if not exist "%SCRIPTS_DIR%" mkdir "%SCRIPTS_DIR%"

:: Setup NSSM
call :setup_nssm
if %errorlevel% neq 0 exit /b 1

:: Setup Redis
call :setup_redis
if %errorlevel% neq 0 exit /b 1

:: Verify Python and Celery
call :verify_python
if %errorlevel% neq 0 exit /b 1

:: Remove existing services
call :remove_existing_services

:: Install and start services
%ps_echo% "========================================" -ForegroundColor %CYAN%
%ps_echo% "   Installing Services..." -ForegroundColor %CYAN%
%ps_echo% "========================================" -ForegroundColor %CYAN%
echo.

call "%SCRIPTS_DIR%\install_redis.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Redis service" -ForegroundColor %RED%
    pause
    exit /b 1
)

call "%SCRIPTS_DIR%\install_django_app.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Django App service" -ForegroundColor %RED%
    pause
    exit /b 1
)

call "%SCRIPTS_DIR%\install_celery_worker.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Celery Worker service" -ForegroundColor %RED%
    pause
    exit /b 1
)

call "%SCRIPTS_DIR%\install_celery_beat.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Celery Beat service" -ForegroundColor %RED%
    pause
    exit /b 1
)

:: Start services
%ps_echo% "========================================" -ForegroundColor %CYAN%
%ps_echo% "   Starting Services..." -ForegroundColor %CYAN%
%ps_echo% "========================================" -ForegroundColor %CYAN%
echo.

call "%SCRIPTS_DIR%\start_redis.bat"
call "%SCRIPTS_DIR%\start_django_app.bat"
call "%SCRIPTS_DIR%\start_celery_worker.bat"
call "%SCRIPTS_DIR%\start_celery_beat.bat"

:: Display completion message
call :display_completion

:: Create removal script
call :create_removal_script

pause
exit /b 0

:: ========================================
:: FUNCTIONS
:: ========================================

:setup_nssm
where nssm >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "NSSM not found. Downloading and installing..." -ForegroundColor %YELLOW%
    echo.
ECHO is off.
    set "TEMP_DIR=%PROJECT_ROOT%\temp_nssm"
    if not exist "" mkdir ""
ECHO is off.
    powershell -Command "try { Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '\nssm.zip' -ErrorAction Stop; Write-Host '  ✓ Downloaded NSSM' -ForegroundColor Green } catch { Write-Host '  ✗ Failed to download NSSM' -ForegroundColor Red; exit 1 }"
ECHO is off.
    if not exist "\nssm.zip" (
        %ps_echo% "Failed to download NSSM. Please check your internet connection." -ForegroundColor %RED%
        exit /b 1
    )
ECHO is off.
    powershell -Command "Expand-Archive -Path '\nssm.zip' -DestinationPath '' -Force"
ECHO is off.
    if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
        copy "\nssm-2.24\win64\nssm.exe" "%SCRIPT_DIR%nssm.exe" >nul
    ) else (
        copy "\nssm-2.24\win32\nssm.exe" "%SCRIPT_DIR%nssm.exe" >nul
    )
ECHO is off.
    rmdir /s /q ""
ECHO is off.
    set "NSSM_PATH=%SCRIPT_DIR%nssm.exe"
    %ps_echo% "  ✓ NSSM installed successfully" -ForegroundColor %GREEN%
    echo.
) else (
    set "NSSM_PATH=nssm"
    %ps_echo% "  ✓ NSSM found in system PATH" -ForegroundColor %GREEN%
    echo.
)
exit /b 0

:setup_redis
set "REDIS_DIR=%PROJECT_ROOT%\redis"
set "REDIS_EXE=%REDIS_DIR%\redis-server.exe"

if not exist "%REDIS_EXE%" (
    %ps_echo% "Redis not found. Downloading and installing..." -ForegroundColor %YELLOW%
    echo.
ECHO is off.
    set "REDIS_TEMP=%PROJECT_ROOT%\temp_redis"
    if not exist "" mkdir ""
ECHO is off.
    powershell -Command "try { Invoke-WebRequest -Uri 'https://github.com/microsoftarchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.zip' -OutFile '\redis.zip' -ErrorAction Stop; Write-Host '  ✓ Downloaded Redis' -ForegroundColor Green } catch { Write-Host '  ✗ Failed to download Redis' -ForegroundColor Red; exit 1 }"
ECHO is off.
    if not exist "\redis.zip" (
        %ps_echo% "Failed to download Redis. Please check your internet connection." -ForegroundColor %RED%
        exit /b 1
    )
ECHO is off.
    if not exist "%REDIS_DIR%" mkdir "%REDIS_DIR%"
    powershell -Command "Expand-Archive -Path '\redis.zip' -DestinationPath '%REDIS_DIR%' -Force"
ECHO is off.
    rmdir /s /q ""
ECHO is off.
    %ps_echo% "  ✓ Redis installed successfully" -ForegroundColor %GREEN%
    echo.
) else (
    %ps_echo% "  ✓ Redis found at: %REDIS_DIR%" -ForegroundColor %GREEN%
    echo.
)

:: Create Redis configuration file
set "REDIS_CONF=%REDIS_DIR%\redis.conf"
(
    echo bind 127.0.0.1
    echo port 6379
    echo timeout 0
    echo loglevel notice
    echo logfile "redis.log"
    echo databases 16
    echo save 900 1
    echo save 300 10
    echo save 60 10000
    echo dir %REDIS_DIR%
    echo maxmemory 256mb
    echo maxmemory-policy allkeys-lru
) > "%REDIS_CONF%"

%ps_echo% "  ✓ Redis configuration created" -ForegroundColor %GREEN%
echo.
exit /b 0

:verify_python
set "PYTHON_PATH=%PROJECT_ROOT%\venv\Scripts\python.exe"
if not exist "%PYTHON_PATH%" (
    %ps_echo% "ERROR: Python virtual environment not found" -ForegroundColor %RED%
    echo Expected location: %PYTHON_PATH%
    echo.
    echo Please ensure your virtual environment is set up correctly.
    exit /b 1
)

set "CELERY_PATH=%PROJECT_ROOT%\venv\Scripts\celery.exe"
if not exist "%CELERY_PATH%" (
    %ps_echo% "ERROR: Celery not found in virtual environment" -ForegroundColor %RED%
    echo Expected location: %CELERY_PATH%
    echo.
    echo Please install Celery: pip install celery
    exit /b 1
)

set "RUN_APP_PATH=%PROJECT_ROOT%\run_app.py"
if not exist "%RUN_APP_PATH%" (
    %ps_echo% "ERROR: run_app.py not found" -ForegroundColor %RED%
    echo Expected location: %RUN_APP_PATH%
    echo.
    exit /b 1
)

%ps_echo% "  ✓ Python and Celery verified" -ForegroundColor %GREEN%
echo.
exit /b 0

:remove_existing_services
%ps_echo% "Checking for existing services..." -ForegroundColor %YELLOW%

sc query RedisServer >nul 2>&1
if %errorlevel% equ 0 (
    net stop RedisServer >nul 2>&1
    "%NSSM_PATH%" remove RedisServer confirm >nul 2>&1
    %ps_echo% "  ✓ Removed existing RedisServer service" -ForegroundColor %YELLOW%
)

sc query DjangoPythonApp >nul 2>&1
if %errorlevel% equ 0 (
    net stop DjangoPythonApp >nul 2>&1
    "%NSSM_PATH%" remove DjangoPythonApp confirm >nul 2>&1
    %ps_echo% "  ✓ Removed existing DjangoPythonApp service" -ForegroundColor %YELLOW%
)

sc query DjangoCeleryWorker >nul 2>&1
if %errorlevel% equ 0 (
    net stop DjangoCeleryWorker >nul 2>&1
    "%NSSM_PATH%" remove DjangoCeleryWorker confirm >nul 2>&1
    %ps_echo% "  ✓ Removed existing DjangoCeleryWorker service" -ForegroundColor %YELLOW%
)

sc query DjangoCeleryBeat >nul 2>&1
if %errorlevel% equ 0 (
    net stop DjangoCeleryBeat >nul 2>&1
    "%NSSM_PATH%" remove DjangoCeleryBeat confirm >nul 2>&1
    %ps_echo% "  ✓ Removed existing DjangoCeleryBeat service" -ForegroundColor %YELLOW%
)

echo.
exit /b 0

:display_completion
%ps_echo% "========================================" -ForegroundColor %GREEN%
%ps_echo% "   Installation Complete" -ForegroundColor %GREEN%
%ps_echo% "========================================" -ForegroundColor %GREEN%
echo.
echo Services installed and configured:
echo.
echo   1. RedisServer
echo      - Port: 6379
echo      - Config: %REDIS_CONF%
echo      - Auto-starts on system boot
echo.
echo   2. DjangoPythonApp
echo      - Runs: run-app.py
echo      - Depends on: RedisServer
echo      - Auto-starts after Redis
echo.
echo   3. DjangoCeleryWorker
echo      - Depends on: DjangoPythonApp
echo      - Auto-starts after Django App
echo.
echo   4. DjangoCeleryBeat
echo      - Depends on: DjangoPythonApp
echo      - Auto-starts after Django App
echo.
echo Logs location: %PROJECT_ROOT%\logs\
echo Redis location: %REDIS_DIR%
echo.
%ps_echo% "Useful Commands:" -ForegroundColor %CYAN%
echo.
echo Start all services:
echo   net start RedisServer
echo   net start DjangoPythonApp
echo   net start DjangoCeleryWorker
echo   net start DjangoCeleryBeat
echo.
echo Stop all services:
echo   net stop DjangoCeleryBeat
echo   net stop DjangoCeleryWorker
echo   net stop DjangoPythonApp
echo   net stop RedisServer
echo.
echo Remove services:
echo   remove_services.bat
echo.
%ps_echo% "========================================" -ForegroundColor %GREEN%
exit /b 0

:create_removal_script
(
    echo @echo off
    echo net session ^>nul 2^>^&1
    echo if %%errorlevel%% neq 0 ^(
    echo     echo Requesting Administrator privileges...
    echo     powershell -Command "Start-Process '%%~f0' -Verb RunAs"
    echo     exit /b
    echo ^)
    echo.
    echo echo Stopping and removing services...
    echo echo.
    echo net stop DjangoCeleryBeat
    echo net stop DjangoCeleryWorker
    echo net stop DjangoPythonApp
    echo net stop RedisServer
    echo.
    echo "%NSSM_PATH%" remove DjangoCeleryBeat confirm
    echo "%NSSM_PATH%" remove DjangoCeleryWorker confirm
    echo "%NSSM_PATH%" remove DjangoPythonApp confirm
    echo "%NSSM_PATH%" remove RedisServer confirm
    echo.
    echo echo Services removed successfully
    echo pause
) > "%PROJECT_ROOT%\remove_services.bat"

%ps_echo% "Removal script created: remove_services.bat" -ForegroundColor %YELLOW%
echo.
exit /b 0
