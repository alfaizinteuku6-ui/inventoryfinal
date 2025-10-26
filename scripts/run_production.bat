REM ============== scripts/run_production.bat ==============
@echo off
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
exit /b 0

