@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "CYAN=Cyan"

%ps_echo% "[1/4] Installing Redis service..." -ForegroundColor %CYAN%

:: Install Redis service with just the executable (config will be set via working directory)
"%NSSM_PATH%" install RedisServer "%REDIS_EXE%"
if %errorlevel% neq 0 (
    %ps_echo% "  ✗ Failed to install Redis service" -ForegroundColor %RED%
    exit /b 1
)

:: Configure Redis service with proper settings
"%NSSM_PATH%" set RedisServer AppDirectory "%REDIS_DIR%"
"%NSSM_PATH%" set RedisServer AppParameters "%REDIS_CONF%"
"%NSSM_PATH%" set RedisServer DisplayName "Redis Server"
"%NSSM_PATH%" set RedisServer Description "Redis in-memory data store"
"%NSSM_PATH%" set RedisServer Start SERVICE_AUTO_START

:: Set up logging
"%NSSM_PATH%" set RedisServer AppStdout "%REDIS_DIR%\redis_stdout.log"
"%NSSM_PATH%" set RedisServer AppStderr "%REDIS_DIR%\redis_stderr.log"
"%NSSM_PATH%" set RedisServer AppRotateFiles 1
"%NSSM_PATH%" set RedisServer AppRotateBytes 10485760
"%NSSM_PATH%" set RedisServer AppRotateOnline 1

:: Set startup delay to ensure clean start
"%NSSM_PATH%" set RedisServer AppStopMethodSkip 0
"%NSSM_PATH%" set RedisServer AppStopMethodConsole 1500
"%NSSM_PATH%" set RedisServer AppStopMethodWindow 1500
"%NSSM_PATH%" set RedisServer AppStopMethodThreads 1500

:: Set restart options
"%NSSM_PATH%" set RedisServer AppExit Default Restart
"%NSSM_PATH%" set RedisServer AppRestartDelay 5000

%ps_echo% "  ✓ Redis service installed" -ForegroundColor %GREEN%
echo.
exit /b 0