@echo off
setlocal enabledelayedexpansion

cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Celery Auto-start Configuration" -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.
%ps_echo% "Choose auto-start method:" -ForegroundColor %GREEN%
echo.
echo  1. Task Scheduler (Recommended - Runs in background)
echo  2. Startup Folder (Simple - Visible windows)
echo  3. Windows Service (Advanced - Requires NSSM)
echo  4. Remove Auto-start
echo  5. Back to Main Menu
echo.
set /p auto_choice="Enter your choice (1-5): "

if "%auto_choice%"=="1" goto task_scheduler
if "%auto_choice%"=="2" goto startup_folder
if "%auto_choice%"=="3" goto windows_service
if "%auto_choice%"=="4" goto remove_autostart
if "%auto_choice%"=="5" exit /b 0

%ps_echo% "Invalid choice." -ForegroundColor %RED%
timeout /t 2 >nul
exit /b 0

:task_scheduler
cls
%ps_echo% "Setting up Task Scheduler..." -ForegroundColor %GREEN%
echo.

:: Check for admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    %ps_echo% "ERROR: Task Scheduler requires Administrator privileges!" -ForegroundColor %RED%
    echo.
    %ps_echo% "Please do one of the following:" -ForegroundColor %YELLOW%
    echo   1. Right-click this script and select "Run as administrator"
    echo   2. Use Option 2 (Startup Folder) - no admin required
    echo   3. Use Option 3 (Windows Service) - requires admin once
    echo.
    pause
    exit /b 0
)

echo.

:: Get current directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\"
cd /d "%PROJECT_ROOT%"
set "PROJECT_ROOT=%CD%"

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
)

%ps_echo% "Registering Celery Beat task..." -ForegroundColor %CYAN%
schtasks /create /tn "DjangoCeleryBeat" /xml "%PROJECT_ROOT%\celery_beat_task.xml" /f
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Celery Beat task created successfully" -ForegroundColor %GREEN%
) else (
    %ps_echo% "  ✗ Failed to create Celery Beat task" -ForegroundColor %RED%
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
echo   - Search "Task Scheduler" in Windows
echo   - Look for "DjangoCeleryWorker" and "DjangoCeleryBeat"
echo.
pause
exit /b 0

:startup_folder
cls
%ps_echo% "Setting up Startup Folder shortcut..." -ForegroundColor %GREEN%
echo.

:: Get current directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\"
cd /d "%PROJECT_ROOT%"
set "PROJECT_ROOT=%CD%"

:: Create startup script
(
    echo @echo off
    echo cd /d "%PROJECT_ROOT%"
    echo start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A config worker -l info --pool=solo"
    echo timeout /t 5 /nobreak ^> nul
    echo start "Celery Beat" cmd /k "cd backend && venv\Scripts\activate && celery -A config beat -l info"
) > "%PROJECT_ROOT%\start_celery_startup.bat"

:: Create shortcut in startup folder using PowerShell
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DjangoCelery.lnk'); $Shortcut.TargetPath = '%PROJECT_ROOT%\start_celery_startup.bat'; $Shortcut.WorkingDirectory = '%PROJECT_ROOT%'; $Shortcut.Save()"

echo.
%ps_echo% "✓ Startup shortcut created!" -ForegroundColor %GREEN%
echo.
echo Celery will start automatically on login.
echo Location: %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DjangoCelery.lnk
echo.
echo Note: This will show visible command windows.
echo For hidden background execution, use Task Scheduler instead.
echo.
pause
exit /b 0

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
    
    :: Copy appropriate version to current directory
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

:: Get current directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\"
cd /d "%PROJECT_ROOT%"
set "PROJECT_ROOT=%CD%"

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
exit /b 0

:remove_autostart
cls
%ps_echo% "Removing Auto-start Configuration..." -ForegroundColor %YELLOW%
echo.

:: Remove Task Scheduler tasks
schtasks /delete /tn "DjangoCeleryWorker" /f >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Removed Task Scheduler: DjangoCeleryWorker" -ForegroundColor %GREEN%
)

schtasks /delete /tn "DjangoCeleryBeat" /f >nul 2>&1
if %errorlevel% equ 0 (
    %ps_echo% "  ✓ Removed Task Scheduler: DjangoCeleryBeat" -ForegroundColor %GREEN%
)

:: Remove startup folder shortcut
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DjangoCelery.lnk" (
    del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DjangoCelery.lnk"
    %ps_echo% "  ✓ Removed Startup folder shortcut" -ForegroundColor %GREEN%
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
exit /b 0