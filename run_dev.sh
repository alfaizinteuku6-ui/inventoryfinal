#!/usr/bin/env bash
# Script untuk menjalankan POS Inventory dalam mode Development (Backend + Frontend)

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Menjalankan POS Inventory (Development Mode) ==="

# Trap exit untuk mematikan background processes jika Ctrl+C ditekan
trap 'echo -e "\nMenghentikan semua server..."; kill $(jobs -p) 2>/dev/null; exit' SIGINT SIGTERM EXIT

# 1. Jalankan Django Backend
echo "[1/2] Menjalankan Backend Django di http://localhost:8000..."
cd "$BASE_DIR/backend"
./venv/bin/python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Tunggu backend siap
sleep 2

# 2. Jalankan React Frontend Dev Server
echo "[2/2] Menjalankan Frontend Vite di http://localhost:5173..."
cd "$BASE_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================================="
echo " POS-Inventory Siap Digunakan!"
echo " Frontend Dev URL : http://localhost:5173"
echo " Backend API URL  : http://localhost:8000"
echo " Swagger API Docs : http://localhost:8000/swagger/"
echo ""
echo " Akun Login Bawaan (Test Users):"
echo " 1. Admin   : admin@test.com  / admin123"
echo " 2. Kasir   : kasir@test.com  / kasir123"
echo "========================================================="
echo "Tekan Ctrl+C untuk menghentikan server."

# Tunggu processes
wait
