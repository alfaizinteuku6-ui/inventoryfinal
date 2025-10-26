@echo off
:: Celery Auto-start Setup - Startup Folder Method
:: NO ADMINISTRATOR RIGHTS REQUIRED

setlocal enabledelayedexpansion

:: Initialize colors
set "ps_echo=powershell -NoProfile -Command Write-Host"
set "GREEN=Green"
set "CYAN=Cyan"
set "YELLOW=Yellow"

cls
%ps_echo% "========================================" -ForegroundColor %GREEN%
%ps_echo% "   Celery Startup Folder Setup" -ForegroundColor %GREEN%
%ps_echo% "   (No Admin Rights Required)" -ForegroundColor %GREEN%
%ps_echo% "========================================" -ForegroundColor %GREEN%
echo.

:startup_menu
echo.
echo Choose an option:
echo.
echo  1. Install Auto-start (Startup Folder)
echo  2. Remove Auto-start
echo  3. Exit
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto install
if "%choice%"=="2" goto remove
if "%choice%"=="3" exit /b 0

echo Invalid choice.
timeout /t 2 >nul
goto startup_menu

:install
cls
%ps_echo% "Setting up Startup Folder shortcut..." -ForegroundColor %GREEN%
echo.

:: Get project root
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

:: Create startup script
(
    echo @echo off
    echo title Celery Workers - Django
    echo echo Starting Celery Workers...
    echo echo.
    echo cd /d "%PROJECT_ROOT%"
    echo start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A config worker -l info --pool=solo"
    echo timeout /t 5 /nobreak ^> nul
    echo start "Celery Beat" cmd /k "cd backend && venv\Scripts\activate && celery -A config beat -l info"
    echo echo.
    echo echo Celery workers started!
    echo echo You can close this window.
    echo timeout /t 5
    echo exit
) > "%PROJECT_ROOT%\start_celery_startup.bat"

:: Create shortcut in startup folder using PowerShell
%ps_echo% "Creating shortcut..." -ForegroundColor %CYAN%
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DjangoCelery.lnk'); $Shortcut.TargetPath = '%PROJECT_ROOT%\start_celery_startup.bat'; $Shortcut.WorkingDirectory = '%PROJECT_ROOT%'; $Shortcut.Save()"

if %errorlevel% equ 0 (
    echo.
    %ps_echo% "========================================" -ForegroundColor %GREEN%
    %ps_echo% "   ✓ Setup Complete!" -ForegroundColor %GREEN%
    %ps_echo% "========================================" -ForegroundColor %GREEN%
    echo.
    echo Celery will now start automatically on login!
    echo.
    echo Details:
    echo   - Location: Startup Folder
    echo   - Windows: Will be visible (for monitoring)
    echo   - Start: After user login
    echo.
    echo Shortcut location:
    echo %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\
    echo.
    %ps_echo% "To test now, run:" -ForegroundColor %CYAN%
    echo   start_celery_startup.bat
    echo.
) else (
    echo.
    echo ERROR: Failed to create shortcut
    echo.
)

pause
goto startup_menu

:remove
cls
%ps_echo% "Removing Auto-start..." -ForegroundColor %YELLOW%
echo.

:: Remove startup folder shortcut
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DjangoCelery.lnk" (
    del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\DjangoCelery.lnk"
    %ps_echo% "  ✓ Removed Startup folder shortcut" -ForegroundColor %GREEN%
) else (
    echo   - Shortcut not found
)

:: Remove startup script (optional)
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

if exist "%PROJECT_ROOT%\start_celery_startup.bat" (
    set /p delete_script="Delete startup script? (y/n): "
    if /i "!delete_script!"=="y" (
        del "%PROJECT_ROOT%\start_celery_startup.bat"
        echo   ✓ Deleted startup script
    )
)

echo.
%ps_echo% "Auto-start removed!" -ForegroundColor %GREEN%
pause
goto startup_menu