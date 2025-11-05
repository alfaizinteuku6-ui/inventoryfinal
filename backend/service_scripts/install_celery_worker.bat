@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "CYAN=Cyan"

%ps_echo% "[3/4] Installing Celery Worker service..." -ForegroundColor %CYAN%

"%NSSM_PATH%" install DjangoCeleryWorker "%CELERY_PATH%" -A config worker -l info --pool=solo
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Celery Worker service" -ForegroundColor %RED%
    exit /b 1
)

"%NSSM_PATH%" set DjangoCeleryWorker AppDirectory "%PROJECT_ROOT%"
"%NSSM_PATH%" set DjangoCeleryWorker DisplayName "Django Celery Worker"
"%NSSM_PATH%" set DjangoCeleryWorker Description "Celery worker for Django application"
"%NSSM_PATH%" set DjangoCeleryWorker Start SERVICE_AUTO_START
"%NSSM_PATH%" set DjangoCeleryWorker DependOnService DjangoPythonApp
"%NSSM_PATH%" set DjangoCeleryWorker AppStdout "%PROJECT_ROOT%\logs\worker_stdout.log"
"%NSSM_PATH%" set DjangoCeleryWorker AppStderr "%PROJECT_ROOT%\logs\worker_stderr.log"
"%NSSM_PATH%" set DjangoCeleryWorker AppRotateFiles 1
"%NSSM_PATH%" set DjangoCeleryWorker AppRotateBytes 10485760

%ps_echo% "  ✓ Celery Worker service installed" -ForegroundColor %GREEN%
echo.
exit /b 0
