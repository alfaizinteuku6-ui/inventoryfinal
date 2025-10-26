@echo off

where node >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "[Node.js] Not found - installing latest LTS version..." -ForegroundColor %YELLOW%
    powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v22.9.0/node-v22.9.0-x64.msi -OutFile node_installer.msi"
    start /wait msiexec /i node_installer.msi /qn ADDLOCAL=ALL
    del node_installer.msi
    
    call scripts\utils.bat :refresh_env
)

node --version >nul 2>nul
if %errorlevel% neq 0 (
    %ps_echo% "[Node.js] Installation failed - please install manually from nodejs.org" -ForegroundColor %RED%
    pause
    exit /b 1
)

%ps_echo% "[Node.js] Detected: " -ForegroundColor %GREEN% -NoNewline
node --version
goto :eof