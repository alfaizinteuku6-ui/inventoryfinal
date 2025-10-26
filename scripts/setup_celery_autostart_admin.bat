@echo off
:: Celery Auto-start Setup (Automatic Admin Rights)
:: This script automatically requests administrator privileges

:: Check for admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Requesting Administrator privileges...
    echo.
    
    :: Re-launch as admin
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: Now running with admin rights
setlocal enabledelayedexpansion

:: Initialize colors
set "ps_echo=powershell -NoProfile -Command Write-Host"
set "BLUE=Blue"
set "GREEN=Green"
set "YELLOW=Yellow"
set "RED=Red"
set "CYAN=Cyan"

cls
%ps_echo% "========================================" -ForegroundColor %GREEN%
%ps_echo% "   Running with Administrator Rights" -ForegroundColor %GREEN%
%ps_echo% "========================================" -ForegroundColor %GREEN%
echo.

:autostart_menu
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Celery Auto-start Configuration" -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.
%ps_echo% "Choose auto-start method:" -ForegroundColor %GREEN%
echo.
echo  1. Task Scheduler (Runs hidden in background)
echo  2. Windows Service (Advanced - requires NSSM)
echo  3. Remove Auto-start
echo  4. Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto task_scheduler
if "%choice%"=="2" goto windows_service
if "%choice%"=="3" goto remove_autostart
if "%choice%"=="4" exit /b 0

%ps_echo% "Invalid choice." -ForegroundColor %RED%
timeout /t 2 >nul
goto autostart_menu

:task_scheduler
cls
%ps_echo% "Setting up Task Scheduler..." -ForegroundColor %GREEN%
echo.

:: Get project root directory
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

:: Create PowerShell script for Celery Worker
echo $projectRoot = "%PROJECT_ROOT%" > "%PROJECT_ROOT%\start_celery_worker.ps1"
echo Set-Location $projectRoot >> "%PROJECT_ROOT%\start_celery_worker.ps1"
echo Start-Process cmd -ArgumentList "/c cd /d `"$projectRoot\backend`" && venv\Scripts\activate && celery -A config worker -l info --pool=solo" -WindowStyle Hidden >> "%PROJECT_ROOT%\start_celery_worker.ps1"

:: Create PowerShell script for Celery Beat
echo $projectRoot = "%PROJECT_ROOT%" > "%PROJECT_ROOT%\start_celery_beat.ps1"
echo Set-Location $projectRoot >> "%PROJECT_ROOT%\start_celery_beat.ps1"
echo Start-Process cmd -ArgumentList "/c cd /d `"$projectRoot\backend`" && venv\Scripts\activate && celery -A config beat -l info" -WindowStyle Hidden >> "%PROJECT_ROOT%\start_celery_beat.ps1"

:: Create XML for Task Scheduler - Celery Worker
(
    echo ^<?xml version="1.0" encoding="UTF-16"?^>
    echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
    echo   ^<Triggers^>
    echo     ^<LogonTrigger^>
    echo       ^<Enabled^>true^</Enabled^>
    echo       ^<Delay^>PT30S^</Delay^>
    echo     ^</LogonTrigger^>
    echo   ^</Triggers^>
    echo   ^<Settings^>
    echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
    echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
    echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
    echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
    echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^>
    echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^>
    echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^>
    echo     ^<Enabled^>true^</Enabled^>
    echo     ^<Hidden^>false^</Hidden^>
    echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^>
    echo   ^</Settings^>
    echo   ^<Actions^>
    echo     ^<Exec^>
    echo       ^<Command^>powershell.exe^</Command^>
    echo       ^<Arguments^>-NoProfile -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\start_celery_worker.ps1"^</Arguments^>
    echo     ^</Exec^>
    echo   ^</Actions^>
    echo ^</Task^>
) > "%PROJECT_ROOT%\celery_worker_task.xml"

:: Create XML for Task Scheduler - Celery Beat
(
    echo ^<?xml version="1.0" encoding="UTF-16"?^>
    echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
    echo   ^<Triggers^>
    echo     ^<LogonTrigger^>
    echo       ^<Enabled^>true^</Enabled^>
    echo       ^<Delay^>PT35S^</Delay^>
    echo     ^</LogonTrigger^>
    echo   ^</Triggers^>
    echo   ^<Settings^>
    echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
    echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
    echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
    echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
    echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^>
    echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^>
    echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^>
    echo     ^<Enabled^>true^</Enabled^>
    echo     ^<Hidden^>false^</Hidden^>
    echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^>
    echo   ^</Settings^>
    echo   ^<Actions^>
    echo     ^<Exec^>
    echo       ^<Command^>powershell.exe^</Command^>
    echo       ^<Arguments^>-NoProfile -ExecutionPolicy Bypass -File "%PROJECT_ROOT%\start_celery_beat.ps1"^</Arguments^>
    echo     ^</Exec^>
    echo   ^</Actions^>
    echo ^</Task^>
) > "%PROJECT_ROOT%\celery_beat_task.xml"

:: Register tasks
%ps_echo% "Registering Celery Worker task..." -ForegroundColor %CYAN%
schtasks /create /tn "DjangoCeleryWorker" /xml "%PROJECT_ROOT%\celery_worker_task.xml" /f
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Worker task created successfully" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to create Celery Worker task" -ForegroundColor %RED%
    echo     Error code: %errorlevel%
)

%ps_echo% "Registering Celery Beat task..." -ForegroundColor %CYAN%
schtasks /create /tn "DjangoCeleryBeat" /xml "%PROJECT_ROOT%\celery_beat_task.xml" /f
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Beat task created successfully" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to create Celery Beat task" -ForegroundColor %RED%
    echo     Error code: %errorlevel%
)

echo.
%ps_echo% "========================================" -ForegroundColor %GREEN%
%ps_echo% "   Auto-start Setup Complete!" -ForegroundColor %GREEN%
%ps_echo% "========================================" -ForegroundColor %GREEN%
echo.
echo Celery will now start automatically:
echo   - 30 seconds after user login
echo   - Running in background (no visible windows)
echo.
echo To manage tasks, open Task Scheduler:
echo   - Press Win+R, type: taskschd.msc
echo   - Look for "DjangoCeleryWorker" and "DjangoCeleryBeat"
echo.
echo To test now:
echo   schtasks /run /tn "DjangoCeleryWorker"
echo.
pause
goto autostart_menu

:windows_service
cls
%ps_echo% "Setting up Windows Service with NSSM..." -ForegroundColor %GREEN%
echo.

:: Check for NSSM
where nssm >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "NSSM not found. Downloading..." -ForegroundColor %YELLOW%
    
    :: Download and extract NSSM
    powershell -Command "Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'nssm.zip'"
    powershell -Command "Expand-Archive -Path 'nssm.zip' -DestinationPath '.' -Force"
    
    :: Copy appropriate version
    if exist "nssm-2.24\win64\nssm.exe" (
        copy "nssm-2.24\win64\nssm.exe" . >nul
    ) else (
        copy "nssm-2.24\win32\nssm.exe" . >nul
    )
    
    del nssm.zip
    rmdir /s /q nssm-2.24
    
    set "NSSM_PATH=%CD%\nssm.exe"
) else (
    set "NSSM_PATH=nssm"
)

:: Get project root
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

:: Install Celery Worker Service
%ps_echo% "Installing Celery Worker service..." -ForegroundColor %CYAN%
"%NSSM_PATH%" install DjangoCeleryWorker "%PROJECT_ROOT%\backend\venv\Scripts\celery.exe" -A config worker -l info --pool=solo
"%NSSM_PATH%" set DjangoCeleryWorker AppDirectory "%PROJECT_ROOT%\backend"
"%NSSM_PATH%" set DjangoCeleryWorker DisplayName "Django Celery Worker"
"%NSSM_PATH%" set DjangoCeleryWorker Description "Celery worker for Django application"
"%NSSM_PATH%" set DjangoCeleryWorker Start SERVICE_AUTO_START

:: Install Celery Beat Service
%ps_echo% "Installing Celery Beat service..." -ForegroundColor %CYAN%
"%NSSM_PATH%" install DjangoCeleryBeat "%PROJECT_ROOT%\backend\venv\Scripts\celery.exe" -A config beat -l info
"%NSSM_PATH%" set DjangoCeleryBeat AppDirectory "%PROJECT_ROOT%\backend"
"%NSSM_PATH%" set DjangoCeleryBeat DisplayName "Django Celery Beat"
"%NSSM_PATH%" set DjangoCeleryBeat Description "Celery beat scheduler for Django application"
"%NSSM_PATH%" set DjangoCeleryBeat Start SERVICE_AUTO_START

:: Start services
%ps_echo% "Starting services..." -ForegroundColor %CYAN%
net start DjangoCeleryWorker
net start DjangoCeleryBeat

echo.
%ps_echo% "✓ Windows Services installed and started!" -ForegroundColor %GREEN%
echo.
echo Services installed:
echo   - DjangoCeleryWorker
echo   - DjangoCeleryBeat
echo.
echo Manage via services.msc or:
echo   net start DjangoCeleryWorker
echo   net stop DjangoCeleryWorker
echo.
pause
goto autostart_menu

:remove_autostart
cls
%ps_echo% "Removing Auto-start Configuration..." -ForegroundColor %YELLOW%
echo.

:: Remove Task Scheduler tasks
schtasks /delete /tn "DjangoCeleryWorker" /f >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Removed Task Scheduler: DjangoCeleryWorker" -ForegroundColor %GREEN%
) else (
    echo   - Task Scheduler: DjangoCeleryWorker not found
)

schtasks /delete /tn "DjangoCeleryBeat" /f >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Removed Task Scheduler: DjangoCeleryBeat" -ForegroundColor %GREEN%
) else (
    echo   - Task Scheduler: DjangoCeleryBeat not found
)

:: Remove Windows Services (if NSSM is available)
where nssm >nul 2>nul
if %errorlevel% equ 0 (
    net stop DjangoCeleryWorker >nul 2>&1
    nssm remove DjangoCeleryWorker confirm >nul 2>&1
    if %errorlevel% equ 0 (
        %ps_echo% "  ✓ Removed Windows Service: DjangoCeleryWorker" -ForegroundColor %GREEN%
    )
    
    net stop DjangoCeleryBeat >nul 2>&1
    nssm remove DjangoCeleryBeat confirm >nul 2>&1
    if %errorlevel% equ 0 (
        %ps_echo% "  ✓ Removed Windows Service: DjangoCeleryBeat" -ForegroundColor %GREEN%
    )
)

echo.
%ps_echo% "Auto-start configuration removed." -ForegroundColor %GREEN%
pause
goto autostart_menu