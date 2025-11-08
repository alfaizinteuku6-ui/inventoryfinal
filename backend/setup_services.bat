@echo off
setlocal enabledelayedexpansion

:: Check for admin rights and auto-elevate if needed
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: Color definitions
set "RED=Red"
set "GREEN=Green"
set "YELLOW=Yellow"
set "CYAN=Cyan"
set "BLUE=Blue"
set "ps_echo=powershell -Command Write-Host"

cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   NSSM Windows Service Setup" -ForegroundColor %BLUE%
%ps_echo% "   Redis + Django App + Celery + Nginx" -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.
%ps_echo% "  Running with Administrator privileges ✓" -ForegroundColor %GREEN%
echo.

:: Get current directory and project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%\"
cd /d "%PROJECT_ROOT%"
set "PROJECT_ROOT=%CD%"

echo Project Root: %PROJECT_ROOT%
echo.

:: Setup directories
set "SCRIPTS_DIR=%PROJECT_ROOT%\service_scripts"
set "FUNCTIONS_DIR=%PROJECT_ROOT%\setup_functions"
if not exist "%SCRIPTS_DIR%" mkdir "%SCRIPTS_DIR%"
if not exist "%FUNCTIONS_DIR%" mkdir "%FUNCTIONS_DIR%"

:: Setup NSSM (this will download/detect NSSM)
call "%FUNCTIONS_DIR%\setup_nssm.bat"
if %errorlevel% neq 0 exit /b 1

:: Create environment variables file for all child scripts
call "%FUNCTIONS_DIR%\setup_environment.bat"
if %errorlevel% neq 0 exit /b 1

:: Setup Redis
call "%FUNCTIONS_DIR%\setup_redis.bat"
if %errorlevel% neq 0 exit /b 1

:: Setup Nginx
call "%FUNCTIONS_DIR%\setup_nginx.bat"
if %errorlevel% neq 0 exit /b 1

:: Verify Python and Celery
call "%FUNCTIONS_DIR%\verify_python.bat"
if %errorlevel% neq 0 exit /b 1

:: Remove existing services
call "%FUNCTIONS_DIR%\remove_existing_services.bat"

:: Install and start services
%ps_echo% "========================================" -ForegroundColor %CYAN%
%ps_echo% "   Installing Services..." -ForegroundColor %CYAN%
%ps_echo% "========================================" -ForegroundColor %CYAN%
echo.

call "%SCRIPTS_DIR%\install_redis.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Redis service" -ForegroundColor %RED%
    pause
    exit /b 1
)

call "%SCRIPTS_DIR%\install_django_app.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Django App service" -ForegroundColor %RED%
    pause
    exit /b 1
)

call "%SCRIPTS_DIR%\install_celery_worker.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Celery Worker service" -ForegroundColor %RED%
    pause
    exit /b 1
)

call "%SCRIPTS_DIR%\install_celery_beat.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Celery Beat service" -ForegroundColor %RED%
    pause
    exit /b 1
)

call "%SCRIPTS_DIR%\install_nginx.bat"
if %errorlevel% neq 0 (
    %ps_echo% "Failed to install Nginx service" -ForegroundColor %RED%
    pause
    exit /b 1
)

:: Start services
%ps_echo% "========================================" -ForegroundColor %CYAN%
%ps_echo% "   Starting Services..." -ForegroundColor %CYAN%
%ps_echo% "========================================" -ForegroundColor %CYAN%
echo.

call "%SCRIPTS_DIR%\start_redis.bat"
call "%SCRIPTS_DIR%\start_django_app.bat"
call "%SCRIPTS_DIR%\start_celery_worker.bat"
call "%SCRIPTS_DIR%\start_celery_beat.bat"
call "%SCRIPTS_DIR%\start_nginx.bat"

:: Display completion message
call "%FUNCTIONS_DIR%\display_completion.bat"

:: Create removal script
call "%FUNCTIONS_DIR%\create_removal_script.bat"

pause
exit /b 0