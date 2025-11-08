@echo off
setlocal enabledelayedexpansion

set "REDIS_DIR=%PROJECT_ROOT%\redis"
set "REDIS_EXE=%REDIS_DIR%\redis-server.exe"

if not exist "%REDIS_EXE%" (
    powershell -Command Write-Host "Redis not found. Downloading and installing..." -ForegroundColor Yellow
    echo.
    
    set "REDIS_TEMP=%PROJECT_ROOT%\temp_redis"
    if not exist "!REDIS_TEMP!" mkdir "!REDIS_TEMP!"
    
    set "REDIS_ZIP=!REDIS_TEMP!\redis.zip"
    
    powershell -ExecutionPolicy Bypass -Command "$ProgressPreference = 'SilentlyContinue'; try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/microsoftarchive/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.zip' -OutFile '!REDIS_ZIP!' -UseBasicParsing -TimeoutSec 30; Write-Host '  ✓ Downloaded Redis' -ForegroundColor Green; exit 0 } catch { Write-Host '  ✗ Failed to download Redis: ' $_.Exception.Message -ForegroundColor Red; exit 1 }"
    
    if !errorlevel! neq 0 (
        powershell -Command Write-Host "" -ForegroundColor Red
        powershell -Command Write-Host "Failed to download Redis." -ForegroundColor Red
        echo.
        echo Please download Redis manually:
        echo 1. Visit: https://github.com/microsoftarchive/redis/releases
        echo 2. Download Redis-x64-3.2.100.zip
        echo 3. Extract to: %REDIS_DIR%
        echo 4. Run this script again
        echo.
        pause
        exit /b 1
    )
    
    if not exist "!REDIS_ZIP!" (
        powershell -Command Write-Host "Redis zip file not found after download." -ForegroundColor Red
        exit /b 1
    )
    
    if not exist "%REDIS_DIR%" mkdir "%REDIS_DIR%"
    
    powershell -Command Write-Host "  Extracting Redis..." -ForegroundColor Cyan
    powershell -ExecutionPolicy Bypass -Command "try { Expand-Archive -Path '!REDIS_ZIP!' -DestinationPath '%REDIS_DIR%' -Force; Write-Host '  ✓ Extracted Redis' -ForegroundColor Green } catch { Write-Host '  ✗ Failed to extract: ' $_.Exception.Message -ForegroundColor Red; exit 1 }"
    
    if !errorlevel! neq 0 (
        powershell -Command Write-Host "Failed to extract Redis." -ForegroundColor Red
        exit /b 1
    )
    
    if exist "!REDIS_TEMP!" rmdir /s /q "!REDIS_TEMP!"
    
    powershell -Command Write-Host "  ✓ Redis installed successfully" -ForegroundColor Green
    echo.
) else (
    powershell -Command Write-Host "  ✓ Redis found at: %REDIS_DIR%" -ForegroundColor Green
    echo.
)

:: Create Redis configuration file
set "REDIS_CONF=%REDIS_DIR%\redis.conf"
(
    echo bind 127.0.0.1
    echo port 6379
    echo timeout 0
    echo loglevel notice
    echo logfile "redis.log"
    echo databases 16
    echo save 900 1
    echo save 300 10
    echo save 60 10000
    echo dir %REDIS_DIR%
    echo maxmemory 256mb
    echo maxmemory-policy allkeys-lru
) > "%REDIS_CONF%"

powershell -Command Write-Host "  ✓ Redis configuration created" -ForegroundColor Green
echo.

exit /b 0