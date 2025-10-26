@echo off

where python >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "[Python] Not found - installing latest stable version..." -ForegroundColor %YELLOW%
    powershell -Command "Invoke-WebRequest -Uri https://www.python.org/ftp/python/3.12.5/python-3.12.5-amd64.exe -OutFile python_installer.exe"
    start /wait python_installer.exe /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    del python_installer.exe
    
    call scripts\utils.bat :refresh_env
)

python --version >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "[Python] Installation failed. Please install manually from python.org/downloads" -ForegroundColor %RED%
    %ps_echo% "Make sure to check 'Add Python to PATH' during installation." -ForegroundColor %YELLOW%
    pause
    exit /b 1
)

%ps_echo% "[Python] Detected: " -ForegroundColor %GREEN% -NoNewline
python --version
goto :eof