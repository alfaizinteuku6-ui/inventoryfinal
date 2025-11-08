@echo off
setlocal enabledelayedexpansion

set "SSL_DIR=%NGINX_DIR%\ssl"
set "SSL_CERT=%SSL_DIR%\server.crt"
set "SSL_KEY=%SSL_DIR%\server.key"

if exist "%SSL_CERT%" (
    if exist "%SSL_KEY%" (
        powershell -Command Write-Host "  ✓ SSL certificate already exists" -ForegroundColor Green
        exit /b 0
    )
)

:: Use the PowerShell script for SSL generation
set "PS_SCRIPT=%FUNCTIONS_DIR%\generate_ssl.ps1"

:: Check if PowerShell script exists
if not exist "%PS_SCRIPT%" (
    powershell -Command Write-Host "  ✗ PowerShell script not found: %PS_SCRIPT%" -ForegroundColor Red
    exit /b 1
)

:: Execute the PowerShell script
powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%" -CertPath "%SSL_CERT%" -KeyPath "%SSL_KEY%"
set SSL_RESULT=%errorlevel%

if %SSL_RESULT% neq 0 (
    powershell -Command Write-Host "  ! SSL certificate generation failed. Nginx will run in HTTP-only mode." -ForegroundColor Yellow
    echo.
    exit /b 0
)

:: Verify files were created
if not exist "%SSL_CERT%" (
    powershell -Command Write-Host "  ! Certificate file not found after generation" -ForegroundColor Yellow
    exit /b 0
)

if not exist "%SSL_KEY%" (
    powershell -Command Write-Host "  ! Key file not found after generation" -ForegroundColor Yellow
    exit /b 0
)

echo.
exit /b 0