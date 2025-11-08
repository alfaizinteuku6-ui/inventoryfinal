@echo off
setlocal enabledelayedexpansion

:: Check if SSL is enabled
set "USE_SSL=0"
if exist "%NGINX_DIR%\ssl\server.crt" (
    if exist "%NGINX_DIR%\ssl\server.key" (
        set "USE_SSL=1"
    )
)

powershell -Command Write-Host "========================================" -ForegroundColor Green
powershell -Command Write-Host "   Installation Complete" -ForegroundColor Green
powershell -Command Write-Host "========================================" -ForegroundColor Green
echo.
echo Services installed and configured:
echo.
echo   1. RedisServer
echo      - Port: 6379
echo      - Config: %REDIS_DIR%\redis.conf
echo      - Auto-starts on system boot
echo.
echo   2. DjangoPythonApp
echo      - Runs: run_app.py (Uvicorn on port 8000)
echo      - Depends on: RedisServer
echo      - Auto-starts after Redis
echo.
echo   3. DjangoCeleryWorker
echo      - Depends on: DjangoPythonApp
echo      - Auto-starts after Django App
echo.
echo   4. DjangoCeleryBeat
echo      - Depends on: DjangoPythonApp
echo      - Auto-starts after Django App
echo.
echo   5. NginxServer
if "!USE_SSL!"=="1" (
    echo      - HTTP Port: 80 (redirects to HTTPS)
    echo      - HTTPS Port: 443
) else (
    echo      - HTTP Port: 80
)
echo      - Depends on: DjangoPythonApp
echo      - Auto-starts after Django App
echo      - Config: %NGINX_DIR%\conf\nginx.conf
echo.
powershell -Command Write-Host "Access your application at:" -ForegroundColor Cyan
if "!USE_SSL!"=="1" (
    echo   - https://localhost (HTTPS - Recommended)
    echo   - http://localhost (redirects to HTTPS)
) else (
    echo   - http://localhost
)
echo   - http://localhost:8000 (Direct to Django/Uvicorn)
echo.
if "!USE_SSL!"=="1" (
    powershell -Command Write-Host "Note: You'll see a security warning for self-signed certificate." -ForegroundColor Yellow
    echo       This is normal for local development.
    echo.
)
echo Logs location: %PROJECT_ROOT%\logs\
echo Nginx logs: %NGINX_DIR%\logs\
echo Nginx config: %NGINX_DIR%\conf\nginx.conf
echo Redis location: %REDIS_DIR%
echo Nginx location: %NGINX_DIR%
echo.
powershell -Command Write-Host "Useful Commands:" -ForegroundColor Cyan
echo.
echo Start all services:
echo   net start RedisServer
echo   net start DjangoPythonApp
echo   net start DjangoCeleryWorker
echo   net start DjangoCeleryBeat
echo   net start NginxServer
echo.
echo Stop all services:
echo   net stop NginxServer
echo   net stop DjangoCeleryBeat
echo   net stop DjangoCeleryWorker
echo   net stop DjangoPythonApp
echo   net stop RedisServer
echo.
echo Reload Nginx config (without stopping service):
echo   cd %NGINX_DIR%
echo   nginx.exe -s reload
echo.
echo Test Nginx config:
echo   cd %NGINX_DIR%
echo   nginx.exe -t
echo.
echo Remove services:
echo   remove_services.bat
echo.
powershell -Command Write-Host "========================================" -ForegroundColor Green
exit /b 0