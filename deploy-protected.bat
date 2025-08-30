@echo off
echo Starting Django Source Protection and Deployment...
echo ================================================

REM Set variables
set PROJECT_NAME=backend
set DEPLOY_PATH=C:\deployed_apps\%PROJECT_NAME%
set VENV_PATH=%DEPLOY_PATH%\venv

REM Create deployment directory
if not exist "%DEPLOY_PATH%" mkdir "%DEPLOY_PATH%"

REM Install PyArmor if not installed
pip show pyarmor >nul 2>&1
if errorlevel 1 (
    echo Installing PyArmor...
    pip install pyarmor
)

REM Create virtual environment for deployment
echo Creating virtual environment...
python -m venv "%VENV_PATH%"
call "%VENV_PATH%\Scripts\activate.bat"

REM Install requirements in deployment environment
if exist requirements.txt (
    echo Installing requirements...
    pip install -r requirements.txt
)

REM Obfuscate the Django project
echo Obfuscating source code...
pyarmor gen --output "%DEPLOY_PATH%\protected_src" --recursive %PROJECT_NAME%

REM Copy static files and templates (non-Python files)
echo Copying static files...
xcopy "%PROJECT_NAME%\static" "%DEPLOY_PATH%\static" /E /I /Y >nul 2>&1
xcopy "%PROJECT_NAME%\templates" "%DEPLOY_PATH%\templates" /E /I /Y >nul 2>&1
xcopy "%PROJECT_NAME%\media" "%DEPLOY_PATH%\media" /E /I /Y >nul 2>&1

REM Copy manage.py and other config files
copy "manage.py" "%DEPLOY_PATH%\" >nul 2>&1
copy "requirements.txt" "%DEPLOY_PATH%\" >nul 2>&1

REM Create production settings
echo Creating production settings...
(
echo import os
echo from .settings import *
echo DEBUG = False
echo ALLOWED_HOSTS = ['*']
echo SECRET_KEY = os.environ.get^('DJANGO_SECRET_KEY', 'change-this-in-production'^)
) > "%DEPLOY_PATH%\protected_src\%PROJECT_NAME%\settings_prod.py"

REM Set restrictive permissions
echo Setting file permissions...
icacls "%DEPLOY_PATH%" /grant Administrators:F /T >nul 2>&1
icacls "%DEPLOY_PATH%" /remove Users /T >nul 2>&1

REM Create run script
echo Creating run script...
(
echo @echo off
echo set DJANGO_SECRET_KEY=your-secret-key-here
echo set DJANGO_SETTINGS_MODULE=%PROJECT_NAME%.settings_prod
echo cd /d "%DEPLOY_PATH%"
echo call venv\Scripts\activate.bat
echo python manage.py collectstatic --noinput
echo python manage.py migrate
echo python manage.py runserver 0.0.0.0:8000
) > "%DEPLOY_PATH%\run_server.bat"

REM Compile Python files to bytecode
echo Compiling to bytecode...
python -m compileall "%DEPLOY_PATH%\protected_src" -f

REM Optional: Remove .py files (uncomment if you want maximum protection)
REM echo Removing source files...
REM forfiles /p "%DEPLOY_PATH%\protected_src" /m *.py /s /c "cmd /c del @path" 2>nul

echo ================================================
echo Deployment completed successfully!
echo Protected code location: %DEPLOY_PATH%
echo To run the server: %DEPLOY_PATH%\run_server.bat
echo ================================================
pause