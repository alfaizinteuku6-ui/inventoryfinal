@echo off
setlocal enabledelayedexpansion

set "ps_echo=powershell -Command Write-Host"
set "GREEN=Green"
set "RED=Red"
set "YELLOW=Yellow"

echo ========================================
echo Redis Health Monitor
echo ========================================
echo Press Ctrl+C to stop monitoring
echo.

:monitor_loop
cls
echo [%date% %time%] Checking Redis status...
echo.

sc query RedisServer | find "RUNNING" >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "Service Status: RUNNING" -ForegroundColor %GREEN%
    
    :: Test connection
    powershell -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('localhost', 6379); Write-Host 'Connection Test: OK' -ForegroundColor Green; $client.Close() } catch { Write-Host 'Connection Test: FAILED' -ForegroundColor Red }"
) else (
    %ps_echo% "Service Status: STOPPED" -ForegroundColor %RED%
    %ps_echo% "Attempting to restart..." -ForegroundColor %YELLOW%
    net start RedisServer >nul 2>&1
)

echo.
echo Recent errors:
if exist "%REDIS_DIR%\redis_stderr.log" (
    powershell -Command "Get-Content '%REDIS_DIR%\redis_stderr.log' -Tail 5 -ErrorAction SilentlyContinue"
)

timeout /t 10 /nobreak >nul
goto monitor_loop