#!/bin/bash
# Quick Start Script for Repparton AI Service (Linux/Mac)

echo "========================================"
echo "Repparton AI Service - Quick Start"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.9 or higher"
    exit 1
fi

echo "[1/5] Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

echo "[2/5] Activating virtual environment..."
source venv/bin/activate

echo "[3/5] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "[4/5] Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.template .env
    echo ".env file created. Please edit it with your API keys."
fi

echo "[5/5] Starting AI Service..."
echo ""
echo "========================================"
echo "AI Service starting on http://localhost:5000"
echo "========================================"
echo ""
python src/app.py
