@echo off
setlocal enabledelayedexpansion
title Django + React Deployment
color 0A

cls
echo =========================================
echo   Django + React Deployment Script
echo =========================================
echo.

REM Check if Python is installed at all
where python >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python is not installed!
    echo Please install Python 3.9 or higher from python.org
    pause
    exit /b 1
)

python --version
echo.

REM Check if Python 3.12 is available
py -3.12 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Python 3.12 not found on system
    echo.
    set /p INSTALL_PYTHON="Would you like to install Python 3.12 automatically? (Y/N): "
    
    if /i "!INSTALL_PYTHON!"=="Y" (
        echo.
        echo [*] Checking for winget...
        where winget >nul 2>nul
        if !errorlevel! neq 0 (
            color 0C
            echo [ERROR] winget not found. Please install Python 3.12 manually from:
            echo https://www.python.org/downloads/release/python-3120/
            pause
            exit /b 1
        )
        
        echo [*] Installing Python 3.12 via winget...
        echo This may take a few minutes...
        winget install Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements
        
        if !errorlevel! neq 0 (
            color 0C
            echo [ERROR] Failed to install Python 3.12
            echo Please install manually from: https://www.python.org/downloads/
            pause
            exit /b 1
        )
        
        echo [*] Python 3.12 installed successfully!
        echo [*] Refreshing environment variables...
        
        REM Refresh PATH without restarting
        for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "UserPath=%%b"
        for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SystemPath=%%b"
        set "PATH=%UserPath%;%SystemPath%"
        
        echo.
        echo NOTE: If Python 3.12 is still not detected, please:
        echo 1. Close this window
        echo 2. Open a new Command Prompt
        echo 3. Run this script again
        echo.
        pause
        
        REM Try again after installation
        py -3.12 --version >nul 2>&1
        if !errorlevel! neq 0 (
            color 0E
            echo [WARNING] Python 3.12 installed but not yet available in PATH
            echo Please restart your terminal and run this script again
            pause
            exit /b 1
        )
    ) else (
        color 0C
        echo [ERROR] Python 3.12 is required to continue
        echo Please install it manually from: https://www.python.org/downloads/
        pause
        exit /b 1
    )
)

echo [*] Python 3.12 detected
py -3.12 --version
echo.

cd backend

echo [1/7] Creating virtual environment...
py -3.12 -m venv venv

if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/7] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/7] Upgrading pip...
pip install --upgrade pip >nul 2>&1

echo [4/7] Installing dependencies...
pip install -r requirements.txt

echo [5/7] Setting up environment...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo WARNING: Created .env from .env.example
        echo Please edit .env with your settings
    ) else (
        echo WARNING: No .env file found. Please create one.
    )
)

echo [5.5/7] Setting up PyArmor runtime...
pyarmor gen runtime --platform windows.x86_64 --output win_runtime

if %errorlevel% neq 0 (
    color 0E
    echo [WARNING] PyArmor runtime generation failed
    echo Continuing with deployment...
) else (
    echo Copying runtime files...
    if not exist pyarmor_runtime_000000 mkdir pyarmor_runtime_000000
    copy win_runtime\pyarmor_runtime_000000\pyarmor_runtime.pyd pyarmor_runtime_000000\ >nul 2>&1
    
    echo Cleaning up...
    rmdir /s /q win_runtime >nul 2>&1
)

echo [6/7] Running migrations...
python manage.py migrate

echo.
color 0A
echo =========================================
echo   Deployment Complete!
echo =========================================
echo.
pause