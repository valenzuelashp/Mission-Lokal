# Mission-Lokal

Barangay concern and response management platform for residents, field personnel, and administrators. Residents report local issues, personnel carry out response missions, and admins oversee reports, verifications, and operations from a map-backed dashboard.

## Features

### Residents
- Public feed of barangay activity
- Submit and track concerns (with AI-assisted processing workflow)
- File blotter reports
- Browse announcements and a document library
- Profile management, security settings, and ID verification onboarding

### Personnel
- View assigned missions and update status
- Submit proof of completion
- In-app notifications

### Administrators
- Dashboard and live map of concerns
- Review reports, assign missions, and verify completions
- Manage resident verifications and profile edit requests
- Blotter, announcement, and library management
- Audit log and system settings

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Backend | PHP 8.2+, Laravel 11, Sanctum |
| Frontend | React 18, TypeScript, Inertia.js |
| Styling | Tailwind CSS, shadcn/ui conventions |
| Maps | Leaflet, react-leaflet, OpenStreetMap tiles |
| Build | Vite, laravel-vite-plugin |
| PWA | vite-plugin-pwa (offline-capable, installable) |

## User Roles

| Role | Access |
|------|--------|
| `resident` | Feed, concerns, blotter, library, announcements, profile |
| `personnel` | Mission list, mission detail, proof upload, notifications |
| `admin` | Full admin panel — reports, missions, residents, audit, settings |
| `super_admin` | Reserved for elevated system access |

Route access is enforced by the `role` middleware (`EnsureUserHasRole`).

## Project Structure

```
app/
  Enums/              # UserRole, ConcernStatus, MissionStatus
  Http/
    Controllers/      # API and page controllers
    Middleware/       # Role-based access control
resources/
  js/
    Components/       # Shared UI (maps, etc.)
    Layouts/          # Resident, Personnel, Admin shells
    Pages/            # Inertia page components
    Types/            # Shared TypeScript types
  css/                # Tailwind entry
routes/
  web.php             # Resident and shared routes
  personnel.php       # Personnel portal
  admin.php           # Admin portal
```

## Prerequisites

- PHP 8.2 or higher with common extensions (`mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`)
- Composer
- Node.js 18+ and npm
- MySQL (or compatible database)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mission-lokal
   ```

2. **Install dependencies**

   ```bash
   composer install
   npm install
   ```

3. **Configure the environment**

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Update `.env` with your database credentials:

   ```
   DB_DATABASE=mission_lokal
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Set up the database**

   ```bash
   php artisan migrate
   php artisan db:seed   # if seeders are available
   ```

5. **Run the development servers**

   In one terminal:

   ```bash
   php artisan serve
   ```

   In another:

   ```bash
   npm run dev
   ```

   Open [http://localhost:8000](http://localhost:8000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build production assets |
| `npm run preview` | Preview the production build |
| `php artisan serve` | Start the Laravel development server |

## Domain Model (overview)

**Concern lifecycle:** `submitted` → `ai_processed` → `under_review` → `active` → `resolved` / `closed` (or `rejected` / `spam`)

**Mission lifecycle:** `assigned` → `acknowledged` → `in_progress` → `completed` → `verified` (or `cancelled`)

## PWA

The app is configured as a Progressive Web App with standalone display, auto-updating service worker, and cached library routes for offline access. Icons live under `public/icons/pwa/`.

## Documentation

| Document | Description |
| --- | --- |
| [docs/BLUEPRINT.md](docs/BLUEPRINT.md) | Full system blueprint — requirements, flows, API, MVP scope |
| [docs/DATABASE.md](docs/DATABASE.md) | Normalized MySQL schema — tables, keys, indexes |

## License

Research project — see repository owner for licensing terms.
