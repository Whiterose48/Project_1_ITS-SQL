#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────
#  ITS-SQL Platform — Quick Setup Script
# ────────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "═══════════════════════════════════════════"
echo "  ITS-SQL Platform — Setup"
echo "═══════════════════════════════════════════"

# ── 1. Backend Setup ─────────────────────────────────────
echo ""
echo "▸ Setting up Backend (FastAPI)..."

cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "  Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "  Installing Python dependencies..."
pip install -r requirements.txt --quiet

# Copy .env if it doesn't exist
if [ ! -f ".env" ]; then
  echo "  Creating .env from .env.example..."
  cp .env.example .env
  echo "  ⚠️  Edit backend/.env to set your GOOGLE_CLIENT_ID"
fi

# Run seed (creates DB + loads problems)
echo "  Seeding database..."
python -m app.seed

echo "  ✅ Backend ready!"

# ── 2. Frontend Setup ────────────────────────────────────
echo ""
echo "▸ Setting up Frontend (React + Vite)..."

cd "$FRONTEND_DIR"

# Install dependencies
if command -v pnpm &> /dev/null; then
  echo "  Installing with pnpm..."
  pnpm install --silent
elif command -v npm &> /dev/null; then
  echo "  Installing with npm..."
  npm install --silent
else
  echo "  ⚠️  No package manager found. Install pnpm or npm."
  exit 1
fi

echo "  ✅ Frontend ready!"

# ── Done ─────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  Setup Complete!"
echo ""
echo "  To start the backend:"
echo "    cd backend && source venv/bin/activate"
echo "    uvicorn app.main:app --reload"
echo ""
echo "  To start the frontend:"
echo "    cd frontend && pnpm dev"
echo ""
echo "  API docs: http://localhost:8000/docs"
echo "  Frontend: http://localhost:8080"
echo "═══════════════════════════════════════════"
