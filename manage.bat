@echo off
setlocal enabledelayedexpansion
title Django + React Production Manager

:: Utility: Colored echo using PowerShell
set "ps_echo=powershell -NoProfile -Command Write-Host"
set "BLUE=Blue"
set "GREEN=Green"
set "YELLOW=Yellow"
set "RED=Red"
set "CYAN=Cyan"
set "MAGENTA=Magenta"

cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Django + React Production Manager" -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

:: ---------- PYTHON CHECK ----------
where python >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "[Python] Not found - installing latest stable version..." -ForegroundColor %YELLOW%
    powershell -Command "Invoke-WebRequest -Uri https://www.python.org/ftp/python/3.12.5/python-3.12.5-amd64.exe -OutFile python_installer.exe"
    start /wait python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    del python_installer.exe
    
    :: Refresh environment variables
    call :refresh_env
)

:: Recheck Python
python --version >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "[Python] Installation failed. Please install manually from python.org/downloads" -ForegroundColor %RED%
    %ps_echo% "Make sure to check 'Add Python to PATH' during installation." -ForegroundColor %YELLOW%
    pause
    exit /b
)
%ps_echo% "[Python] Detected: " -ForegroundColor %GREEN% -NoNewline
python --version

:: ---------- NODE.JS CHECK ----------
where node >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "[Node.js] Not found - installing latest LTS version..." -ForegroundColor %YELLOW%
    powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v22.9.0/node-v22.9.0-x64.msi -OutFile node_installer.msi"
    start /wait msiexec /i node_installer.msi /qn ADDLOCAL=ALL
    del node_installer.msi
    
    :: Refresh environment variables
    call :refresh_env
)

node --version >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "[Node.js] Installation failed - please install manually from nodejs.org" -ForegroundColor %RED%
    pause
    exit /b
)
%ps_echo% "[Node.js] Detected: " -ForegroundColor %GREEN% -NoNewline
node --version
echo.
pause

:: ---------- MENU ----------
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
echo  7. Clean Build             (Remove build artifacts)
echo  8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto complete_setup
if "%choice%"=="2" goto dev_mode
if "%choice%"=="3" goto prod_build
if "%choice%"=="4" goto run_production
if "%choice%"=="5" goto create_users
if "%choice%"=="6" goto celery_only
if "%choice%"=="7" goto clean_build
if "%choice%"=="8" goto end

%ps_echo% "Invalid choice. Please try again." -ForegroundColor %RED%
timeout /t 2 >nul
goto menu

:complete_setup
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Starting Complete Setup..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

:: Python version
%ps_echo% "[1/8] Checking Python version..." -ForegroundColor %GREEN%
python --version
echo.

:: Virtual environment
%ps_echo% "[2/8] Creating virtual environment..." -ForegroundColor %GREEN%
cd backend
if exist venv (
    %ps_echo% "Virtual environment already exists. Skipping..." -ForegroundColor %YELLOW%
) else (
    python -m venv venv
    %ps_echo% "Done!" -ForegroundColor %CYAN%
)
echo.

:: Activate
%ps_echo% "[3/8] Activating environment..." -ForegroundColor %GREEN%
call venv\Scripts\activate.bat
echo.

:: Install deps
%ps_echo% "[4/8] Installing backend dependencies..." -ForegroundColor %GREEN%
pip install --upgrade pip >nul 2>&1
if exist requirements.txt (
    pip install -r requirements.txt
    echo.
) else (
    %ps_echo% "Error: requirements.txt not found!" -ForegroundColor %RED%
    goto error_exit
)

:: Migrate
%ps_echo% "[5/8] Applying migrations..." -ForegroundColor %GREEN%
python manage.py makemigrations
python manage.py migrate
echo.

:: Create test users - Fixed version
%ps_echo% "[6/8] Creating test users..." -ForegroundColor %GREEN%
call :create_user_script
python manage.py shell < ..\create_users.py
echo.

cd ..

:: Frontend
%ps_echo% "[7/8] Installing frontend dependencies..." -ForegroundColor %GREEN%
cd frontend
call npm install
if errorlevel 1 (
    %ps_echo% "Error: npm install failed!" -ForegroundColor %RED%
    cd ..
    goto error_exit
)
echo.

%ps_echo% "[8/8] Building frontend..." -ForegroundColor %GREEN%
call npm run build
if errorlevel 1 (
    %ps_echo% "Error: Frontend build failed!" -ForegroundColor %RED%
    cd ..
    goto error_exit
)
echo.

:: Copy build
%ps_echo% "Copying build to backend..." -ForegroundColor %CYAN%
if not exist ..\backend\templates mkdir ..\backend\templates
if not exist ..\backend\static mkdir ..\backend\static
if not exist ..\backend\static\assets mkdir ..\backend\static\assets

if exist dist\index.html (
    copy /Y dist\index.html ..\backend\templates\ >nul
    %ps_echo% "  - Copied index.html" -ForegroundColor %CYAN%
)
if exist dist\assets (
    xcopy /E /Y /I /Q dist\assets\*.* ..\backend\static\assets\ >nul
    %ps_echo% "  - Copied assets" -ForegroundColor %CYAN%
)

cd ..

:: Collect static files
%ps_echo% "Collecting Django static files..." -ForegroundColor %CYAN%
cd backend
call venv\Scripts\activate.bat
python manage.py collectstatic --noinput --clear
cd ..
echo.
%ps_echo% "========================================" -ForegroundColor %GREEN%
%ps_echo% "   Setup Complete! " -ForegroundColor %GREEN% -NoNewline
%ps_echo% "🎉" -ForegroundColor %YELLOW%
%ps_echo% "========================================" -ForegroundColor %GREEN%
echo.
%ps_echo% "Test Users Created:" -ForegroundColor %CYAN%
echo   Username: admin      Password: admin123  (Superuser)
echo   Username: testuser1  Password: test123
echo   Username: testuser2  Password: test123
echo.
pause
goto menu

:dev_mode
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Starting Development Mode..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.
(
    echo @echo off
    echo start "Django Backend" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"
    echo timeout /t 2 /nobreak ^> nul
    echo start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A config worker -l info --pool=solo"
    echo timeout /t 2 /nobreak ^> nul
    echo start "Celery Beat" cmd /k "cd backend && venv\Scripts\activate && celery -A config beat -l info"
    echo timeout /t 2 /nobreak ^> nul
    echo start "React Frontend" cmd /k "cd frontend && npm run dev"
    echo echo.
    echo powershell -Command Write-Host "Development servers starting..." -ForegroundColor Green
    echo powershell -Command Write-Host "  - Backend:  http://localhost:8000" -ForegroundColor Cyan
    echo powershell -Command Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Cyan
    echo echo.
) > run_dev.bat
call run_dev.bat
timeout /t 3 >nul
goto menu

:prod_build
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Building for Production..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

%ps_echo% "[1/3] Building frontend..." -ForegroundColor %GREEN%
cd frontend
call npm run build
if errorlevel 1 (
    %ps_echo% "Error: Frontend build failed!" -ForegroundColor %RED%
    cd ..
    pause
    goto menu
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
    goto run_production
)

cd ..
pause
goto menu

:run_production
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Starting Production Server..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

set /p with_celery="Start with Celery workers? (y/n): "

if /i "%with_celery%"=="y" (
    (
        echo @echo off
        echo start "Django Production" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"
        echo timeout /t 2 /nobreak ^> nul
        echo start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A config worker -l info --pool=solo"
        echo timeout /t 2 /nobreak ^> nul
        echo start "Celery Beat" cmd /k "cd backend && venv\Scripts\activate && celery -A config beat -l info"
        echo echo.
        echo powershell -Command Write-Host "Production server with Celery starting on http://localhost:8000" -ForegroundColor Green
        echo echo.
    ) > run_prod.bat
    call run_prod.bat
    timeout /t 3 >nul
) else (
    cd backend
    call venv\Scripts\activate.bat
    %ps_echo% "Starting server on http://localhost:8000" -ForegroundColor %GREEN%
    echo.
    python manage.py runserver 0.0.0.0:8000
    cd ..
)

pause
goto menu

:create_users
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Creating Test Users..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

cd backend
call venv\Scripts\activate.bat

call :create_user_script
python manage.py shell < ..\create_users.py

cd ..
echo.
%ps_echo% "Done!" -ForegroundColor %GREEN%
pause
goto menu

:celery_only
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Starting Celery Workers..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

(
    echo @echo off
    echo start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A config worker -l info --pool=solo"
    echo timeout /t 2 /nobreak ^> nul
    echo start "Celery Beat" cmd /k "cd backend && venv\Scripts\activate && celery -A config beat -l info"
    echo echo.
    echo powershell -Command Write-Host "Celery workers started" -ForegroundColor Green
    echo echo.
) > run_celery.bat

call run_celery.bat
timeout /t 3 >nul
goto menu

:clean_build
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Cleaning Build Artifacts..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

set /p confirm="This will delete all build files. Continue? (y/n): "
if /i not "%confirm%"=="y" goto menu

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
goto menu

:error_exit
cd ..
echo.
%ps_echo% "Setup failed. Please check the errors above." -ForegroundColor %RED%
pause
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

:: ---------- HELPER FUNCTIONS ----------

:refresh_env
:: Refresh PATH without restarting
for /f "tokens=2*" %%a in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SysPath=%%b"
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "UserPath=%%b"
set "PATH=%SysPath%;%UserPath%"
goto :eof

:create_user_script
:: Create Python script for user creation (fixed escaping)
if not exist ..\create_users.py (
    (
        echo from django.contrib.auth import get_user_model
        echo.
        echo User = get_user_model^(^)
        echo.
        echo users = [
        echo     {'username': 'admin', 'email': 'admin@test.com', 'password': 'admin123', 'is_staff': True, 'is_superuser': True},
        echo     {'username': 'testuser1', 'email': 'user1@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False},
        echo     {'username': 'testuser2', 'email': 'user2@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False}
        echo ]
        echo.
        echo for user_data in users:
        echo     username = user_data['username']
        echo     if not User.objects.filter^(username=username^).exists^(^):
        echo         User.objects.create_user^(**user_data^)
        echo         print^(f"Created user: {username}"^)
        echo     else:
        echo         print^(f"User {username} already exists"^)
    ) > ..\create_users.py
)
goto :eof