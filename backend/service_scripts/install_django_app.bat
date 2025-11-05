@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "CYAN=Cyan"

%ps_echo% "[2/4] Installing Django Python App service..." -ForegroundColor %CYAN%

:: Create logs directory if it doesn't exist
if not exist "%PROJECT_ROOT%\logs" mkdir "%PROJECT_ROOT%\logs"

"%NSSM_PATH%" install DjangoPythonApp "%PYTHON_PATH%" "%RUN_APP_PATH%"
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Django App service" -ForegroundColor %RED%
    exit /b 1
)

"%NSSM_PATH%" set DjangoPythonApp AppDirectory "%PROJECT_ROOT%"
"%NSSM_PATH%" set DjangoPythonApp DisplayName "Django Python Application"
"%NSSM_PATH%" set DjangoPythonApp Description "Django application server (run-app.py)"
"%NSSM_PATH%" set DjangoPythonApp Start SERVICE_AUTO_START
"%NSSM_PATH%" set DjangoPythonApp DependOnService RedisServer
"%NSSM_PATH%" set DjangoPythonApp AppStdout "%PROJECT_ROOT%\logs\app_stdout.log"
"%NSSM_PATH%" set DjangoPythonApp AppStderr "%PROJECT_ROOT%\logs\app_stderr.log"
"%NSSM_PATH%" set DjangoPythonApp AppRotateFiles 1
"%NSSM_PATH%" set DjangoPythonApp AppRotateBytes 10485760

%ps_echo% "  ✓ Django App service installed" -ForegroundColor %GREEN%
echo.
exit /b 0
