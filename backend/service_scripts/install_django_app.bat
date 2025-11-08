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

%ps_echo% "[2/5] Installing Django App service..." -ForegroundColor %CYAN%

:: Remove service if it exists
sc query DjangoPythonApp >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  Removing existing DjangoPythonApp service..." -ForegroundColor %YELLOW%
    net stop DjangoPythonApp >nul 2>&1
    sc delete DjangoPythonApp >nul 2>&1
    timeout /t 2 >nul
)

:: Verify paths
if not exist "%NSSM_PATH%" (
    %ps_echo% "  ✗ NSSM not found at: %NSSM_PATH%" -ForegroundColor %RED%
    exit /b 1
)

if not exist "%PYTHON_PATH%" (
    %ps_echo% "  ✗ Python not found at: %PYTHON_PATH%" -ForegroundColor %RED%
    exit /b 1
)

if not exist "%RUN_APP_PATH%" (
    %ps_echo% "  ✗ run_app.py not found at: %RUN_APP_PATH%" -ForegroundColor %RED%
    exit /b 1
)

:: Install Django App service
"%NSSM_PATH%" install DjangoPythonApp "%PYTHON_PATH%" "%RUN_APP_PATH%"
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Django App service" -ForegroundColor %RED%
    exit /b 1
)

:: Wait for service registration
timeout /t 1 >nul

:: Verify service was created
sc query DjangoPythonApp >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Django App service was not created properly" -ForegroundColor %RED%
    exit /b 1
)

:: Configure service settings
"%NSSM_PATH%" set DjangoPythonApp AppDirectory "%PROJECT_ROOT%" >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp DisplayName "Django Python Application" >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp Description "Django web application with Uvicorn" >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp Start SERVICE_AUTO_START >nul 2>&1

:: Set up logging
if not exist "%PROJECT_ROOT%\logs" mkdir "%PROJECT_ROOT%\logs"
"%NSSM_PATH%" set DjangoPythonApp AppStdout "%PROJECT_ROOT%\logs\django_stdout.log" >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp AppStderr "%PROJECT_ROOT%\logs\django_stderr.log" >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp AppRotateFiles 1 >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp AppRotateBytes 10485760 >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp AppRotateOnline 1 >nul 2>&1

:: Set dependencies (start after Redis)
"%NSSM_PATH%" set DjangoPythonApp DependOnService RedisServer >nul 2>&1

:: Set stop method timeouts
"%NSSM_PATH%" set DjangoPythonApp AppStopMethodSkip 6 >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp AppStopMethodConsole 3000 >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp AppStopMethodWindow 3000 >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp AppStopMethodThreads 3000 >nul 2>&1

:: Set restart options
"%NSSM_PATH%" set DjangoPythonApp AppExit Default Restart >nul 2>&1
"%NSSM_PATH%" set DjangoPythonApp AppRestartDelay 5000 >nul 2>&1

:: Set throttle to prevent rapid restart loops
"%NSSM_PATH%" set DjangoPythonApp AppThrottle 10000 >nul 2>&1

%ps_echo% "  ✓ Django App service installed successfully" -ForegroundColor %GREEN%
echo.
exit /b 0