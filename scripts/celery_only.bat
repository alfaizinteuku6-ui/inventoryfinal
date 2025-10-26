REM ============== scripts/celery_only.bat ==============
@echo off
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
exit /b 0

