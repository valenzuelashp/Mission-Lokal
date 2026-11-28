# Mission-Lokal

Barangay concern and response management platform for residents, field personnel, and administrators. Residents report local issues, personnel carry out response missions, and admins oversee reports, verifications, and operations from a map-backed dashboard.

## Features

### Residents
- Public feed of barangay activity
- Submit and track concerns (with AI-assisted processing workflow)
- Take concern photos with a laptop webcam or the native camera on supported phones, or upload existing JPG/PNG/WebP images; preview, retake, and remove selections before submitting (up to four photos, 4 MB each). Live webcam access requires camera permission and HTTPS (localhost also works); the camera stops after capture, when closed, when leaving the tab, or when the session locks.
- File blotter reports
- Browse announcements and a document library
- Ask the Barangay Knowledge Assistant in English, Filipino, or Taglish, with published sources and clearly labeled general guidance
- Profile management, security settings, and ID verification onboarding

### Personnel
- Work from a department-wide mission queue, including missions assigned to teammates
- Acknowledge, update, and submit proof for missions assigned directly to the member
- Use department-specific portal branding for Traffic Management / Clearing, Environmental, Peace & Order, Utility & Infrastructure, Tambo Animal Response, or Maintenance
- Keep VAWC case details restricted to authorized Peace & Order VAW Desk and Lupon personnel and barangay admins
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
| `personnel` | Department mission queue, read-only teammate mission detail, assigned mission actions, proof upload, notifications |
| `admin` | Full admin panel — reports, missions, residents, audit, settings |
| `super_admin` | Reserved for elevated system access |

Route access is enforced by the `role` middleware (`EnsureUserHasRole`).

Personnel accounts have a department and a role within that department. Admin dispatch assigns each mission to the department and eligible roles determined by its final category. Eligible department members can review the shared queue, while only directly assigned members can change status, checklist, or proof. VAWC cases remain private and are visible only to their reporter, barangay admins, and authorized Peace & Order VAW Desk or Lupon personnel.

## Session security and concern triage

Apply migrations with `php artisan migrate` before serving the updated application. The November 28 security migration invalidates existing sessions and remember-me cookies; users sign in again and enroll a separate six-digit PIN using their current password. PINs are hashed, hidden from page props, and verified on the server with account-based attempt limits. A tab or window can be left for up to **two minutes** before a PIN is required; quick switches preserve the current form without locking. Returning within the grace period cancels the timer, including when another portal tab is active. Longer absences are checked on the server and on return even if the browser suspended background timers. The default is configured with `SESSION_PIN_LOCK_GRACE_SECONDS=120`. Manual locking remains immediate. Refresh open portal tabs after changing the lock behavior. A forgotten PIN can be reset using the account password from the lock screen.

Normal page navigation preserves the security boundary and checks session status in the background without displaying a checking screen. The mobile unlock screen provides six PIN slots, a numeric keypad, a show/hide control, and a delete key; keyboard entry and paste also work. Unlocking submits once when all six digits are entered; an incorrect PIN clears and masks the slots and restores input focus for the next attempt. Connection failures and rate limits never trigger automatic retries. PIN enrollment and password-based reset keep their standard input fields and explicit save action.

Only the latest successful login remains active. The server checks session ownership on every protected request. Connected browsers receive revocation through server-sent events; PHP's single-worker development server uses a three-second status heartbeat instead. Focus, reconnection, and page restoration also recheck the session. Production servers should permit streaming responses and disable proxy buffering for `/session/events` (the endpoint sends `X-Accel-Buffering: no`).

Admins can review successful admin and department staff sign-ins within their barangay under **System → Login Activity**, filtered by account, role, and date. Residents can review only their own sign-ins under **Profile → Login Activity**, also linked from Security Settings. Resident records are excluded from the admin view. The database queue worker resolves public IPs through the HTTPS `ipwho.is` service, with caching and a short timeout. Locations are approximate, never GPS-derived; private IPs and lookup failures display **Unknown**. Login activity remains recorded even when location lookup is unavailable.

The category catalog in [ConcernCategoryCode](app/Enums/ConcernCategoryCode.php) defines the nine accepted categories, descriptions, departments, and roles. Migrations preserve old category references while mapping existing concerns to the standardized catalog. Active missions move into the corresponding department queue without deleting assignment or proof history; changed routes carry an admin review note for existing assignees. Category realignment stores the resident's original choice and a short explanation. VAWC confidentiality is retained through later edits and reanalysis. Resident edits are allowed only before staff dispatch and increment the report revision so older queued analyses cannot overwrite the update.

Active emergencies and crimes in progress are rejected or flagged with instructions to contact **911, BFP, or PNP**. They cannot be dispatched through the routine concern workflow. Local screening runs before submission, and AI performs another scope assessment. Uncertain or invalid AI output stays under review until an authorized admin confirms non-emergency scope. Routine cases route by the final category; **Other (Non-Emergency)** remains in Admin Triage. Keep `php artisan queue:work database` running for AI analysis and login-location enrichment.

Mission proof requires photos and execution notes; work-site GPS is optional and the assigned mission location is used otherwise. Personnel can mention delayed work details in their notes. Proof drafts can be saved on the device and queued while offline, then upload when the proof page is open again with connectivity. Draft photos remain in that browser until upload succeeds or the personnel deletes the draft.

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

## Quick start (new teammates)

**Prerequisites:** PHP 8.2+, Composer, Node 18+, MySQL 8+. See [docs/TEAM_GUIDE.md](docs/TEAM_GUIDE.md) for full details.

```powershell
# Windows
.\scripts\setup.ps1
```

```bash
# macOS / Linux
chmod +x scripts/setup.sh && ./scripts/setup.sh
```

Then run three terminals: `php artisan serve`, `npm run dev`, and `php artisan queue:work database` → [http://localhost:8000](http://localhost:8000)

**Demo logins** (password: `password`):

| Role | Account ID | URL |
|------|------------|-----|
| Admin | `ADMIN001` | `/login` |
| Personnel | `PER001` | `/personnel/login` |
| Resident | `RES001` | `/login` |

Department portal demos (all use password `password`):

| Department | Account ID |
|------------|------------|
| Peace & Order | `TAMBO_PER_0001` |
| Utility & Infrastructure | `TAMBO_PER_0999` |
| Environmental | `TAMBO_PER_1003` |
| Traffic Management / Clearing | `TAMBO_PER_1004` |
| Tambo Animal Response Team | `TAMBO_PER_1005` |
| Maintenance | `TAMBO_PER_1006` |

## Getting Started (manual)

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

   In a third terminal, start the background queue worker:

   ```bash
   php artisan queue:work database
   ```

   Open [http://localhost:8000](http://localhost:8000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build production assets |
| `npm run preview` | Preview the production build |
| `php artisan serve` | Start the Laravel development server |
| `php artisan queue:work database` | Process queued AI triage and address geocoding jobs |

## Barangay Knowledge Assistant

The assistant prioritizes active Resource Library entries and enabled document forms for the signed-in resident's barangay. Official facts appear as source excerpts; general guidance is labeled separately. Questions without matching records can still receive useful guidance or a clarification question.

Manage public knowledge through the existing admin library and document tools. Publish actual office schedules, service requirements, and current contact details there; the assistant does not invent missing local information. Document form fields are distinguished from supporting-document requirements.

Configure Gemini on the server:

```dotenv
GEMINI_API_KEY=your-server-side-key
GEMINI_CHAT_MODEL=gemini-3.1-pro-preview
GEMINI_CHAT_MAX_OUTPUT_TOKENS=4096
GEMINI_CHAT_TIMEOUT=20
```

Chat settings do not change the AI concern-analysis model. After changing cached deployment configuration, refresh Laravel's configuration cache through the normal deployment process.

Conversations use the existing server session, retain up to six exchanges, and expire after 30 minutes of inactivity. Residents can clear their conversation. Private records are not retrieved, and questions, provider response bodies, and credentials are excluded from chatbot diagnostic logs.

Published contact answers and limited general fallbacks remain available during AI failures. Empty retrieval is distinguished from database failure, quota limits, blocked output, incomplete generation, and invalid evidence. Check sanitized application logs when a service notice appears. For local development, ensure XAMPP MySQL is running on the configured database port.

Focused checks:

```shell
php vendor/bin/phpunit --filter "BarangayHelp|DocumentCatalogTest"
npm run test:help
```

## Domain Model (overview)

**Concern lifecycle:** `submitted` → `ai_processed` → `under_review` → `active` → `resolved` / `closed` (or `rejected` / `spam`)

**Mission lifecycle:** `assigned` → `acknowledged` → `in_progress` → `completed` → `verified` (or `cancelled`)

## PWA

The app is configured as a Progressive Web App with standalone display, auto-updating service worker, and cached library routes for offline access. Icons live under `public/icons/pwa/`.

## Documentation

| Document | Description |
| --- | --- |
| [docs/TEAM_GUIDE.md](docs/TEAM_GUIDE.md) | **Start here** — install, run, conventions, troubleshooting |
| [docs/TASKS.md](docs/TASKS.md) | Project task backlog and sprint plan |
| [docs/BLUEPRINT.md](docs/BLUEPRINT.md) | Full system blueprint — requirements, flows, API, MVP scope |
| [docs/DATABASE.md](docs/DATABASE.md) | Normalized MySQL schema — tables, keys, indexes |

## License

Research project — see repository owner for licensing terms.
