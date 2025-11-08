@echo off

where nssm >nul 2>nul
if %errorlevel% neq 0 (
    powershell -Command Write-Host "NSSM not found. Downloading and installing..." -ForegroundColor Yellow
    echo.
    
    set "TEMP_DIR=%PROJECT_ROOT%\temp_nssm"
    if not exist "!TEMP_DIR!" mkdir "!TEMP_DIR!"
    
    set "NSSM_ZIP=!TEMP_DIR!\nssm.zip"
    
    :: Try primary download source
    powershell -ExecutionPolicy Bypass -Command "$ProgressPreference = 'SilentlyContinue'; try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile '!NSSM_ZIP!' -UseBasicParsing -TimeoutSec 30; Write-Host '  ✓ Downloaded NSSM' -ForegroundColor Green; exit 0 } catch { Write-Host '  ✗ Primary source failed: ' $_.Exception.Message -ForegroundColor Yellow; exit 1 }"
    
    :: If primary fails, try GitHub mirror
    if !errorlevel! neq 0 (
        powershell -Command Write-Host "  Trying alternative download source..." -ForegroundColor Yellow
        powershell -ExecutionPolicy Bypass -Command "$ProgressPreference = 'SilentlyContinue'; try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/kirillkovalenko/nssm/releases/download/2.24/nssm-2.24.zip' -OutFile '!NSSM_ZIP!' -UseBasicParsing -TimeoutSec 30; Write-Host '  ✓ Downloaded NSSM from mirror' -ForegroundColor Green; exit 0 } catch { Write-Host '  ✗ Mirror source failed: ' $_.Exception.Message -ForegroundColor Red; exit 1 }"
    )
    
    if !errorlevel! neq 0 (
        powershell -Command Write-Host "" -ForegroundColor Red
        powershell -Command Write-Host "Failed to download NSSM automatically." -ForegroundColor Red
        echo.
        echo Please download NSSM manually:
        echo 1. Visit: https://nssm.cc/release/nssm-2.24.zip
        echo 2. Download nssm-2.24.zip
        echo 3. Extract it and copy nssm.exe to: %SCRIPT_DIR%
        echo 4. Run this script again
        echo.
        pause
        exit /b 1
    )
    
    if not exist "!NSSM_ZIP!" (
        powershell -Command Write-Host "NSSM zip file not found after download." -ForegroundColor Red
        exit /b 1
    )
    
    powershell -Command Write-Host "  Extracting NSSM..." -ForegroundColor Cyan
    powershell -ExecutionPolicy Bypass -Command "try { Expand-Archive -Path '!NSSM_ZIP!' -DestinationPath '!TEMP_DIR!' -Force; Write-Host '  ✓ Extracted NSSM' -ForegroundColor Green } catch { Write-Host '  ✗ Failed to extract: ' $_.Exception.Message -ForegroundColor Red; exit 1 }"
    
    if !errorlevel! neq 0 (
        powershell -Command Write-Host "Failed to extract NSSM." -ForegroundColor Red
        exit /b 1
    )
    
    if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
        if exist "!TEMP_DIR!\nssm-2.24\win64\nssm.exe" (
            copy "!TEMP_DIR!\nssm-2.24\win64\nssm.exe" "%SCRIPT_DIR%nssm.exe" >nul
            powershell -Command Write-Host "  ✓ Copied 64-bit NSSM" -ForegroundColor Green
        ) else (
            powershell -Command Write-Host "  ✗ 64-bit NSSM.exe not found in archive" -ForegroundColor Red
            dir "!TEMP_DIR!" /s /b | findstr nssm.exe
            exit /b 1
        )
    ) else (
        if exist "!TEMP_DIR!\nssm-2.24\win32\nssm.exe" (
            copy "!TEMP_DIR!\nssm-2.24\win32\nssm.exe" "%SCRIPT_DIR%nssm.exe" >nul
            powershell -Command Write-Host "  ✓ Copied 32-bit NSSM" -ForegroundColor Green
        ) else (
            powershell -Command Write-Host "  ✗ 32-bit NSSM.exe not found in archive" -ForegroundColor Red
            exit /b 1
        )
    )
    
    :: Set NSSM_PATH to the local copy
    set "LOCAL_NSSM_PATH=%SCRIPT_DIR%nssm.exe"
    
    :: Verify before cleanup
    if not exist "!LOCAL_NSSM_PATH!" (
        powershell -Command Write-Host "  ✗ NSSM.exe not found at: !LOCAL_NSSM_PATH!" -ForegroundColor Red
        echo Script Dir: %SCRIPT_DIR%
        dir "%SCRIPT_DIR%" | findstr nssm
        exit /b 1
    )
    
    :: Cleanup temp directory
    if exist "!TEMP_DIR!" rmdir /s /q "!TEMP_DIR!"
    
    powershell -Command Write-Host "  ✓ NSSM installed successfully at: !LOCAL_NSSM_PATH!" -ForegroundColor Green
    echo.
    
    :: Export to parent environment
    endlocal & set "NSSM_PATH=%LOCAL_NSSM_PATH%"
    exit /b 0
) else (
    set "LOCAL_NSSM_PATH=nssm"
    powershell -Command Write-Host "  ✓ NSSM found in system PATH" -ForegroundColor Green
    echo.
    endlocal & set "NSSM_PATH=nssm"
    exit /b 0
)