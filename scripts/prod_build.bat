REM ============== scripts/prod_build.bat ==============
@echo off
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Building for Production..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

%ps_echo% "[1/3] Building frontend..." -ForegroundColor %GREEN%
cd frontend
call npm run build:production
if errorlevel 1 (
    %ps_echo% "Error: Frontend build failed!" -ForegroundColor %RED%
    cd ..
    pause
    exit /b 1
)
echo.

%ps_echo% "[2/3] Copying build to backend..." -ForegroundColor %GREEN%
if not exist ..\backend\templates mkdir ..\backend\templates
if not exist ..\backend\static mkdir ..\backend\static

if exist dist\index.html (
    copy /Y dist\index.html ..\backend\templates\ >nul
    %ps_echo% "  - Copied index.html" -ForegroundColor %CYAN%
)

if exist dist\assets (
    if not exist ..\backend\static\assets mkdir ..\backend\static\assets
    xcopy /E /Y /I /Q dist\assets ..\backend\static\assets >nul
    %ps_echo% "  - Copied assets" -ForegroundColor %CYAN%
)
echo.

cd ..

%ps_echo% "[3/3] Collecting Django static files..." -ForegroundColor %GREEN%
cd backend
call venv\Scripts\activate.bat
python manage.py collectstatic --noinput
echo.

%ps_echo% "Production build complete!" -ForegroundColor %GREEN%
echo.
set /p start_server="Start production server now? (y/n): "
if /i "%start_server%"=="y" (
    cd ..
    call scripts\run_production.bat
)

cd ..
pause
exit /b 0

