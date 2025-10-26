REM ============== scripts/clean_build.bat ==============
@echo off
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Cleaning Build Artifacts..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

set /p confirm="This will delete all build files. Continue? (y/n): "
if /i not "%confirm%"=="y" exit /b 0

echo.
%ps_echo% "Removing frontend build..." -ForegroundColor %YELLOW%
if exist frontend\dist rmdir /s /q frontend\dist

%ps_echo% "Removing backend static files..." -ForegroundColor %YELLOW%
if exist backend\static\assets rmdir /s /q backend\static\assets
if exist backend\templates\index.html del /q backend\templates\index.html

%ps_echo% "Removing temporary scripts..." -ForegroundColor %YELLOW%
if exist run_dev.bat del /q run_dev.bat
if exist run_prod.bat del /q run_prod.bat
if exist run_celery.bat del /q run_celery.bat
if exist create_users.py del /q create_users.py

echo.
%ps_echo% "Clean complete!" -ForegroundColor %GREEN%
pause
exit /b 0