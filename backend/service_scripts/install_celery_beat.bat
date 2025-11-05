@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "CYAN=Cyan"

%ps_echo% "[4/4] Installing Celery Beat service..." -ForegroundColor %CYAN%

"%NSSM_PATH%" install DjangoCeleryBeat "%CELERY_PATH%" -A config beat -l info
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Celery Beat service" -ForegroundColor %RED%
    exit /b 1
)

"%NSSM_PATH%" set DjangoCeleryBeat AppDirectory "%PROJECT_ROOT%"
"%NSSM_PATH%" set DjangoCeleryBeat DisplayName "Django Celery Beat Scheduler"
"%NSSM_PATH%" set DjangoCeleryBeat Description "Celery beat scheduler for Django application"
"%NSSM_PATH%" set DjangoCeleryBeat Start SERVICE_AUTO_START
"%NSSM_PATH%" set DjangoCeleryBeat DependOnService DjangoPythonApp
"%NSSM_PATH%" set DjangoCeleryBeat AppStdout "%PROJECT_ROOT%\logs\beat_stdout.log"
"%NSSM_PATH%" set DjangoCeleryBeat AppStderr "%PROJECT_ROOT%\logs\beat_stderr.log"
"%NSSM_PATH%" set DjangoCeleryBeat AppRotateFiles 1
"%NSSM_PATH%" set DjangoCeleryBeat AppRotateBytes 10485760

%ps_echo% "  ✓ Celery Beat service installed" -ForegroundColor %GREEN%
echo.
exit /b 0
