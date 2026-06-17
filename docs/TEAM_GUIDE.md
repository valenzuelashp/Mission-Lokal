# Mission-Lokal — Team Guide

Guide for developers joining the project. Read this before your first commit.

---

## What this project is

Mission-Lokal is a barangay concern and response management PWA. Three portals share one Laravel + Inertia + React codebase:

| Portal | URL prefix | Role |
|--------|------------|------|
| Resident | `/feed`, `/concerns`, … | `resident` |
| Personnel | `/personnel/*` | `personnel` |
| Admin | `/admin/*` | `admin` |

**Architecture:** Laravel 11 monolith with React pages via Inertia.js (not a separate frontend repo). See [BLUEPRINT.md](./BLUEPRINT.md) for requirements and [TASKS.md](./TASKS.md) for the backlog.

---

## Prerequisites

Install these **before** cloning:

| Tool | Version | Notes |
|------|---------|-------|
| **PHP** | 8.2+ | XAMPP, Laragon, or standalone. Enable extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, **`zip`** |
| **Composer** | 2.x | [getcomposer.org](https://getcomposer.org/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | Bundled with Node |
| **MySQL** | 8.0+ | XAMPP MySQL or standalone |
| **Git** | any recent | |

### Windows (XAMPP) tip

If `composer install` is very slow or fails, enable the PHP **zip** extension in `C:\xampp\php\php.ini`:

```ini
extension=zip
```

Restart your terminal after changing `php.ini`.

---

## First-time setup (automated)

From the project root:

**Windows (PowerShell):**

```powershell
.\scripts\setup.ps1
```

**macOS / Linux:**

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The script will:

1. Check PHP, Composer, Node, npm
2. Run `composer install`
3. Run `npm install`
4. Copy `.env.example` → `.env` (if missing)
5. Generate `APP_KEY`
6. Create the MySQL database (if possible)
7. Run migrations + seed demo data
8. Create the storage symlink

### Manual setup (if the script fails)

```bash
composer install
npm install
cp .env.example .env          # Windows: copy .env.example .env
php artisan key:generate
```

Create the database in MySQL:

```sql
CREATE DATABASE mission_lokal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `.env` with your MySQL credentials, then:

```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
```

---

## Running the app

You need **two terminals** from the project root:

**Terminal 1 — Laravel:**

```bash
php artisan serve
```

**Terminal 2 — Vite (frontend hot reload):**

```bash
npm run dev
```

Open [http://localhost:8000](http://localhost:8000).

---

## Demo accounts

After seeding, use these credentials (password for all: **`password`**):

| Role | Account ID | Login URL |
|------|------------|-----------|
| Admin | `ADMIN001` | [/login](http://localhost:8000/login) |
| Personnel | `PER001` | [/personnel/login](http://localhost:8000/personnel/login) |
| Resident | `RES001` | [/login](http://localhost:8000/login) |

---

## Project structure

```
app/
  Enums/           PHP enums (roles, statuses)
  Http/
    Controllers/   Backend logic (grouped by portal)
    Middleware/    Role checks, Inertia
  Models/          Eloquent models
  Services/        Business logic (AI, missions, etc.)
database/
  migrations/      Schema changes
  seeders/         Demo + reference data
resources/
  js/
    Components/    Reusable UI
    Layouts/       Portal shells
    Pages/         Inertia pages (one per screen)
    Types/         Shared TypeScript types
routes/
  web.php          Resident + shared
  personnel.php    Personnel portal
  admin.php        Admin portal
docs/
  BLUEPRINT.md     System design
  DATABASE.md      Schema reference
  TASKS.md         Task backlog
  TEAM_GUIDE.md    This file
```

---

## Daily workflow

### Pull latest changes

```bash
git pull origin main
composer install        # if composer.lock changed
npm install             # if package-lock.json changed
php artisan migrate       # if new migrations exist
```

### Create a feature branch

```bash
git checkout -b feature/short-description
```

### While developing

- Backend changes: controllers, models, migrations in `app/` and `database/`
- Frontend changes: React pages in `resources/js/Pages/`
- New screen: add route in `routes/*.php` + create page component
- Shared UI: `resources/js/Components/`

### Before pushing

```bash
npm run build           # TypeScript check + production build
php artisan test        # PHPUnit (when tests exist)
```

### Commit style

Use clear messages focused on **why**:

```
Add concern submission form with map pin picker
Fix personnel login rejecting valid accounts
```

---

## Conventions

| Area | Convention |
|------|------------|
| PHP | PSR-4, Laravel naming, enums in `app/Enums/` |
| React | Functional components, hooks over inline logic |
| Pages | Match route path: `Resident/Concerns/New.tsx` → `/concerns/new` |
| Types | Shared types in `resources/js/Types/` |
| Roles | Enforced by `role` middleware — never trust client-side checks alone |
| Docs | Update `TASKS.md` checkboxes when completing backlog items |

---

## Common issues

### `Vite manifest not found`

Run `npm run dev` or `npm run build` in a second terminal.

### MySQL password (XAMPP)

If migration fails with `Access denied for user 'root'@'localhost'`, set `DB_PASSWORD` in `.env`. Many XAMPP installs use an empty password; others use `root`. Create the database first:

```sql
CREATE DATABASE mission_lokal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run `php artisan migrate` and `php artisan db:seed`.

### `419 Page Expired` on login

Clear browser cookies, run `php artisan config:clear`, ensure `APP_URL` matches how you access the site.

### `npm run build` TypeScript errors

Fix types in `resources/js/` before pushing. Do not skip the build.

### Port 8000 already in use

```bash
php artisan serve --port=8001
```

Update `APP_URL` in `.env` if needed.

---

## Who to ask

| Topic | Reference |
|-------|-----------|
| Requirements & flows | [BLUEPRINT.md](./BLUEPRINT.md) |
| Database tables | [DATABASE.md](./DATABASE.md) |
| What to build next | [TASKS.md](./TASKS.md) |
| Tech stack overview | [README.md](../README.md) |

---

## Security reminders

- Never commit `.env` or real credentials
- Never commit government ID images or real resident PII
- Use demo data from seeders for local development
- Private concerns (VAWC, domestic) must never appear on the public feed

---

*Last updated: project bootstrap — foundation, auth, seed data, stub pages.*
