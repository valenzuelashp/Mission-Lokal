#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=== Mission-Lokal Setup ==="

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1. See docs/TEAM_GUIDE.md" >&2
    exit 1
  fi
}

require php
require composer
require node
require npm

echo "PHP:  $(php -r 'echo PHP_VERSION;')"
echo "Node: $(node -v)"
echo ""

if [ ! -d vendor ]; then
  echo "Installing PHP dependencies..."
  composer install --no-interaction
fi

if [ ! -d node_modules ]; then
  echo "Installing Node dependencies..."
  npm install
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
  echo "Generating application key..."
  php artisan key:generate
fi

echo "Running migrations and seeders..."
php artisan migrate --force
php artisan db:seed --force

php artisan storage:link 2>/dev/null || true

echo ""
echo "=== Setup complete ==="
echo ""
echo "Start the app (two terminals):"
echo "  php artisan serve"
echo "  npm run dev"
echo ""
echo "Open http://localhost:8000"
echo ""
echo "Demo logins (password: password):"
echo "  Admin     ADMIN001  -> /login"
echo "  Personnel PER001    -> /personnel/login"
echo "  Resident  RES001    -> /login"
echo ""
echo "Full guide: docs/TEAM_GUIDE.md"
