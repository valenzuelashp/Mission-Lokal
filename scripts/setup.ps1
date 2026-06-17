# Mission-Lokal setup (Windows)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "`n=== Mission-Lokal Setup ===" -ForegroundColor Cyan

function Require-Command($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        Write-Error "Missing required command: $name. See docs/TEAM_GUIDE.md"
    }
}

Require-Command php
Require-Command composer
Require-Command node
Require-Command npm

Write-Host "PHP:    $(php -r 'echo PHP_VERSION;')"
Write-Host "Node:   $(node -v)"
Write-Host ""

if (-not (Test-Path "vendor")) {
    Write-Host "Installing PHP dependencies..." -ForegroundColor Yellow
    composer install --no-interaction --no-security-blocking
}

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

if (-not (Select-String -Path ".env" -Pattern "^APP_KEY=base64:" -Quiet)) {
    Write-Host "Generating application key..." -ForegroundColor Yellow
    php artisan key:generate
}

$dbName = "mission_lokal"
$dbUser = "root"
$dbPass = ""

if (Test-Path ".env") {
    foreach ($line in Get-Content ".env") {
        if ($line -match "^DB_DATABASE=(.+)$") { $dbName = $Matches[1] }
        if ($line -match "^DB_USERNAME=(.+)$") { $dbUser = $Matches[1] }
        if ($line -match "^DB_PASSWORD=(.*)$") { $dbPass = $Matches[1] }
    }
}

Write-Host "Running migrations and seeders..." -ForegroundColor Yellow
php artisan migrate --force
php artisan db:seed --force

if (-not (Test-Path "public\storage")) {
    php artisan storage:link 2>$null
}

Write-Host ""
Write-Host "=== Setup complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Start the app (two terminals):" -ForegroundColor Cyan
Write-Host "  php artisan serve"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Open http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo logins (password: password):" -ForegroundColor Cyan
Write-Host "  Admin     ADMIN001  -> /login"
Write-Host "  Personnel PER001    -> /personnel/login"
Write-Host "  Resident  RES001    -> /login"
Write-Host ""
Write-Host "Full guide: docs/TEAM_GUIDE.md" -ForegroundColor Gray
