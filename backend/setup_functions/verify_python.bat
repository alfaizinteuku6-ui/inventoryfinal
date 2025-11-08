@echo off
setlocal enabledelayedexpansion

set "PYTHON_PATH=%PROJECT_ROOT%\venv\Scripts\python.exe"
if not exist "%PYTHON_PATH%" (
    powershell -Command Write-Host "ERROR: Python virtual environment not found" -ForegroundColor Red
    echo Expected location: %PYTHON_PATH%
    echo.
    echo Please ensure your virtual environment is set up correctly.
    exit /b 1
)

set "CELERY_PATH=%PROJECT_ROOT%\venv\Scripts\celery.exe"
if not exist "%CELERY_PATH%" (
    powershell -Command Write-Host "ERROR: Celery not found in virtual environment" -ForegroundColor Red
    echo Expected location: %CELERY_PATH%
    echo.
    echo Please install Celery: pip install celery
    exit /b 1
)

set "RUN_APP_PATH=%PROJECT_ROOT%\run_app.py"
if not exist "%RUN_APP_PATH%" (
    powershell -Command Write-Host "ERROR: run_app.py not found" -ForegroundColor Red
    echo Expected location: %RUN_APP_PATH%
    echo.
    exit /b 1
)

powershell -Command Write-Host "  ✓ Python and Celery verified" -ForegroundColor Green
echo.
exit /b 0