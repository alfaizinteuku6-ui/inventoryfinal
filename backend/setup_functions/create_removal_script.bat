@echo off
setlocal enabledelayedexpansion

(
    echo @echo off
    echo net session ^>nul 2^>^&1
    echo if %%errorlevel%% neq 0 ^(
    echo     echo Requesting Administrator privileges...
    echo     powershell -Command "Start-Process '%%~f0' -Verb RunAs"
    echo     exit /b
    echo ^)
    echo.
    echo echo Stopping and removing services...
    echo echo.
    echo net stop NginxServer
    echo taskkill /F /IM nginx.exe ^>nul 2^>^&1
    echo timeout /t 2 ^>nul
    echo net stop DjangoCeleryBeat
    echo net stop DjangoCeleryWorker
    echo net stop DjangoPythonApp
    echo net stop RedisServer
    echo.
    echo "%NSSM_PATH%" remove NginxServer confirm
    echo "%NSSM_PATH%" remove DjangoCeleryBeat confirm
    echo "%NSSM_PATH%" remove DjangoCeleryWorker confirm
    echo "%NSSM_PATH%" remove DjangoPythonApp confirm
    echo "%NSSM_PATH%" remove RedisServer confirm
    echo.
    echo echo Services removed successfully
    echo pause
) > "%PROJECT_ROOT%\remove_services.bat"

powershell -Command Write-Host "Removal script created: remove_services.bat" -ForegroundColor Yellow
echo.
exit /b 0