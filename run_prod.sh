#!/usr/bin/env bash
# Script untuk menjalankan POS Inventory dalam mode Single Server (Django melayani Frontend + Backend)

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Menjalankan POS Inventory (Production / Single Port Mode) ==="
cd "$BASE_DIR/backend"
./venv/bin/python manage.py runserver 0.0.0.0:8000
