# Mission-Lokal — System Blueprint

**AI-Based Barangay Residents' Concern and Response Management System**

Version: 1.0  
Status: Complete blueprint (requirements → architecture → implementation guide)

---

## 1. Executive Summary

Mission-Lokal is a **Progressive Web App (PWA)** for a single barangay (multi-tenant ready) where:

1. **Verified residents** report community concerns.
2. **AI** classifies, routes (public vs private), ranks severity, detects duplicates/hotspots, and prescribes response steps.
3. **Administrative staff** confirm or override AI, assign missions, manage blotters, verifications, and content.
4. **Personnel** execute assigned missions, submit proof, and receive SMS for nearby work.
5. **Residents** see outcomes via public feed summaries or private case updates.

### Core System Loop

```
Resident reports
  → AI categorizes & routes
  → Staff reviews
  → Mission created & assigned
  → Personnel acts
  → Proof submitted
  → Staff closes
  → Resident sees outcome (public summary or private update)
```

---

## 2. Stakeholders & Roles

| Role | Access scope | Primary actions |
| --- | --- | --- |
| **Resident** | Own data, public feed, library, announcements | Report, vote, blotter, chatbot, profile |
| **Personnel** | Assigned missions only | Acknowledge, update status, upload proof |
| **Administrative Staff** | Full barangay operations | Verify users, confirm AI, assign missions, blotters, content, analytics |
| **System (AI)** | Backend service | Classify, route, severity, duplicates, hotspots, prescriptive steps, scheduling suggestions |
| **Super Admin** *(optional, platform-level)* | Multi-barangay | Onboard barangays, global config |

### Permission Matrix (summary)

| Resource | Resident | Personnel | Admin Staff |
| --- | --- | --- | --- |
| Public concerns | Create, read, vote | Read (if linked to mission) | Full |
| Private concerns | Own only | If assigned | Full |
| Missions | — | Assigned only | Full |
| Blotters | Own submissions | — | Full |
| Verification queue | Submit | — | Approve/reject |
| Dashboard / heat map | — | — | Full |
| Audit log | — | — | Read |
| Library / announcements | Read | Read | CRUD |
| Resident list / XP | Own profile | — | Full |

---

## 3. Platform & Technology Stack

### 3.1 Client (PWA)

| Layer | Recommendation | Rationale |
| --- | --- | --- |
| Framework | **React** or **Next.js** | Component model, SSR optional for admin |
| PWA | **Workbox** + web manifest | Offline library, installable, push |
| State | React Query + Context/Zustand | Server cache + light client state |
| Maps | **Leaflet** or **Mapbox GL** | Pins, heat layer, clustering |
| UI | Tailwind + shadcn/ui | Fast, accessible, mobile-first |
| Forms | React Hook Form + Zod | Validation aligned with API |

### 3.2 Backend

| Layer | Recommendation |
| --- | --- |
| API | **Node.js (NestJS)** or **Python (FastAPI)** |
| Auth | JWT + refresh tokens; bcrypt/argon2 passwords |
| Real-time | WebSockets or SSE for mission board / notifications |
| Queue | **Redis + BullMQ** (or Celery) for AI jobs, SMS, reminders |
| Storage | **S3-compatible** (IDs, proof photos) |
| DB | **PostgreSQL** + PostGIS for geospatial |
| Search | PostgreSQL full-text or Elasticsearch for duplicate detection |

### 3.3 AI Services

| Function | Approach |
| --- | --- |
| Categorization & public/private routing | Fine-tuned classifier or LLM with structured JSON output |
| Severity ranking | Multi-class model (Low / Medium / High / Critical) + rules |
| Duplicate detection | Embedding similarity + geo radius (e.g. 100–300 m) + time window |
| Hotspot prediction | Spatial clustering (DBSCAN / hex grid) on historical reports |
| Prescriptive measures | LLM prompt with category template library |
| Due date suggestion | Rules + workload + severity; staff confirms |
| Chatbot FAQs | RAG over barangay library + contacts + office hours |

### 3.4 Integrations

| Service | Use |
| --- | --- |
| **SMS gateway** | Personnel assignment, OTP optional |
| **Email** | Forgot password OTP, verification notices |
| **Push notifications** | PWA web push for residents & personnel |
| **Geocoding** | Reverse geocode pins; barangay boundary validation |

---

## 4. Domain Model (Entities)

### 4.1 Core entities

```
Barangay
├── preloaded_residents (imported roster)
├── users (residents, personnel, admin)
├── concerns (reports)
│   ├── concern_votes
│   ├── concern_media
│   └── ai_analysis (category, severity, visibility, duplicate_links)
├── missions
│   ├── mission_assignments
│   ├── mission_checklist (prescriptive steps)
│   ├── mission_status_history
│   └── mission_proof (photos, notes)
├── blotters
├── announcements
├── library_items (manuals, contacts, evacuation centers)
├── civic_xp_events
├── badges & user_badges
├── notifications
└── audit_logs
```

### 4.2 Key tables (logical schema)

#### `users`

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| barangay_id | UUID | FK |
| account_id | string | Barangay-issued login ID |
| role | enum | resident, personnel, admin |
| email, mobile | string | |
| password_hash | string | After verification |
| verification_status | enum | pending, in_progress, approved, rejected |
| profile_edit_status | enum | none, pending_approval |
| civic_xp | int | Default 0 |
| is_active | bool | |

#### `resident_profiles`

| Field | Type | Notes |
| --- | --- | --- |
| user_id | UUID | FK |
| full_name, birthday, address | | Preloaded; resident confirms |
| government_id_url | string | Uploaded ID image |
| digital_id_code | string | QR after approval |
| rejection_reason | text | |

#### `concerns`

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | |
| reporter_id | UUID | FK users |
| title, description | text | |
| category | enum | See §12 |
| subcategory | string | |
| visibility | enum | public, private |
| severity | enum | low, medium, high, critical |
| severity_confirmed | bool | Staff must confirm before auto-SMS |
| status | enum | See §5.1 |
| location | geography(POINT) | PostGIS |
| address_text | string | |
| is_blotter_candidate | bool | AI or user flagged |
| duplicate_of_id | UUID | Nullable; staff merge |
| ai_processed_at | timestamp | |

#### `missions`

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | |
| concern_id | UUID | FK |
| assigned_to | UUID | personnel user_id |
| prescriptive_steps | jsonb | AI-generated checklist |
| due_date | date | AI-suggested; staff confirms |
| estimated_duration_hours | int | |
| status | enum | See §5.2 |
| acknowledged_at | timestamp | |
| completed_at | timestamp | |
| verified_at | timestamp | Staff approved proof |
| closed_summary | text | Shown to resident |

#### `blotters`

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | |
| concern_id | UUID | Nullable if standalone |
| type | enum | two_party, one_party |
| complainant_id | UUID | |
| respondent_name | string | Two-party |
| narrative | text | |
| ticket_number | string | Issued on admin approval |
| status | enum | filed, mediated, resolved, archived |
| hearing_scheduled_at | timestamp | Manual barangay scheduling |

#### `audit_logs`

| Field | Type |
| --- | --- |
| actor_id, action, entity_type, entity_id, metadata, ip, created_at | |

---

## 5. State Machines

### 5.1 Concern / Report status

```
                    ┌─────────────┐
                    │  Submitted  │
                    └──────┬──────┘
                           │ AI pipeline
                           ▼
                    ┌─────────────┐
                    │ AI Processed│ (categorized, severity suggested)
                    └──────┬──────┘
                           │ enters staff queue
                           ▼
                    ┌─────────────┐
         ┌─────────│ Under Review│─────────┐
         │         └──────┬──────┘         │
         │ reject/spam    │ confirm        │
         ▼                ▼                │
  ┌─────────────┐  ┌─────────────┐        │
  │ Rejected /  │  │   Active    │◄───────┘ (mission assigned)
  │    Spam     │  └──────┬──────┘
  └─────────────┘         │ mission verified + closed
                          ▼
                   ┌─────────────┐
                   │  Resolved   │ → notify resident
                   └──────┬──────┘
                          │ staff publishes summary
                          ▼
                   ┌─────────────┐
                   │   Closed    │
                   └─────────────┘
```

**Resident notifications:**

| Trigger | Message (example) |
| --- | --- |
| Under Review → Active | "Your concern is being addressed." |
| Resolved / Closed | "Your concern has been resolved." + summary link |
| Rejected | Reason provided |

### 5.2 Mission status (personnel)

```
Assigned
  → Acknowledged (personnel opened SMS/app)
  → In Progress
  → Completed (proof uploaded)
  → Verified (staff approved)

Parallel flags:
  - Overdue (AI flag if past due_date)
  - Escalated (no acknowledge within X hours → notify admin)
```

**Escalation rule (configurable)**

- `ACK_TIMEOUT_HOURS` default: **4**
- If `Assigned` and no `acknowledged_at` within X hours → notify admin + optional reassignment prompt

### 5.3 Account verification status

```
[First login]
  → Details Confirmation (confirm preloaded name, birthday)
  → ID Verification (upload government ID)
  → Verification In Progress
       ├─ Approved → Password Creation → Login success
       └─ Rejected → show reason → Resubmission loop
```

### 5.4 Blotter status

```
Filed → Mediated → Resolved → Archived
```

**Two-party flow:** Online form → admin approval → ticket number → resident presents at desk → hearing scheduled offline → status updates in system.

**One-party flow:** Log → assign search/investigation mission → link public announcement if appeal needed.

### 5.5 Profile edit approval

```
Edit submitted → Pending Approval → Approved (apply) | Rejected (revert + reason)
```

---

## 6. AI Pipeline (Detailed)

### 6.1 Concern submission flow

```
1. Resident submits concern (text, optional photos, map pin)
2. Async job: AI Concern Processor
   a. Language detect (Filipino/English)
   b. Category + subcategory (from template §12)
   c. Public vs private routing
      - Sensitive keywords, PII, domestic/VAWC → private
      - Infrastructure/sanitation public safety → public default
   d. Severity score (1–4) + confidence
   e. Duplicate check (embedding + geo + 72h window)
   f. Prescriptive steps (category playbook)
   g. Suggested due_date + duration
3. Persist ai_analysis; set status = AI Processed
4. Enqueue staff notification (Report Queue)
```

### 6.2 Public vs private decision tree

```
Is concern sensitive/confidential? (AI + keyword rules)
  YES → visibility = private
        Prompt resident: "File a Blotter?"
          YES → redirect to blotter form (pre-filled from post)
          NO  → save as private concern only
  NO  → visibility = public
        Map pin on public feed
        Severity shown after staff confirmation
```

### 6.3 Staff confirmation gate

Before **auto-SMS to nearby personnel**:

- Staff must confirm: category, severity, visibility, routing
- Staff may: merge duplicate, override AI, reject as spam, create mission

### 6.4 Prescriptive measures (examples)

| Category | AI-generated checklist (stored on mission) |
| --- | --- |
| Clogged drainage | Inspect inlet → clear debris → photo before/after → escalate to engineering if structural |
| Noise complaint | Visit site evening → warn violator → document if possible → follow-up if repeat |
| Street light | Verify pole ID → check breaker → photo → order parts if needed |
| Illegal dumping | Document location → identify waste type → coordinate collection → post warning |

Playbooks live in `category_playbooks` table; AI selects and personalizes.

### 6.5 Hotspot prediction

- Nightly job: cluster `concerns` by location (30/90 day windows)
- Output: `hotspots` table (center, radius, report_count, top_categories)
- Dashboard heat map layer; drill-down to full map

### 6.6 Duplicate detection

- Flag: "Similar report nearby" with link to candidate
- Staff actions: **Merge** (keep primary, link secondary) | **Link** | **Dismiss**

---

## 7. Screen Inventory & User Flows

### 7.1 Resident screens

| # | Screen | Route (example) | Key elements |
| --- | --- | --- | --- |
| R1 | Login | `/login` | account_id, password |
| R2 | Details Confirmation | `/onboarding/confirm` | name, birthday confirm |
| R3 | ID Verification | `/onboarding/id` | upload ID |
| R4 | Verification In Progress | `/onboarding/pending` | status |
| R5 | Verification Result | `/onboarding/result` | approved/rejected |
| R6 | Password Creation | `/onboarding/password` | new password |
| R7 | Forgot Password | `/forgot-password` | email → OTP → reset |
| R8 | Newsfeed | `/feed` | public concerns, vote, post CTA |
| R9 | Post Concern | `/concerns/new` | form, map pin, AI routing UI |
| R10 | Concern Detail (own) | `/concerns/:id` | status timeline, private updates |
| R11 | Library | `/library` | manuals, evacuation, contacts |
| R12 | Profile | `/profile` | info, digital ID, analytics |
| R13 | Edit Profile | `/profile/edit` | pending approval badge |
| R14 | Security | `/profile/security` | change password |
| R15 | Blotter Type Select | `/blotter/new` | type picker |
| R16 | Blotter Form | `/blotter/new/:type` | pre-filled or empty |
| R17 | Announcements | `/announcements` | list + detail |
| R18 | Chatbot | floating widget | FAQs |

**Sidebar (resident):** Feed, Blotter, Library, Announcements, Profile, Logout

### 7.2 Personnel screens

| # | Screen | Route | Key elements |
| --- | --- | --- | --- |
| P1 | Login | `/personnel/login` | |
| P2 | My Missions | `/personnel/missions` | assigned list, filters |
| P3 | Mission Detail | `/personnel/missions/:id` | brief, map, checklist, reporter contact if private |
| P4 | Proof Upload | `/personnel/missions/:id/proof` | photos, notes |
| P5 | Notifications | `/personnel/notifications` | SMS mirror in-app |

### 7.3 Admin staff screens

| # | Screen | Route | Key elements |
| --- | --- | --- | --- |
| A1 | Dashboard | `/admin` | KPI cards, heat map preview |
| A2 | Full Map | `/admin/map` | pins, hotspots, filters |
| A3 | Report Queue | `/admin/reports` | AI suggestions, confirm/override |
| A4 | Mission Board | `/admin/missions` | kanban or table, assign/reassign |
| A5 | Verification Queue | `/admin/verifications` | approve/reject ID |
| A6 | Profile Edit Queue | `/admin/profile-edits` | |
| A7 | Residents List | `/admin/residents` | search, XP, click → full profile |
| A8 | Resident Detail | `/admin/residents/:id` | reports, badges, history |
| A9 | Blotters | `/admin/blotters` | approve, ticket, schedule |
| A10 | Announcements CRUD | `/admin/announcements` | |
| A11 | Library Management | `/admin/library` | |
| A12 | Audit Log | `/admin/audit` | filterable |
| A13 | Settings | `/admin/settings` | ACK timeout, SMS templates, categories |

---

## 8. API Design (REST outline)

Base: `/api/v1`

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/login` | account_id + password |
| POST | `/auth/forgot-password` | send OTP email |
| POST | `/auth/reset-password` | OTP + new password |
| POST | `/auth/refresh` | refresh token |

### Resident

| Method | Endpoint | Description |
| --- | --- | --- |
| GET/POST | `/concerns` | list own + public feed / create |
| GET | `/concerns/:id` | detail (visibility rules) |
| POST | `/concerns/:id/vote` | upvote/downvote |
| GET/POST | `/blotters` | |
| GET | `/library` | |
| GET | `/announcements` | |
| GET/PATCH | `/profile` | |
| POST | `/profile/id-verification` | |
| POST | `/chatbot/query` | FAQ RAG |

### Personnel

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/personnel/missions` | assigned only |
| PATCH | `/personnel/missions/:id/status` | acknowledge, in progress, complete |
| POST | `/personnel/missions/:id/proof` | upload proof |

### Admin

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/dashboard` | analytics aggregates |
| GET | `/admin/map` | geojson concerns + hotspots |
| GET/PATCH | `/admin/reports/:id` | confirm AI, merge, reject |
| POST | `/admin/missions` | create from concern |
| PATCH | `/admin/missions/:id/assign` | assign personnel |
| GET/PATCH | `/admin/verifications` | |
| CRUD | `/admin/blotters`, `/announcements`, `/library` | |
| GET | `/admin/audit-logs` | |
| GET | `/admin/residents` | |

---

## 9. Notifications

| Event | Resident | Personnel | Admin |
| --- | --- | --- | --- |
| Concern submitted | In-app | — | Queue badge |
| Mission assigned | "Being addressed" | **SMS** + push | — |
| No acknowledge X hrs | — | Reminder SMS | Alert |
| Mission overdue | — | Reminder | Dashboard flag |
| Proof uploaded | — | — | Queue |
| Concern closed | Push/email | — | — |
| Verification result | Email/push | — | — |
| Profile edit result | Push | — | — |
| Blotter ticket issued | In-app + email | — | — |

**SMS template (personnel):**

> Mission-Lokal: New assignment near [barangay/landmark]. [Category]: [short title]. Due: [date]. Open app: [link]

---

## 10. Maps & Geolocation

| Feature | Implementation |
| --- | --- |
| Report pin | Resident drops pin or GPS; validate inside barangay polygon |
| Public feed map | Show public concerns (clustered) |
| Admin heat map | Weighted by count + severity |
| Hotspots | DBSCAN/hex bins; clickable → filter reports |
| Personnel "nearby" | On assign, query personnel last known or registered zone; SMS top N within radius |

**Privacy:** Private concerns show exact pin only to assigned personnel and admin; public feed may fuzz location slightly (optional, e.g. 50 m) for domestic-adjacent categories.

---

## 11. Civic XP & Gamification

### 11.1 XP rules (configurable)

| Action | XP |
| --- | --- |
| Valid report (staff-confirmed, not spam) | +10 |
| Report resolved | +5 bonus |
| Upvote received on your public report | +2 |
| Attendance at barangay event (admin scan/confirm) | +15 |

### 11.2 Badges (examples)

| Badge | Criteria |
| --- | --- |
| Sanitation Hero | 5+ resolved sanitation reports |
| Road Safety Watcher | 5+ infrastructure reports validated |
| Pinaka Aktibo | Top 10% XP monthly |
| Early Responder | First valid report in new hotspot |

### 11.3 Leaderboard

- Barangay-wide; weekly/monthly/all-time tabs
- Admin resident list shows XP rank; resident profile shows badges

---

## 12. Category & Blotter Templates (Complete)

### 12.1 PUBLIC concerns

| Category | Subcategories |
| --- | --- |
| **Public Safety & Order** | Alarms & Scandals, Curfew violations, Disturbance (non-domestic public) |
| **Infrastructure & Utilities** | Damaged roads, Clogged drainage, Street light malfunction, Water leakage, Fallen electrical lines (public hazard) |
| **Sanitation & Environment** | Illegal dumping, Uncollected waste, Pollution control, Animal straying (public risk) |

### 12.2 PRIVATE concerns

| Category | Subcategories |
| --- | --- |
| **Public Safety & Order** | Neighborhood conflicts, Threats (non-emergency) |
| **Infrastructure & Utilities** | Illegal parking, Obstruction of public road, Jumper wires (specific address) |
| **Sanitation & Environment** | Noise complaints, Animal abuse, Nuisance smoke/odor |
| **Katarungang Pambarangay** | Domestic dispute, VAWC, Child concern, Property boundary |

### 12.3 Blotter types

| Type | Fields | Flow |
| --- | --- | --- |
| **Two-party** | Complainant, respondent name, narrative, incident date/place, witnesses optional | From post (AI pre-fill) or empty form → admin approval → ticket → desk verify → mediation |
| **One-party** | Complainant, narrative, incident details | Log → search mission → optional public appeal announcement |

**Blotter form fields (shared):**

- Complainant name (auto from profile)
- Respondent / other party name
- Incident date & time
- Location
- Statement of facts
- Relief sought
- Supporting media (optional)
- Signature acknowledgment (checkbox + timestamp)

---

## 13. Security, Privacy & Compliance

| Area | Requirement |
| --- | --- |
| Authentication | Role-based JWT; personnel/admin separate login URLs optional |
| Authorization | Row-level: residents see only own private data |
| PII | Encrypt government ID at rest; restrict access to verification admins |
| VAWC / domestic | Force private; never on public feed; minimal personnel disclosure |
| Audit | All admin actions on concerns, missions, verifications, blotters |
| Data retention | Configurable archive after N years |
| DPA (Philippines) | Consent on registration; privacy policy; purpose limitation |
| Rate limiting | Report submission, OTP, login attempts |

---

## 14. Barangay Onboarding

1. **Create barangay tenant** (name, boundary GeoJSON, contacts).
2. **Import preloaded residents** (CSV: account_id, name, birthday, address, email, mobile).
3. **Create admin accounts** and personnel roster (with mobile for SMS).
4. **Configure** categories, playbooks, ACK timeout, SMS sender ID.
5. **Seed library** (earthquake, flood, fire, typhoon, first aid, evacuation centers, emergency numbers).
6. **Train staff** on Report Queue and verification workflow.

---

## 15. Non-Functional Requirements

| NFR | Target |
| --- | --- |
| Availability | 99.5% (barangay hours critical) |
| API response | < 500 ms p95 (excl. AI async) |
| AI processing | < 60 s from submit to AI Processed |
| Mobile | Responsive; PWA install on Android/iOS |
| Offline | Library + contacts cached; queue concern draft offline |
| Accessibility | WCAG 2.1 AA where feasible |
| Language | Filipino + English UI and AI |

---

## 16. Testing Strategy

| Layer | Focus |
| --- | --- |
| Unit | State transitions, permissions, XP rules |
| Integration | AI pipeline mocks, SMS/email stubs |
| E2E | Resident report → admin confirm → personnel complete → resident notified |
| Security | IDOR on private concerns, role escalation |
| UAT | Barangay staff + sample residents |

---

## 17. Deployment Architecture

```
[Residents/Personnel/Admin PWA]
        │ HTTPS
        ▼
[Load Balancer / CDN]
        │
        ├── API Server(s)
        ├── Worker(s) — AI, SMS, hotspots, reminders
        ├── PostgreSQL + PostGIS
        ├── Redis
        ├── Object Storage (IDs, proofs)
        └── AI Provider API (LLM / embeddings)
```

**Environments:** dev → staging (sandbox SMS) → production

---

## 18. MVP vs Phase 2

### MVP (launch)

- Resident onboarding + verification
- Post concern + AI categorize/route
- Admin report queue + mission assign
- Personnel mission + proof
- Public feed + voting
- Basic dashboard + map pins
- SMS on assign
- Library + announcements
- Forgot password (email OTP)
- Audit log (core actions)

### Phase 2

- Full heat map + hotspot ML
- Chatbot RAG
- Civic XP + leaderboards + badges
- Blotter ticket desk workflow
- Duplicate merge UI
- Push notifications
- Event attendance XP
- Multi-barangay super admin

---

## 19. Open Configuration (defaults)

| Setting | Default |
| --- | --- |
| ACK_TIMEOUT_HOURS | 4 |
| DUPLICATE_GEO_RADIUS_M | 200 |
| DUPLICATE_TIME_WINDOW_H | 72 |
| AUTO_SMS_NEARBY_RADIUS_M | 1500 |
| MAX_PERSONNEL_SMS_PER_MISSION | 3 |
| CIVIC_XP_PER_VALID_REPORT | 10 |

---

## 20. Glossary

| Term | Definition |
| --- | --- |
| **Concern** | Resident-submitted report (public or private) |
| **Mission** | Operational task assigned to personnel from a concern |
| **Blotter** | Formal Katarungang Pambarangay record |
| **Playbook** | Category-specific prescriptive response steps |
| **Hotspot** | Geographic area with frequent reports |
| **Civic XP** | Gamification points for community participation |

---

## 21. Document Index (for development)

| Document | Purpose |
| --- | --- |
| This blueprint | System-wide design |
| [DATABASE.md](./DATABASE.md) | Normalized MySQL schema |
| API OpenAPI spec | Endpoint contracts |
| ERD diagram | Database |
| Wireframes | UI per §7 |
| AI prompt library | Classification + prescription |
| SMS/email templates | Notifications |
| UAT scripts | Role-based test cases |

---

*End of Mission-Lokal System Blueprint v1.0*
