@echo off
setlocal enabledelayedexpansion

:: Color codes for better UX
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%========================================%NC%
echo %BLUE%   Django + React Production Manager   %NC%
echo %BLUE%========================================%NC%
echo.

:menu
echo %GREEN%Select an option:%NC%
echo.
echo 1. %YELLOW%Complete Setup%NC% (Initial installation + build)
echo 2. %YELLOW%Development Mode%NC% (Run dev servers + Celery)
echo 3. %YELLOW%Production Build%NC% (Build frontend + start backend)
echo 4. %YELLOW%Run Production Server%NC% (Backend only)
echo 5. %YELLOW%Create Test Users Only%NC%
echo 6. %YELLOW%Start Celery Workers Only%NC%
echo 7. %YELLOW%Clean Build%NC% (Remove all build artifacts)
echo 8. Exit
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
echo %RED%Invalid choice. Please try again.%NC%
goto menu

:complete_setup
echo %BLUE%========================================%NC%
echo %BLUE%   Starting Complete Setup...          %NC%
echo %BLUE%========================================%NC%
echo.

:: Check Python version
echo %GREEN%[1/8] Checking Python version...%NC%
python --version > temp_version.txt 2>&1
set /p py_version=<temp_version.txt
del temp_version.txt
echo Found: %py_version%

:: Create virtual environment
echo %GREEN%[2/8] Creating virtual environment...%NC%
cd backend
if exist venv (
    echo Virtual environment already exists. Skipping...
) else (
    python -m venv venv
)

:: Activate virtual environment
echo %GREEN%[3/8] Activating virtual environment...%NC%
call venv\Scripts\activate.bat

:: Install backend dependencies
echo %GREEN%[4/8] Installing backend dependencies...%NC%
pip install --upgrade pip
if exist requirements.txt (
    pip install -r requirements.txt
) else (
    echo %RED%Error: requirements.txt not found!%NC%
    goto error_exit
)

:: Run migrations
echo %GREEN%[5/8] Running database migrations...%NC%
python manage.py makemigrations
python manage.py migrate

:: Create test users
echo %GREEN%[6/8] Creating test users...%NC%
python manage.py shell < ../create_users.py
if not exist ../create_users.py (
    echo Creating test users script...
    (
        echo from django.contrib.auth import get_user_model
        echo User = get_user_model^(^)
        echo users = [
        echo     {'username': 'admin', 'email': 'admin@test.com', 'password': 'admin123', 'is_staff': True, 'is_superuser': True},
        echo     {'username': 'testuser1', 'email': 'user1@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False},
        echo     {'username': 'testuser2', 'email': 'user2@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False}
        echo ]
        echo for user_data in users:
        echo     if not User.objects.filter^(username=user_data['username']^).exists^(^):
        echo         User.objects.create_user^(**user_data^)
        echo         print^(f"Created user: {user_data['username']}"^)
        echo     else:
        echo         print^(f"User {user_data['username']} already exists"^)
    ) > ../create_users.py
    python manage.py shell < ../create_users.py
)

cd ..

:: Install frontend dependencies
echo %GREEN%[7/8] Installing frontend dependencies...%NC%
cd frontend
if exist node_modules (
    echo Node modules exist. Running npm install to update...
)
call npm install
if errorlevel 1 (
    echo %RED%Error: npm install failed!%NC%
    goto error_exit
)

:: Build frontend
echo %GREEN%[8/8] Building frontend...%NC%
call npm run build
if errorlevel 1 (
    echo %RED%Error: Frontend build failed!%NC%
    goto error_exit
)

:: Copy build to Django static/templates
echo %GREEN%Copying build files to backend...%NC%
if not exist ..\backend\templates mkdir ..\backend\templates
if not exist ..\backend\static mkdir ..\backend\static

:: Copy index.html to templates
if exist dist\index.html (
    copy /Y dist\index.html ..\backend\templates\
)

:: Copy assets to static
if exist dist\assets (
    if not exist ..\backend\static\assets mkdir ..\backend\static\assets
    xcopy /E /Y /I dist ..\backend\static\
)

cd ..

echo.
echo %GREEN%========================================%NC%
echo %GREEN%   Setup Complete!                     %NC%
echo %GREEN%========================================%NC%
echo.
echo %YELLOW%Test Users Created:%NC%
echo   - Username: admin     Password: admin123  (Superuser)
echo   - Username: testuser1 Password: test123
echo   - Username: testuser2 Password: test123
echo.
pause
goto menu

:dev_mode
echo %BLUE%========================================%NC%
echo %BLUE%   Starting Development Mode...        %NC%
echo %BLUE%========================================%NC%
echo.

:: Create run_dev.bat for concurrent processes
echo %GREEN%Creating development runner...%NC%
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
    echo echo Development servers starting...
    echo echo - Backend: http://localhost:8000
    echo echo - Frontend: http://localhost:5173
    echo echo.
    echo echo Press any key to return to menu...
    echo pause ^> nul
) > run_dev.bat

call run_dev.bat
goto menu

:prod_build
echo %BLUE%========================================%NC%
echo %BLUE%   Building for Production...          %NC%
echo %BLUE%========================================%NC%
echo.

:: Build frontend
echo %GREEN%[1/3] Building frontend...%NC%
cd frontend
call npm run build
if errorlevel 1 (
    echo %RED%Error: Frontend build failed!%NC%
    cd ..
    pause
    goto menu
)

:: Copy to backend
echo %GREEN%[2/3] Copying build to backend...%NC%
if not exist ..\backend\templates mkdir ..\backend\templates
if not exist ..\backend\static mkdir ..\backend\static

if exist dist\index.html (
    copy /Y dist\index.html ..\backend\templates\
)

if exist dist\assets (
    if not exist ..\backend\static\assets mkdir ..\backend\static\assets
    xcopy /E /Y /I dist\assets ..\backend\static\assets
)

cd ..

:: Collect static files
echo %GREEN%[3/3] Collecting Django static files...%NC%
cd backend
call venv\Scripts\activate.bat
python manage.py collectstatic --noinput

echo.
echo %GREEN%Production build complete!%NC%
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
echo %BLUE%========================================%NC%
echo %BLUE%   Starting Production Server...       %NC%
echo %BLUE%========================================%NC%
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
        echo echo Production server with Celery starting on http://localhost:8000
        echo pause
    ) > run_prod.bat
    call run_prod.bat
) else (
    cd backend
    call venv\Scripts\activate.bat
    echo %GREEN%Starting server on http://localhost:8000%NC%
    python manage.py runserver 0.0.0.0:8000
    cd ..
)

pause
goto menu

:create_users
echo %BLUE%========================================%NC%
echo %BLUE%   Creating Test Users...              %NC%
echo %BLUE%========================================%NC%
echo.

cd backend
call venv\Scripts\activate.bat

if not exist ..\create_users.py (
    (
        echo from django.contrib.auth import get_user_model
        echo User = get_user_model^(^)
        echo users = [
        echo     {'username': 'admin', 'email': 'admin@test.com', 'password': 'admin123', 'is_staff': True, 'is_superuser': True},
        echo     {'username': 'testuser1', 'email': 'user1@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False},
        echo     {'username': 'testuser2', 'email': 'user2@test.com', 'password': 'test123', 'is_staff': False, 'is_superuser': False}
        echo ]
        echo for user_data in users:
        echo     if not User.objects.filter^(username=user_data['username']^).exists^(^):
        echo         User.objects.create_user^(**user_data^)
        echo         print^(f"Created user: {user_data['username']}"^)
        echo     else:
        echo         print^(f"User {user_data['username']} already exists"^)
    ) > ..\create_users.py
)

python manage.py shell < ..\create_users.py
cd ..

echo.
echo %GREEN%Done!%NC%
pause
goto menu

:celery_only
echo %BLUE%========================================%NC%
echo %BLUE%   Starting Celery Workers...          %NC%
echo %BLUE%========================================%NC%
echo.

(
    echo @echo off
    echo start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A config worker -l info --pool=solo"
    echo timeout /t 2 /nobreak ^> nul
    echo start "Celery Beat" cmd /k "cd backend && venv\Scripts\activate && celery -A config beat -l info"
    echo echo Celery workers started
    echo pause
) > run_celery.bat

call run_celery.bat
goto menu

:clean_build
echo %BLUE%========================================%NC%
echo %BLUE%   Cleaning Build Artifacts...         %NC%
echo %BLUE%========================================%NC%
echo.

set /p confirm="This will delete all build files. Continue? (y/n): "
if /i not "%confirm%"=="y" goto menu

echo %GREEN%Removing frontend build...%NC%
if exist frontend\dist rmdir /s /q frontend\dist

echo %GREEN%Removing backend static files...%NC%
if exist backend\static\assets rmdir /s /q backend\static\assets
if exist backend\templates\index.html del /q backend\templates\index.html

echo %GREEN%Removing temporary scripts...%NC%
if exist run_dev.bat del /q run_dev.bat
if exist run_prod.bat del /q run_prod.bat
if exist run_celery.bat del /q run_celery.bat

echo.
echo %GREEN%Clean complete!%NC%
pause
goto menu

:error_exit
cd ..
echo.
echo %RED%Setup failed. Please check the errors above.%NC%
pause
goto menu

:end
echo.
echo %GREEN%Goodbye!%NC%
exit /b 0