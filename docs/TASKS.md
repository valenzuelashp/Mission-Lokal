# Mission-Lokal — Project Tasks

Task backlog aligned with [BLUEPRINT.md](./BLUEPRINT.md) and [DATABASE.md](./DATABASE.md).

**Legend:** `[x]` done · `[ ]` not started · `[-]` in progress

---

## Phase 0 — Project foundation

- [x] Laravel 11 bootstrap (`artisan`, `bootstrap/`, `config/`, `public/`)
- [x] Inertia middleware + shared props (`auth`, `flash`)
- [x] Role middleware (`EnsureUserHasRole`)
- [x] Route skeleton (resident, personnel, admin, auth, onboarding)
- [x] Layout shells (Resident, Personnel, Admin)
- [x] Stub pages for all routed screens
- [x] Login (resident/admin) + personnel login
- [x] Setup scripts (`scripts/setup.ps1`, `scripts/setup.sh`)
- [x] Team guide ([TEAM_GUIDE.md](./TEAM_GUIDE.md))
- [x] Base shadcn/ui components (Button, Input, Card, Badge, Label)
- [x] Shared UI: PageHeader, EmptyState, mobile nav (ResidentLayout)
- [ ] Shared UI: toasts, Dialog, Table, Form

---

## Phase 1 — Database & domain layer

- [x] Core migrations: `barangays`, `barangay_settings`, `users`, sessions, cache, jobs
- [x] Models: `Barangay`, `BarangaySetting`, `User`
- [x] PHP enums: `UserRole`, `ConcernStatus`, `MissionStatus`, `VerificationStatus`
- [x] Demo seeder (barangay + admin, personnel, resident accounts)
- [x] Remaining MVP tables (concerns, missions, blotters, library, announcements, audit, etc.)
- [x] Seed `concern_categories` and subcategories (Blueprint §12)
- [x] Seed `category_playbooks`
- [x] Seed library items (emergency guides, evacuation centers)
- [x] Factories for concerns, missions, users

---

## Phase 2 — Authentication & onboarding

- [x] Resident/admin login (`account_id` + password)
- [x] Personnel login portal
- [x] Logout
<<<<<<< HEAD
- [x] Forgot password — email OTP → reset (Blueprint R7)
- [x] Onboarding: confirm preloaded details
- [x] Onboarding: government ID upload (encrypt at rest)
- [X] Onboarding: pending / approved / rejected screens
- [x] Onboarding: set password after approval
- [X] Middleware: redirect unverified residents to onboarding
=======
- [x] **R10** Concern detail — status timeline (UI done; wire real data)
 Forgot password — email OTP → reset (Blueprint R7)
- [x] Onboarding: confirm preloaded details
- [x] Onboarding: government ID upload (encrypt at rest)
- [x] Onboarding: pending / approved / rejected screens
- [x] Onboarding: set password after approval
- [x] Middleware: redirect unverified residents to onboarding
>>>>>>> 813ea35 (Phase 2 Done)
- [x] `preloaded_residents` import (CSV)

---

## Phase 3 — Resident module (MVP)

### Pages

- [x] **R8** Public feed — list, vote, post CTA (UI built; wire real data + vote action)
- [-] **R9** Post concern — form, map pin, photos (UI done; wire persistence)
- [x] **R10** Concern detail — status timeline (UI done; wire real data)
- [-] **R11** Library — manuals, evacuation, contacts (UI done; wire real data)
- [-] **R12** Profile — info, digital ID (UI done; wire real data)
- [-] **R13** Edit profile — pending approval badge (UI done; wire approval flow)
- [-] **R14** Security — change password (UI done; wire backend)
- [x] **R15–R16** Blotter type select + form (UI done; wire backend)
- [-] **R17** Announcements list + detail (UI done; wire real data)

### Backend

- [x] `ConcernController` — CRUD, vote, visibility rules
- [x] `BlotterController`
- [ ] `ProfileController` — update with approval flow
- [ ] `LibraryController`, `AnnouncementController`
- [-] File upload service (concern media, ID docs)
- [ ] Row-level authorization for private concerns

---

## Phase 4 — AI concern pipeline

- [ ] Queue job: `ProcessConcernWithAi`
- [ ] Language detect (Filipino / English)
- [ ] Category + subcategory classification
- [ ] Public vs private routing
- [ ] Severity scoring
- [ ] Duplicate detection (geo + time window)
- [ ] Prescriptive checklist from playbooks
- [ ] Suggested due date
- [ ] Persist `concern_ai_analysis`; status → `ai_processed`
- [ ] Blotter redirect prompt for sensitive concerns
- [ ] Admin queue notification

---

## Phase 5 — Admin module (MVP)

### Pages

- [x] **A1** Dashboard — KPI cards, incident queue, map, activity feed (UI done; wire real data)
- [-] **A2** Full map — pins, hotspots, filters (UI done; wire real geo data)
- [x] **A3** Report queue — confirm / override / reject (UI done; wire real data + actions)
- [-] A4 Mission board — assign / reassign (UI done; real data, map coordinates, and proof photos wired! Actions next)
- [ ] **A5** Verification queue
- [ ] **A6** Profile edit queue
- [-] **A7–A8** Residents list + detail (UI done; wire real data)
- [x] **A9** Blotters management
- [-] **A10** Announcements CRUD (UI done; wire real data + persistence)
- [ ] **A11** Library CRUD
- [ ] **A12** Audit log
- [ ] **A13** Settings

### Backend

- [-] Report actions: confirm AI, merge duplicate, reject, create mission
- [ ] Mission assignment + verification
- [ ] Concern status state machine (Blueprint §5.1)
- [ ] Audit log on admin mutations
- [x] Blotter approval → ticket number

---

## Phase 6 — Personnel module (MVP)

### Pages

- [ ] **P2** My missions list
- [-] **P3** Mission detail — checklist, map
- [x] **P4** Proof upload
- [ ] **P5** Notifications

### Backend

- [ ] Status: acknowledge → in progress → completed
- [x] Proof upload + storage
- [ ] ACK timeout escalation (default 4 hrs)
- [ ] Assigned-mission-only authorization

---

## Phase 7 — Notifications

- [ ] SMS gateway (personnel assignment)
- [ ] Email: OTP, verification, blotter ticket
- [ ] In-app notifications + badges
- [ ] Resident: active, resolved, rejected alerts
- [ ] Admin: unacknowledged missions, new proof

---

## Phase 8 — Maps & dashboard

- [-] Extend `MapView` — pins, popups, severity colors
- [ ] Admin map filters
- [ ] Geocoding / reverse geocode
- [ ] Dashboard aggregates

---
+## Phase 9 — PWA, security & compliance

- [ ] PWA install + service worker verification
- [ ] Offline library cache
- [ ] Rate limiting (login, OTP, reports)
- [ ] Government ID encryption
- [ ] VAWC / domestic: force private visibility
- [ ] Privacy policy + registration consent
- [ ] WCAG basics on key flows

---

## Phase 10 — Testing & deployment

- [ ] Unit tests: state transitions, permissions
- [ ] Feature test: full concern → mission → close loop
- [ ] Security tests: IDOR, role escalation
- [ ] UAT scripts per role
- [ ] Staging + production deploy docs
- [ ] CI: Pint, `npm run build`, PHPUnit

---

## Phase 11 — Post-MVP (Phase 2)

- [ ] Heat map + hotspot ML
- [ ] Chatbot RAG (Blueprint R18)
- [ ] Civic XP, leaderboards, badges
- [ ] Full blotter desk workflow
- [ ] Duplicate merge UI
- [ ] Web push notifications
- [ ] Event attendance XP
- [ ] Multi-barangay super admin

---

## Suggested sprints

| Sprint | Focus | Outcome |
|--------|--------|---------|
| **1** | Phase 0–1 | App runs, DB seeded, teammates onboarded |
| **2** | Phase 2–3 | Auth, onboarding, post concern |
| **3** | Phase 4–5 | AI pipeline + admin report queue |
| **4** | Phase 5–6 | Missions end-to-end |
| **5** | Phase 7–8 | Notifications + map dashboard |
| **6** | Phase 9–10 | Hardening, tests, deploy |

---

## How to claim work

1. Pick an unchecked task in the phase your team owns.
2. Create a branch: `feature/phase3-concern-form` (example).
3. Mark the task `[-]` in this file while in progress.
4. Mark `[x]` when merged to `main`.
5. Link the PR in your commit or team chat.

See [TEAM_GUIDE.md](./TEAM_GUIDE.md) for environment setup and conventions.
