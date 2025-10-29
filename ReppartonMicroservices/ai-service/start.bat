@echo off
REM Quick Start Script for Repparton AI Service (Windows)

echo ========================================
echo Repparton AI Service - Quick Start
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9 or higher
    pause
    exit /b 1
)

echo [1/5] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
)

echo [2/5] Activating virtual environment...
call venv\Scripts\activate.bat

echo [3/5] Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

echo [4/5] Setting up environment...
if not exist ".env" (
    copy .env.template .env
    echo .env file created. Please edit it with your API keys.
)

echo [5/5] Starting AI Service...
echo.
echo ========================================
echo AI Service starting on http://localhost:5000
echo ========================================
echo.
python src\app.py

pause
