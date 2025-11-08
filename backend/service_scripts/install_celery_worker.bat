@echo off
setlocal enabledelayedexpansion

:: Load environment variables from the setup script
if exist "%~dp0..\service_env.bat" (
    call "%~dp0..\service_env.bat"
) else if exist "%~dp0service_env.bat" (
    call "%~dp0service_env.bat"
) else (
    echo ERROR: service_env.bat not found!
    echo Expected locations:
    echo   - %~dp0..\service_env.bat
    echo   - %~dp0service_env.bat
    exit /b 1
)

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "CYAN=Cyan"
set "YELLOW=Yellow"

%ps_echo% "[3/5] Installing Celery Worker service..." -ForegroundColor %CYAN%

:: Remove service if it exists
sc query DjangoCeleryWorker >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  Removing existing DjangoCeleryWorker service..." -ForegroundColor %YELLOW%
    net stop DjangoCeleryWorker >nul 2>&1
    sc delete DjangoCeleryWorker >nul 2>&1
    timeout /t 2 >nul
)

:: Verify paths
if not exist "%NSSM_PATH%" (
    %ps_echo% "  ✗ NSSM not found at: %NSSM_PATH%" -ForegroundColor %RED%
    exit /b 1
)

if not exist "%CELERY_PATH%" (
    %ps_echo% "  ✗ Celery not found at: %CELERY_PATH%" -ForegroundColor %RED%
    exit /b 1
)

:: Detect Django project name (look for settings.py)
set "DJANGO_PROJECT="
for /d %%i in ("%PROJECT_ROOT%\*") do (
    if exist "%%i\settings.py" (
        for %%j in ("%%i") do set "DJANGO_PROJECT=%%~nxj"
    )
)

if "%DJANGO_PROJECT%"=="" (
    %ps_echo% "  ✗ Could not find Django project (settings.py)" -ForegroundColor %RED%
    exit /b 1
)

:: Install Celery Worker service
"%NSSM_PATH%" install DjangoCeleryWorker "%CELERY_PATH%" "-A" "%DJANGO_PROJECT%" "worker" "--loglevel=info" "--pool=solo" "-n" "worker@%%H"
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Celery Worker service" -ForegroundColor %RED%
    exit /b 1
)

:: Wait for service registration
timeout /t 1 >nul

:: Verify service was created
sc query DjangoCeleryWorker >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Celery Worker service was not created properly" -ForegroundColor %RED%
    exit /b 1
)

:: Configure service settings
"%NSSM_PATH%" set DjangoCeleryWorker AppDirectory "%PROJECT_ROOT%" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker DisplayName "Django Celery Worker" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker Description "Celery worker for Django async tasks" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker Start SERVICE_AUTO_START >nul 2>&1

:: Set up logging
if not exist "%PROJECT_ROOT%\logs" mkdir "%PROJECT_ROOT%\logs"
"%NSSM_PATH%" set DjangoCeleryWorker AppStdout "%PROJECT_ROOT%\logs\celery_worker_stdout.log" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker AppStderr "%PROJECT_ROOT%\logs\celery_worker_stderr.log" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker AppRotateFiles 1 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker AppRotateBytes 10485760 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker AppRotateOnline 1 >nul 2>&1

:: Set dependencies (start after Django App)
"%NSSM_PATH%" set DjangoCeleryWorker DependOnService DjangoPythonApp >nul 2>&1

:: Set stop method timeouts
"%NSSM_PATH%" set DjangoCeleryWorker AppStopMethodSkip 6 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker AppStopMethodConsole 5000 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker AppStopMethodWindow 5000 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker AppStopMethodThreads 5000 >nul 2>&1

:: Set restart options
"%NSSM_PATH%" set DjangoCeleryWorker AppExit Default Restart >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryWorker AppRestartDelay 5000 >nul 2>&1

:: Set throttle
"%NSSM_PATH%" set DjangoCeleryWorker AppThrottle 10000 >nul 2>&1

%ps_echo% "  ✓ Celery Worker service installed successfully" -ForegroundColor %GREEN%
echo.
exit /b 0