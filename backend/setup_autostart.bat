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
%ps_echo% "   Django App + Celery Worker + Beat" -ForegroundColor %BLUE%
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

:: Check if NSSM exists
where nssm >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "NSSM not found. Downloading and installing..." -ForegroundColor %YELLOW%
    echo.
    
    :: Create temp directory
    set "TEMP_DIR=%PROJECT_ROOT%\temp_nssm"
    if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"
    
    :: Download NSSM
    powershell -Command "try { Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '%TEMP_DIR%\nssm.zip' -ErrorAction Stop; Write-Host '  ✓ Downloaded NSSM' -ForegroundColor Green } catch { Write-Host '  ✗ Failed to download NSSM' -ForegroundColor Red; exit 1 }"
    
    if not exist "%TEMP_DIR%\nssm.zip" (
        %ps_echo% "Failed to download NSSM. Please check your internet connection." -ForegroundColor %RED%
        pause
        exit /b 1
    )
    
    :: Extract NSSM
    powershell -Command "Expand-Archive -Path '%TEMP_DIR%\nssm.zip' -DestinationPath '%TEMP_DIR%' -Force"
    
    :: Copy appropriate version based on system architecture
    if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
        copy "%TEMP_DIR%\nssm-2.24\win64\nssm.exe" "%SCRIPT_DIR%nssm.exe" >nul
    ) else (
        copy "%TEMP_DIR%\nssm-2.24\win32\nssm.exe" "%SCRIPT_DIR%nssm.exe" >nul
    )
    
    :: Cleanup
    rmdir /s /q "%TEMP_DIR%"
    
    set "NSSM_PATH=%SCRIPT_DIR%nssm.exe"
    %ps_echo% "  ✓ NSSM installed successfully" -ForegroundColor %GREEN%
    echo.
) else (
    set "NSSM_PATH=nssm"
    %ps_echo% "  ✓ NSSM found in system PATH" -ForegroundColor %GREEN%
    echo.
)

:: Verify Python installation
set "PYTHON_PATH=%PROJECT_ROOT%\venv\Scripts\python.exe"
if not exist "%PYTHON_PATH%" (
    %ps_echo% "ERROR: Python virtual environment not found!" -ForegroundColor %RED%
    echo Expected location: %PYTHON_PATH%
    echo.
    echo Please ensure your virtual environment is set up correctly.
    pause
    exit /b 1
)

:: Verify Celery installation
set "CELERY_PATH=%PROJECT_ROOT%\venv\Scripts\celery.exe"
if not exist "%CELERY_PATH%" (
    %ps_echo% "ERROR: Celery not found in virtual environment!" -ForegroundColor %RED%
    echo Expected location: %CELERY_PATH%
    echo.
    echo Please install Celery: pip install celery
    pause
    exit /b 1
)

:: Verify run-app.py exists
set "RUN_APP_PATH=%PROJECT_ROOT%\run_app.py"
if not exist "%RUN_APP_PATH%" (
    %ps_echo% "ERROR: run_app.py not found!" -ForegroundColor %RED%
    echo Expected location: %RUN_APP_PATH%
    echo.
    pause
    exit /b 1
)

%ps_echo% "========================================" -ForegroundColor %CYAN%
%ps_echo% "   Installing Services..." -ForegroundColor %CYAN%
%ps_echo% "========================================" -ForegroundColor %CYAN%
echo.

:: Remove existing services if they exist
%ps_echo% "Checking for existing services..." -ForegroundColor %YELLOW%
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

:: Install Django Python App Service
%ps_echo% "[1/3] Installing Django Python App service..." -ForegroundColor %CYAN%
"%NSSM_PATH%" install DjangoPythonApp "%PYTHON_PATH%" "%RUN_APP_PATH%"
"%NSSM_PATH%" set DjangoPythonApp AppDirectory "%PROJECT_ROOT%"
"%NSSM_PATH%" set DjangoPythonApp DisplayName "Django Python Application"
"%NSSM_PATH%" set DjangoPythonApp Description "Django application server (run-app.py)"
"%NSSM_PATH%" set DjangoPythonApp Start SERVICE_AUTO_START
"%NSSM_PATH%" set DjangoPythonApp AppStdout "%PROJECT_ROOT%\logs\app_stdout.log"
"%NSSM_PATH%" set DjangoPythonApp AppStderr "%PROJECT_ROOT%\logs\app_stderr.log"
"%NSSM_PATH%" set DjangoPythonApp AppRotateFiles 1
"%NSSM_PATH%" set DjangoPythonApp AppRotateBytes 10485760

:: Create logs directory if it doesn't exist
if not exist "%PROJECT_ROOT%\logs" mkdir "%PROJECT_ROOT%\logs"

if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Django App service installed" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to install Django App service" -ForegroundColor %RED%
)
echo.

:: Install Celery Worker Service with dependency on Django App
%ps_echo% "[2/3] Installing Celery Worker service..." -ForegroundColor %CYAN%
"%NSSM_PATH%" install DjangoCeleryWorker "%CELERY_PATH%" -A config worker -l info --pool=solo
"%NSSM_PATH%" set DjangoCeleryWorker AppDirectory "%PROJECT_ROOT%"
"%NSSM_PATH%" set DjangoCeleryWorker DisplayName "Django Celery Worker"
"%NSSM_PATH%" set DjangoCeleryWorker Description "Celery worker for Django application"
"%NSSM_PATH%" set DjangoCeleryWorker Start SERVICE_AUTO_START
"%NSSM_PATH%" set DjangoCeleryWorker DependOnService DjangoPythonApp
"%NSSM_PATH%" set DjangoCeleryWorker AppStdout "%PROJECT_ROOT%\logs\worker_stdout.log"
"%NSSM_PATH%" set DjangoCeleryWorker AppStderr "%PROJECT_ROOT%\logs\worker_stderr.log"
"%NSSM_PATH%" set DjangoCeleryWorker AppRotateFiles 1
"%NSSM_PATH%" set DjangoCeleryWorker AppRotateBytes 10485760

if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Worker service installed" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to install Celery Worker service" -ForegroundColor %RED%
)
echo.

:: Install Celery Beat Service with dependency on Django App
%ps_echo% "[3/3] Installing Celery Beat service..." -ForegroundColor %CYAN%
"%NSSM_PATH%" install DjangoCeleryBeat "%CELERY_PATH%" -A config beat -l info
"%NSSM_PATH%" set DjangoCeleryBeat AppDirectory "%PROJECT_ROOT%"
"%NSSM_PATH%" set DjangoCeleryBeat DisplayName "Django Celery Beat Scheduler"
"%NSSM_PATH%" set DjangoCeleryBeat Description "Celery beat scheduler for Django application"
"%NSSM_PATH%" set DjangoCeleryBeat Start SERVICE_AUTO_START
"%NSSM_PATH%" set DjangoCeleryBeat DependOnService DjangoPythonApp
"%NSSM_PATH%" set DjangoCeleryBeat AppStdout "%PROJECT_ROOT%\logs\beat_stdout.log"
"%NSSM_PATH%" set DjangoCeleryBeat AppStderr "%PROJECT_ROOT%\logs\beat_stderr.log"
"%NSSM_PATH%" set DjangoCeleryBeat AppRotateFiles 1
"%NSSM_PATH%" set DjangoCeleryBeat AppRotateBytes 10485760

if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Beat service installed" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to install Celery Beat service" -ForegroundColor %RED%
)
echo.

:: Start services
%ps_echo% "========================================" -ForegroundColor %CYAN%
%ps_echo% "   Starting Services..." -ForegroundColor %CYAN%
%ps_echo% "========================================" -ForegroundColor %CYAN%
echo.

%ps_echo% "Starting Django Python App..." -ForegroundColor %YELLOW%
net start DjangoPythonApp
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Django App started" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to start Django App" -ForegroundColor %RED%
)
echo.

:: Wait a few seconds for Django to initialize
timeout /t 5 /nobreak >nul

%ps_echo% "Starting Celery Worker..." -ForegroundColor %YELLOW%
net start DjangoCeleryWorker
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Worker started" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to start Celery Worker" -ForegroundColor %RED%
)
echo.

%ps_echo% "Starting Celery Beat..." -ForegroundColor %YELLOW%
net start DjangoCeleryBeat
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Beat started" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to start Celery Beat" -ForegroundColor %RED%
)
echo.

:: Display service status
%ps_echo% "========================================" -ForegroundColor %GREEN%
%ps_echo% "   Installation Complete!" -ForegroundColor %GREEN%
%ps_echo% "========================================" -ForegroundColor %GREEN%
echo.
echo Services installed and configured:
echo.
echo   1. DjangoPythonApp
echo      - Runs: run-app.py
echo      - Auto-starts on system boot
echo.
echo   2. DjangoCeleryWorker
echo      - Depends on: DjangoPythonApp
echo      - Auto-starts after Django App
echo.
echo   3. DjangoCeleryBeat
echo      - Depends on: DjangoPythonApp
echo      - Auto-starts after Django App
echo.
echo Logs location: %PROJECT_ROOT%\logs\
echo   - app_stdout.log / app_stderr.log
echo   - worker_stdout.log / worker_stderr.log
echo   - beat_stdout.log / beat_stderr.log
echo.
%ps_echo% "Useful Commands:" -ForegroundColor %CYAN%
echo.
echo Start all services:
echo   net start DjangoPythonApp
echo   net start DjangoCeleryWorker
echo   net start DjangoCeleryBeat
echo.
echo Stop all services:
echo   net stop DjangoCeleryBeat
echo   net stop DjangoCeleryWorker
echo   net stop DjangoPythonApp
echo.
echo Restart services:
echo   net stop DjangoPythonApp ^&^& net start DjangoPythonApp
echo.
echo Check service status:
echo   sc query DjangoPythonApp
echo   sc query DjangoCeleryWorker
echo   sc query DjangoCeleryBeat
echo.
echo View/manage services:
echo   - Press Win+R, type: services.msc
echo   - Look for "Django" services
echo.
echo Remove services (if needed):
echo   - Run: remove_services.bat
echo.
%ps_echo% "========================================" -ForegroundColor %GREEN%
pause

:: Create removal script with auto-elevation
(
    echo @echo off
    echo :: Check for admin rights and auto-elevate if needed
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
    echo.
    echo "%NSSM_PATH%" remove DjangoCeleryBeat confirm
    echo "%NSSM_PATH%" remove DjangoCeleryWorker confirm
    echo "%NSSM_PATH%" remove DjangoPythonApp confirm
    echo.
    echo echo Services removed successfully!
    echo pause
) > "%PROJECT_ROOT%\remove_services.bat"

%ps_echo% "Removal script created: remove_services.bat" -ForegroundColor %YELLOW%
echo.
pause
exit /b 0