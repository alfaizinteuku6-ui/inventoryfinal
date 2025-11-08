@echo off
setlocal enabledelayedexpansion

set "NGINX_DIR=%PROJECT_ROOT%\nginx"
set "NGINX_EXE=%NGINX_DIR%\nginx.exe"

if not exist "%NGINX_EXE%" (
    powershell -Command Write-Host "Nginx not found. Downloading and installing..." -ForegroundColor Yellow
    echo.
    
    set "NGINX_TEMP=%PROJECT_ROOT%\temp_nginx"
    if not exist "!NGINX_TEMP!" mkdir "!NGINX_TEMP!"
    
    set "NGINX_ZIP=!NGINX_TEMP!\nginx.zip"
    
    powershell -ExecutionPolicy Bypass -Command "$ProgressPreference = 'SilentlyContinue'; try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nginx.org/download/nginx-1.24.0.zip' -OutFile '!NGINX_ZIP!' -UseBasicParsing -TimeoutSec 30; Write-Host '  ✓ Downloaded Nginx' -ForegroundColor Green; exit 0 } catch { Write-Host '  ✗ Failed to download Nginx: ' $_.Exception.Message -ForegroundColor Red; exit 1 }"
    
    if !errorlevel! neq 0 (
        powershell -Command Write-Host "" -ForegroundColor Red
        powershell -Command Write-Host "Failed to download Nginx." -ForegroundColor Red
        echo.
        echo Please download Nginx manually:
        echo 1. Visit: https://nginx.org/en/download.html
        echo 2. Download nginx-1.24.0.zip
        echo 3. Extract to: %NGINX_DIR%
        echo 4. Run this script again
        echo.
        pause
        exit /b 1
    )
    
    if not exist "!NGINX_ZIP!" (
        powershell -Command Write-Host "Nginx zip file not found after download." -ForegroundColor Red
        exit /b 1
    )
    
    powershell -Command Write-Host "  Extracting Nginx..." -ForegroundColor Cyan
    powershell -ExecutionPolicy Bypass -Command "try { Expand-Archive -Path '!NGINX_ZIP!' -DestinationPath '%PROJECT_ROOT%' -Force; Write-Host '  ✓ Extracted Nginx' -ForegroundColor Green } catch { Write-Host '  ✗ Failed to extract: ' $_.Exception.Message -ForegroundColor Red; exit 1 }"
    
    if !errorlevel! neq 0 (
        powershell -Command Write-Host "Failed to extract Nginx." -ForegroundColor Red
        exit /b 1
    )
    
    :: Move extracted folder to correct location
    if exist "%PROJECT_ROOT%\nginx-1.24.0" (
        if exist "%NGINX_DIR%" rmdir /s /q "%NGINX_DIR%"
        move "%PROJECT_ROOT%\nginx-1.24.0" "%NGINX_DIR%" >nul
    )
    
    if exist "!NGINX_TEMP!" rmdir /s /q "!NGINX_TEMP!"
    
    powershell -Command Write-Host "  ✓ Nginx installed successfully" -ForegroundColor Green
    echo.
) else (
    powershell -Command Write-Host "  ✓ Nginx found at: %NGINX_DIR%" -ForegroundColor Green
    echo.
)

:: Create directories for Nginx
if not exist "%NGINX_DIR%\logs" mkdir "%NGINX_DIR%\logs"
if not exist "%NGINX_DIR%\ssl" mkdir "%NGINX_DIR%\ssl"
if not exist "%NGINX_DIR%\conf" mkdir "%NGINX_DIR%\conf"

:: Generate self-signed SSL certificate
call "%FUNCTIONS_DIR%\generate_ssl_certificate.bat"

:: Create Nginx configuration file (ALWAYS recreate to ensure latest config)
call "%FUNCTIONS_DIR%\create_nginx_config.bat"

:: Reload Nginx config if service is running
sc query NginxServer | find "RUNNING" >nul 2>&1
if %errorlevel% equ 0 (
    powershell -Command Write-Host "  Reloading Nginx configuration..." -ForegroundColor Cyan
    cd /d "%NGINX_DIR%"
    nginx.exe -s reload >nul 2>&1
    powershell -Command Write-Host "  ✓ Nginx configuration reloaded" -ForegroundColor Green
)

exit /b 0