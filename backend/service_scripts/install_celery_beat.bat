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

%ps_echo% "[4/5] Installing Celery Beat service..." -ForegroundColor %CYAN%

:: Remove service if it exists
sc query DjangoCeleryBeat >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  Removing existing DjangoCeleryBeat service..." -ForegroundColor %YELLOW%
    net stop DjangoCeleryBeat >nul 2>&1
    sc delete DjangoCeleryBeat >nul 2>&1
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

:: Detect Django project name
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

:: Install Celery Beat service
"%NSSM_PATH%" install DjangoCeleryBeat "%CELERY_PATH%" "-A" "%DJANGO_PROJECT%" "beat" "--loglevel=info"
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Celery Beat service" -ForegroundColor %RED%
    exit /b 1
)

:: Wait for service registration
timeout /t 1 >nul

:: Verify service was created
sc query DjangoCeleryBeat >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Celery Beat service was not created properly" -ForegroundColor %RED%
    exit /b 1
)

:: Configure service settings
"%NSSM_PATH%" set DjangoCeleryBeat AppDirectory "%PROJECT_ROOT%" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat DisplayName "Django Celery Beat Scheduler" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat Description "Celery beat scheduler for periodic tasks" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat Start SERVICE_AUTO_START >nul 2>&1

:: Set up logging
if not exist "%PROJECT_ROOT%\logs" mkdir "%PROJECT_ROOT%\logs"
"%NSSM_PATH%" set DjangoCeleryBeat AppStdout "%PROJECT_ROOT%\logs\celery_beat_stdout.log" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat AppStderr "%PROJECT_ROOT%\logs\celery_beat_stderr.log" >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat AppRotateFiles 1 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat AppRotateBytes 10485760 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat AppRotateOnline 1 >nul 2>&1

:: Set dependencies (start after Django App)
"%NSSM_PATH%" set DjangoCeleryBeat DependOnService DjangoPythonApp >nul 2>&1

:: Set stop method timeouts
"%NSSM_PATH%" set DjangoCeleryBeat AppStopMethodSkip 6 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat AppStopMethodConsole 5000 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat AppStopMethodWindow 5000 >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat AppStopMethodThreads 5000 >nul 2>&1

:: Set restart options
"%NSSM_PATH%" set DjangoCeleryBeat AppExit Default Restart >nul 2>&1
"%NSSM_PATH%" set DjangoCeleryBeat AppRestartDelay 5000 >nul 2>&1

:: Set throttle
"%NSSM_PATH%" set DjangoCeleryBeat AppThrottle 10000 >nul 2>&1

%ps_echo% "  ✓ Celery Beat service installed successfully" -ForegroundColor %GREEN%
echo.
exit /b 0