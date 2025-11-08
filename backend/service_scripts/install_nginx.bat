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

%ps_echo% "[5/5] Installing Nginx service..." -ForegroundColor %CYAN%

:: Remove service if it exists
sc query NginxServer >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  Removing existing NginxServer service..." -ForegroundColor %YELLOW%
    net stop NginxServer >nul 2>&1
    :: Kill any nginx processes
    taskkill /F /IM nginx.exe >nul 2>&1
    timeout /t 2 >nul
    sc delete NginxServer >nul 2>&1
    timeout /t 2 >nul
)

:: Verify paths
if not exist "%NSSM_PATH%" (
    %ps_echo% "  ✗ NSSM not found at: %NSSM_PATH%" -ForegroundColor %RED%
    exit /b 1
)

if not exist "%NGINX_EXE%" (
    %ps_echo% "  ✗ Nginx not found at: %NGINX_EXE%" -ForegroundColor %RED%
    exit /b 1
)

if not exist "%NGINX_DIR%\conf\nginx.conf" (
    %ps_echo% "  ✗ Nginx config not found at: %NGINX_DIR%\conf\nginx.conf" -ForegroundColor %RED%
    exit /b 1
)

:: Install Nginx service
"%NSSM_PATH%" install NginxServer "%NGINX_EXE%"
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Nginx service" -ForegroundColor %RED%
    exit /b 1
)

:: Wait for service registration
timeout /t 1 >nul

:: Verify service was created
sc query NginxServer >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Nginx service was not created properly" -ForegroundColor %RED%
    exit /b 1
)

:: Configure service settings
"%NSSM_PATH%" set NginxServer AppDirectory "%NGINX_DIR%" >nul 2>&1
"%NSSM_PATH%" set NginxServer DisplayName "Nginx Web Server" >nul 2>&1
"%NSSM_PATH%" set NginxServer Description "High-performance HTTP server and reverse proxy" >nul 2>&1
"%NSSM_PATH%" set NginxServer Start SERVICE_AUTO_START >nul 2>&1

:: Set up logging
"%NSSM_PATH%" set NginxServer AppStdout "%NGINX_DIR%\logs\service_stdout.log" >nul 2>&1
"%NSSM_PATH%" set NginxServer AppStderr "%NGINX_DIR%\logs\service_stderr.log" >nul 2>&1
"%NSSM_PATH%" set NginxServer AppRotateFiles 1 >nul 2>&1
"%NSSM_PATH%" set NginxServer AppRotateBytes 10485760 >nul 2>&1
"%NSSM_PATH%" set NginxServer AppRotateOnline 1 >nul 2>&1

:: Set dependencies (start after Django App)
"%NSSM_PATH%" set NginxServer DependOnService DjangoPythonApp >nul 2>&1

:: Set stop method - use quit signal for graceful shutdown
"%NSSM_PATH%" set NginxServer AppStopMethodSkip 0 >nul 2>&1
"%NSSM_PATH%" set NginxServer AppStopMethodConsole 2000 >nul 2>&1
"%NSSM_PATH%" set NginxServer AppStopMethodWindow 2000 >nul 2>&1
"%NSSM_PATH%" set NginxServer AppStopMethodThreads 2000 >nul 2>&1

:: Set restart options
"%NSSM_PATH%" set NginxServer AppExit Default Restart >nul 2>&1
"%NSSM_PATH%" set NginxServer AppRestartDelay 5000 >nul 2>&1

:: Set throttle
"%NSSM_PATH%" set NginxServer AppThrottle 10000 >nul 2>&1

:: Set environment variable for proper Nginx shutdown
"%NSSM_PATH%" set NginxServer AppEnvironmentExtra "NGINX_GRACEFUL_SHUTDOWN=1" >nul 2>&1

%ps_echo% "  ✓ Nginx service installed successfully" -ForegroundColor %GREEN%
echo.
exit /b 0