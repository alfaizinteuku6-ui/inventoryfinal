@echo off
start "Django Backend" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"
timeout /t 2 /nobreak > nul
start "Celery Worker" cmd /k "cd backend && venv\Scripts\activate && celery -A config worker -l info --pool=solo"
timeout /t 2 /nobreak > nul
start "Celery Beat" cmd /k "cd backend && venv\Scripts\activate && celery -A config beat -l info"
timeout /t 2 /nobreak > nul
start "React Frontend" cmd /k "cd frontend && npm run dev"
echo.
powershell -Command Write-Host "Development servers starting..." -ForegroundColor Green
powershell -Command Write-Host "  - Backend:  http://localhost:8000" -ForegroundColor Cyan
powershell -Command Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Cyan
echo.
