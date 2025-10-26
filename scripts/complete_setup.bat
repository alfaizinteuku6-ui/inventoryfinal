@echo off
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Starting Complete Setup..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

%ps_echo% "[1/8] Checking Python version..." -ForegroundColor %GREEN%
python --version
echo.

%ps_echo% "[2/8] Creating virtual environment..." -ForegroundColor %GREEN%
cd backend
if exist venv (
    %ps_echo% "Virtual environment already exists. Skipping..." -ForegroundColor %YELLOW%
) else (
    python -m venv venv
    %ps_echo% "Done!" -ForegroundColor %CYAN%
)
echo.

%ps_echo% "[3/8] Activating environment..." -ForegroundColor %GREEN%
call venv\Scripts\activate.bat
echo.

%ps_echo% "[4/8] Installing backend dependencies..." -ForegroundColor %GREEN%
pip install --upgrade pip >nul 2>&1
if exist requirements.txt (
    pip install -r requirements.txt
    echo.
) else (
    %ps_echo% "Error: requirements.txt not found!" -ForegroundColor %RED%
    cd ..
    pause
    exit /b 1
)

%ps_echo% "[5/8] Applying migrations..." -ForegroundColor %GREEN%
python manage.py makemigrations
python manage.py migrate
echo.

%ps_echo% "[6/8] Creating test users..." -ForegroundColor %GREEN%
call ..\scripts\utils.bat :create_user_script
python manage.py shell < ..\create_users.py
echo.

cd ..

%ps_echo% "[7/8] Installing frontend dependencies..." -ForegroundColor %GREEN%
cd frontend
call npm install
if errorlevel 1 (
    %ps_echo% "Error: npm install failed!" -ForegroundColor %RED%
    cd ..
    pause
    exit /b 1
)
echo.

%ps_echo% "[8/8] Building frontend..." -ForegroundColor %GREEN%
call npm run build:production
if errorlevel 1 (
    %ps_echo% "Error: Frontend build failed!" -ForegroundColor %RED%
    cd ..
    pause
    exit /b 1
)
echo.

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
exit /b 0