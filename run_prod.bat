@echo off
start "Django Production" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000"
timeout /t 2 /nobreak > nul
start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A config worker -l info --pool=solo"
timeout /t 2 /nobreak > nul
start "Celery Beat" cmd /k "cd backend && venv\Scripts\activate && celery -A config beat -l info"
echo.
powershell -Command Write-Host "Production server with Celery starting on http://localhost:8000" -ForegroundColor Green
echo.
