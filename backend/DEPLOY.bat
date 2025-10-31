@echo off
setlocal enabledelayedexpansion
title Django + React Deployment
color 0A

cls
echo =========================================
echo   Django + React Deployment Script
echo =========================================
echo.

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

cd backend

echo [1/7] Creating virtual environment...
py -3.12 -m venv venv

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

pyarmor gen runtime --platform windows.x86_64 --output win_runtime

echo Copying runtime files...
copy win_runtime\pyarmor_runtime_000000\pyarmor_runtime.pyd pyarmor_runtime_000000\

echo Cleaning up...
rmdir /s /q win_runtime 

echo [6/7] Running migrations...
python manage.py migrate

echo.
echo =========================================
echo   Deployment Complete!
echo =========================================
