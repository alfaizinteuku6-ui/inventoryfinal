@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "YELLOW=Yellow"
set "CYAN=Cyan"

%ps_echo% "Starting Redis Server..." -ForegroundColor %YELLOW%

:: Check if service exists
sc query RedisServer >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  X Redis service not found. Please run the installation script first." -ForegroundColor %RED%
    exit /b 1
)

:: Check if already running
sc query RedisServer | find "RUNNING" >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ! Redis service already running, testing connection..." -ForegroundColor %YELLOW%
    goto test_connection
)

:: Stop any existing Redis processes on port 6379
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6379 ^| findstr LISTENING') do (
    %ps_echo% "  ! Killing existing process on port 6379 (PID: %%a)" -ForegroundColor %YELLOW%
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Clear old logs
if exist "%REDIS_DIR%\redis_stderr.log" del "%REDIS_DIR%\redis_stderr.log" >nul 2>&1
if exist "%REDIS_DIR%\redis_stdout.log" del "%REDIS_DIR%\redis_stdout.log" >nul 2>&1

:: Start the service
%ps_echo% "  > Starting Redis service..." -ForegroundColor %CYAN%
net start RedisServer >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "  X Failed to start Redis service" -ForegroundColor %RED%
    goto show_errors
)

%ps_echo% "  + Redis service started" -ForegroundColor %GREEN%

:test_connection
:: Wait and test connection multiple times
%ps_echo% "  > Waiting for Redis to initialize..." -ForegroundColor %CYAN%

set "MAX_ATTEMPTS=10"
set "ATTEMPT=0"

:retry_connection
set /a ATTEMPT+=1
timeout /t 2 /nobreak >nul

:: Test if redis-server.exe process exists
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if %errorlevel% neq 0 (
    %ps_echo% "  X Redis process not running!" -ForegroundColor %RED%
    goto show_errors
)

:: Test TCP connection
powershell -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.ConnectAsync('127.0.0.1', 6379).Wait(1000); if ($client.Connected) { $client.Close(); exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1

if %errorlevel% equ 0 (
    %ps_echo% "  + Redis is responding on port 6379" -ForegroundColor %GREEN%
    echo.
    %ps_echo% "Redis Server started successfully!" -ForegroundColor %GREEN%
    exit /b 0
)

if %ATTEMPT% lss %MAX_ATTEMPTS% (
    echo   Attempt %ATTEMPT%/%MAX_ATTEMPTS% - Redis not ready yet, retrying...
    goto retry_connection
)

%ps_echo% "  X Redis started but not responding after %MAX_ATTEMPTS% attempts" -ForegroundColor %RED%

:show_errors
echo.
echo ========================================
echo ERROR DIAGNOSTICS
echo ========================================
echo.

:: Check if process is running
%ps_echo% "Redis Process Status:" -ForegroundColor %CYAN%
tasklist /FI "IMAGENAME eq redis-server.exe" | findstr redis-server.exe
if %errorlevel% neq 0 (
    echo No redis-server.exe process found
)
echo.

:: Check port
%ps_echo% "Port 6379 Status:" -ForegroundColor %CYAN%
netstat -ano | findstr :6379
if %errorlevel% neq 0 (
    echo Port 6379 is not listening
)
echo.

:: Show recent logs
%ps_echo% "Recent Error Logs:" -ForegroundColor %CYAN%
echo.

timeout /t 1 /nobreak >nul

if exist "%REDIS_DIR%\redis_stderr.log" (
    echo === STDERR (Last 15 lines) ===
    powershell -Command "Get-Content '%REDIS_DIR%\redis_stderr.log' -Tail 15 -ErrorAction SilentlyContinue"
    echo.
)

if exist "%REDIS_DIR%\redis_stdout.log" (
    echo === STDOUT (Last 15 lines) ===
    powershell -Command "Get-Content '%REDIS_DIR%\redis_stdout.log' -Tail 15 -ErrorAction SilentlyContinue"
    echo.
)

if exist "%REDIS_DIR%\redis.log" (
    echo === REDIS.LOG (Last 15 lines) ===
    powershell -Command "Get-Content '%REDIS_DIR%\redis.log' -Tail 15 -ErrorAction SilentlyContinue"
    echo.
)

echo ========================================
echo SUGGESTED ACTIONS
echo ========================================
echo 1. Run: diagnose_redis.bat (for detailed diagnostics)
echo 2. Check Redis config: %REDIS_CONF%
echo 3. Try manual start: "%REDIS_EXE%" "%REDIS_CONF%"
echo 4. Check Windows Event Viewer for service errors
echo.

exit /b 1