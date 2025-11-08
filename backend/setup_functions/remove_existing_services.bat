@echo off
setlocal enabledelayedexpansion

:: Load environment variables if they exist
if exist "%PROJECT_ROOT%\service_env.bat" (
    call "%PROJECT_ROOT%\service_env.bat"
)

:: Set NSSM_PATH if not already set
if "%NSSM_PATH%"=="" (
    where nssm >nul 2>nul
    if %errorlevel% equ 0 (
        set "NSSM_PATH=nssm"
    ) else if exist "%SCRIPT_DIR%nssm.exe" (
        set "NSSM_PATH=%SCRIPT_DIR%nssm.exe"
    ) else if exist "%PROJECT_ROOT%\nssm.exe" (
        set "NSSM_PATH=%PROJECT_ROOT%\nssm.exe"
    )
)

powershell -Command Write-Host "Checking for existing services..." -ForegroundColor Yellow
echo.

:: Function to remove a service properly
call :remove_service "NginxServer" "nginx.exe"
call :remove_service "DjangoCeleryBeat"
call :remove_service "DjangoCeleryWorker"
call :remove_service "DjangoPythonApp"
call :remove_service "RedisServer"

echo.
exit /b 0

:remove_service
set "SERVICE_NAME=%~1"
set "PROCESS_NAME=%~2"

sc query %SERVICE_NAME% >nul 2>&1
if %errorlevel% equ 0 (
    powershell -Command Write-Host "  Stopping %SERVICE_NAME%..." -ForegroundColor Yellow
    net stop %SERVICE_NAME% >nul 2>&1
    timeout /t 2 >nul
    
    :: Kill process if specified
    if not "%PROCESS_NAME%"=="" (
        taskkill /F /IM %PROCESS_NAME% >nul 2>&1
        timeout /t 1 >nul
    )
    
    :: Try NSSM remove first
    if exist "%NSSM_PATH%" (
        "%NSSM_PATH%" remove %SERVICE_NAME% confirm >nul 2>&1
    )
    
    :: Fallback to sc delete
    sc delete %SERVICE_NAME% >nul 2>&1
    timeout /t 1 >nul
    
    powershell -Command Write-Host "  ✓ Removed %SERVICE_NAME%" -ForegroundColor Yellow
)
exit /b 0