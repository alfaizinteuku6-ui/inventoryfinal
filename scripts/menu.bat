@echo off

:menu
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Django + React Production Manager" -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.
%ps_echo% "Select an option:" -ForegroundColor %GREEN%
echo.
echo  1. Complete Setup          (Initial installation + build)
echo  2. Development Mode        (Run dev servers + Celery)
echo  3. Production Build        (Build frontend + start backend)
echo  4. Run Production Server   (Backend only)
echo  5. Create Test Users Only
echo  6. Start Celery Workers Only
echo  7. Setup Celery Auto-start (Windows Service/Task Scheduler)
echo  8. Clean Build             (Remove build artifacts)
echo  9. Exit
echo.
set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" call scripts\complete_setup.bat && goto menu
if "%choice%"=="2" call scripts\dev_mode.bat && goto menu
if "%choice%"=="3" call scripts\prod_build.bat && goto menu
if "%choice%"=="4" call scripts\run_production.bat && goto menu
if "%choice%"=="5" call scripts\create_users.bat && goto menu
if "%choice%"=="6" call scripts\celery_only.bat && goto menu
if "%choice%"=="7" call scripts\celery_autostart.bat && goto menu
if "%choice%"=="8" call scripts\clean_build.bat && goto menu
if "%choice%"=="9" goto end

%ps_echo% "Invalid choice. Please try again." -ForegroundColor %RED%
timeout /t 2 >nul
goto menu

:end
cls
echo.
%ps_echo% "Thank you for using Django + React Production Manager!" -ForegroundColor %GREEN%
%ps_echo% "Goodbye! " -ForegroundColor %CYAN% -NoNewline
%ps_echo% "👋" -ForegroundColor %YELLOW%
echo.
timeout /t 2 >nul
exit /b 0