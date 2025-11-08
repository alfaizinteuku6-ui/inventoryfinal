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

%ps_echo% "[1/5] Installing Redis service..." -ForegroundColor %CYAN%

:: Remove service if it exists (even if broken)
sc query RedisServer >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  Removing existing RedisServer service..." -ForegroundColor %YELLOW%
    net stop RedisServer >nul 2>&1
    sc delete RedisServer >nul 2>&1
    timeout /t 2 >nul
)

:: Verify NSSM path
if not defined NSSM_PATH (
    %ps_echo% "  ✗ NSSM_PATH environment variable not set" -ForegroundColor %RED%
    exit /b 1
)

if not exist "%NSSM_PATH%" (
    %ps_echo% "  ✗ NSSM not found at: %NSSM_PATH%" -ForegroundColor %RED%
    exit /b 1
)

:: Verify Redis executable
if not defined REDIS_EXE (
    %ps_echo% "  ✗ REDIS_EXE environment variable not set" -ForegroundColor %RED%
    exit /b 1
)

if not exist "%REDIS_EXE%" (
    %ps_echo% "  ✗ Redis executable not found at: %REDIS_EXE%" -ForegroundColor %RED%
    exit /b 1
)

:: Verify Redis config
if not defined REDIS_CONF (
    %ps_echo% "  ✗ REDIS_CONF environment variable not set" -ForegroundColor %RED%
    exit /b 1
)

if not exist "%REDIS_CONF%" (
    %ps_echo% "  ✗ Redis config not found at: %REDIS_CONF%" -ForegroundColor %RED%
    exit /b 1
)

:: Install Redis service with NSSM - use full path to redis-server.exe and config
"%NSSM_PATH%" install RedisServer "%REDIS_EXE%" "%REDIS_CONF%"
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Redis service" -ForegroundColor %RED%
    exit /b 1
)

:: Wait a moment for service to register
timeout /t 1 >nul

:: Verify service was created
sc query RedisServer >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Redis service was not created properly" -ForegroundColor %RED%
    exit /b 1
)

:: Configure service settings
"%NSSM_PATH%" set RedisServer AppDirectory "%REDIS_DIR%" >nul 2>&1
"%NSSM_PATH%" set RedisServer DisplayName "Redis Server" >nul 2>&1
"%NSSM_PATH%" set RedisServer Description "Redis in-memory data store" >nul 2>&1
"%NSSM_PATH%" set RedisServer Start SERVICE_AUTO_START >nul 2>&1

:: Set up logging
"%NSSM_PATH%" set RedisServer AppStdout "%REDIS_DIR%\redis_stdout.log" >nul 2>&1
"%NSSM_PATH%" set RedisServer AppStderr "%REDIS_DIR%\redis_stderr.log" >nul 2>&1
"%NSSM_PATH%" set RedisServer AppRotateFiles 1 >nul 2>&1
"%NSSM_PATH%" set RedisServer AppRotateBytes 10485760 >nul 2>&1
"%NSSM_PATH%" set RedisServer AppRotateOnline 1 >nul 2>&1

:: Set stop method timeouts (graceful shutdown)
"%NSSM_PATH%" set RedisServer AppStopMethodSkip 0 >nul 2>&1
"%NSSM_PATH%" set RedisServer AppStopMethodConsole 1500 >nul 2>&1
"%NSSM_PATH%" set RedisServer AppStopMethodWindow 1500 >nul 2>&1
"%NSSM_PATH%" set RedisServer AppStopMethodThreads 1500 >nul 2>&1

:: Set restart options
"%NSSM_PATH%" set RedisServer AppExit Default Restart >nul 2>&1
"%NSSM_PATH%" set RedisServer AppRestartDelay 5000 >nul 2>&1

%ps_echo% "  ✓ Redis service installed successfully" -ForegroundColor %GREEN%
echo.
exit /b 0