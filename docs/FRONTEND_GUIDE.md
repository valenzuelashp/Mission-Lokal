# Mission-Lokal — Frontend Guide

Guide for frontend developers. **Figma is visual reference only** until updated — follow this doc and [BLUEPRINT.md](./BLUEPRINT.md) §7 for screens and flows.

**Figma (reference):** [BUSINESS-INTELLIGENCE design file](https://www.figma.com/design/Ed9VhwaC4PIF0VIiJnbyoR/BUSINESS-INTELLIGENCE?node-id=0-1&m=dev)

---

## Design direction (from Figma + blueprint)

| Pattern | How we apply it |
|---------|------------------|
| Dashboard / BI cards | `StatCard`, concern cards, library cards |
| Teal primary accent | `--primary: 175 84% 32%` in `app.css` |
| Mobile-first | Bottom nav on phone, top tabs on desktop |
| Data-dense lists | Feed, library grid, profile stats |
| Status indicators | `Badge`, `StatusTimeline` |

When Figma and blueprint disagree → **blueprint wins**.

---

## Your file map

```
resources/js/
  Components/
    ui/           ← shadcn-style primitives (Button, Card, Input…)
    shared/       ← PageHeader, StatCard, MobileBottomNav
    resident/     ← ConcernCard, StatusTimeline
    maps/         ← MapView, MapPinPicker
  Hooks/
    usePageProps.ts   ← auth, flash
    useActivePath.ts  ← active nav state
  Layouts/
    ResidentLayout.tsx
  Pages/
    Resident/     ← your main focus for now
  Types/
    index.ts      ← shared TypeScript types
```

---

## Resident screens — status

| # | Screen | Route | File | Status |
|---|--------|-------|------|--------|
| R8 | Feed | `/feed` | `Pages/Resident/Feed.tsx` | Done (demo data) |
| R9 | Post concern | `/concerns/new` | `Pages/Resident/Concerns/New.tsx` | Done (UI + stub submit) |
| R10 | Concern detail | `/concerns/:id` | `Pages/Resident/Concerns/Show.tsx` | Done (demo data) |
| R11 | Library | `/library` | `Pages/Resident/Library.tsx` | Done (demo data) |
| R12 | Profile | `/profile` | `Pages/Resident/Profile.tsx` | Done (uses auth user) |
| R13 | Edit profile | `/profile/edit` | `Pages/Resident/ProfileEdit.tsx` | Stub |
| R14 | Security | `/profile/security` | `Pages/Resident/Security.tsx` | Stub |
| R15–16 | Blotter | `/blotter/new` | `Pages/Resident/Blotter/*` | Stub |
| R17 | Announcements | `/announcements` | `Pages/Resident/Announcements.tsx` | Stub |

---

## How to build a new screen

1. **Add types** in `Types/index.ts` for page props
2. **Create page** in `Pages/Resident/YourScreen.tsx`
3. **Wrap** with `ResidentLayout`
4. **Reuse** `PageHeader`, `Card`, `Button`, `StatCard`
5. **Backend teammate** passes props via `Inertia::render()` in a controller
6. **Forms** use `useForm` from `@inertiajs/react`

### Example page skeleton

```tsx
import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/shared/PageHeader';
import ResidentLayout from '@/Layouts/ResidentLayout';

export default function MyScreen() {
    return (
        <ResidentLayout>
            <Head title="My Screen" />
            <PageHeader title="Title" description="Subtitle" />
            {/* content */}
        </ResidentLayout>
    );
}
```

---

## Components to reuse

| Component | Use for |
|-----------|---------|
| `PageHeader` | Title + description + action button |
| `StatCard` | KPI / summary tiles (like Figma dashboard widgets) |
| `ConcernCard` | Feed list items |
| `StatusTimeline` | Concern / mission progress |
| `MapPinPicker` | Post concern location |
| `MapView` | Read-only map display |
| `EmptyState` | No data yet |
| `MobileBottomNav` | Auto-included in ResidentLayout |

---

## Your next tasks (recommended order)

1. **Announcements** (`Announcements.tsx`) — list + detail cards
2. **Blotter type select + form** — two-card picker, then form layout
3. **Profile edit + security** — form pages with validation UI
4. **Feed vote button** — wire when backend adds `POST /concerns/:id/vote`
5. **Flash toasts** — global success/error from `flash` prop

---

## Syncing with Figma later

When designs are updated:

1. Match **screen names** to Blueprint §7 (R8, R9, …)
2. Pull **colors/spacing** into `app.css` CSS variables
3. Don't rename routes — update components in place
4. Export icons from Figma → use `lucide-react` equivalents where possible

---

## Run & test

```bash
npm run dev          # terminal 1 (with php artisan serve)
npm run build        # check TypeScript before push
```

Login: `RES001` / `password` → explore Feed, Post concern, Library, Profile.

See [TEAM_GUIDE.md](./TEAM_GUIDE.md) for full environment setup.
