REM ============== scripts/create_users.bat ==============
@echo off
cls
%ps_echo% "========================================" -ForegroundColor %BLUE%
%ps_echo% "   Creating Test Users..." -ForegroundColor %BLUE%
%ps_echo% "========================================" -ForegroundColor %BLUE%
echo.

cd backend
call venv\Scripts\activate.bat

call ..\scripts\utils.bat :create_user_script
python manage.py shell < ..\create_users.py

cd ..
echo.
%ps_echo% "Done!" -ForegroundColor %GREEN%
pause
exit /b 0
