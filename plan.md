# Campus Rides Web — React migration plan

**Purpose:** Replace the Angular frontend with React while preserving behavior, tracked **atomically** (one small deliverable at a time). Update checkboxes and the progress log as we go.

**Status:** Phase 6 cutover complete — React-only workspace (`apps/web`); Angular removed from repo root.

---

## Goal

- **Framework:** Angular → **React** (TypeScript).
- **UI:** **shadcn/ui** (Radix + accessible primitives).
- **Styling:** **Tailwind CSS**.
- **Routing:** **TanStack Router** (typed routes, loaders where useful).
- **Server state / API:** **TanStack Query** (queries, mutations, cache, invalidation).
- **Package manager:** **pnpm** (workspace-friendly, efficient installs).

Optional later: SSR or static hosting strategy (current app uses Angular SSR + Express — decide when we scaffold).

---

## Current app snapshot (parity target)

| Area | Routes / notes |
|------|----------------|
| Public | `/` landing (guest), `/auth` (guest) |
| User (auth) | `/dashboard`, `/profile`, `/post-ride`, `/my-rides`, `/all-rides`, `/messages` |
| Admin | `/admin/dashboard`, `/admin/documents` |
| Guards | guest (unauthenticated only), auth, admin |
| Cross-cutting | API client, auth interceptors, error handling, WebSocket messages, shared components (sidebar, location selector), environments |

---

## Phase 0 — Tooling & repository

| # | Task | Done |
|---|------|------|
| 0.1 | Add **pnpm** (`packageManager` in root `package.json`, `pnpm-workspace.yaml` if monorepo later) | [x] |
| 0.2 | Document Node/pnpm versions (e.g. `.nvmrc` or `engines` field) | [x] |
| 0.3 | Decide migration approach: **greenfield folder** (`apps/web` or `frontend/`) vs in-place swap; document in this file | [x] |

---

## Phase 1 — React app scaffold

| # | Task | Done |
|---|------|------|
| 1.1 | Create **Vite + React + TypeScript** app (or agreed scaffold) | [x] |
| 1.2 | Install and configure **Tailwind CSS** | [x] |
| 1.3 | Initialize **shadcn/ui** (path aliases, `components.json`, base styles) | [x] |
| 1.4 | Install **TanStack Router** + devtools; add root route tree and a health `/` page | [x] |
| 1.5 | Install **TanStack Query** + `QueryClientProvider`; devtools in dev | [x] |
| 1.6 | Shared **API layer**: base URL from env, fetch/axios wrapper aligned with existing `services/api` behavior | [x] |
| 1.7 | TypeScript strictness aligned with repo standards; ESLint/Prettier as needed | [x] |

---

## Phase 2 — App shell & layout

| # | Task | Done |
|---|------|------|
| 2.1 | Root layout (header/sidebar shell) — **React port of sidebar** | [x] |
| 2.2 | Theme (light/dark optional) via Tailwind + shadcn tokens | [x] |
| 2.3 | **404** and global error boundary | [x] |

---

## Phase 3 — Auth & route guards

| # | Task | Done |
|---|------|------|
| 3.1 | Auth state (token/session) — port `auth.service` + storage/cookies as today | [x] |
| 3.2 | TanStack Router **beforeLoad** / context for **guest**, **auth**, **admin** route segments | [x] |
| 3.3 | Redirect rules matching current guards (logged-in vs guest vs admin) | [x] |

---

## Phase 4 — Feature pages (user)

Migrate in an order that respects dependencies (auth → profile → rides → messaging).

| # | Feature | Route | Done |
|---|---------|-------|------|
| 4.1 | Landing | `/` | [x] |
| 4.2 | Auth (login/register flows) | `/auth` | [x] |
| 4.3 | Dashboard | `/dashboard` | [x] |
| 4.4 | Profile (+ documents upload if applicable) | `/profile` | [x] |
| 4.5 | Post ride | `/post-ride` | [x] |
| 4.6 | My rides | `/my-rides` | [x] |
| 4.7 | All rides | `/all-rides` | [x] |
| 4.8 | Messages (+ WebSocket parity) | `/messages` | [x] |

Each row: port UI with shadcn, wire **TanStack Query** to existing API modules (one endpoint group at a time), match validation/error UX.

---

## Phase 5 — Admin

| # | Task | Done |
|---|------|------|
| 5.1 | Admin dashboard | `/admin/dashboard` | [x] |
| 5.2 | Admin documents (verify/reject flows) | `/admin/documents` | [x] |

---

## Phase 6 — Cutover & cleanup

| # | Task | Done |
|---|------|------|
| 6.1 | E2E or critical-path manual test checklist (auth, rides, messages, admin) | [x] |
| 6.2 | Remove Angular app, deps, and scripts; root README updated for **pnpm** + new dev/build | [x] |
| 6.3 | CI/CD (if any) updated to **pnpm** | [x] |

---

## Migration layout (Phase 0.3)

- **React app** at **`apps/web`** (Vite). Workspace packages: **`apps/*`** only; root `package.json` holds shared scripts (`pnpm dev`, `pnpm build`, …).

## Open decisions (fill in during review)

| Topic | Decision |
|-------|----------|
| SSR | Keep SSR (e.g. React + Nitro/Express) or SPA-only for v1? |
| API base URL | **`VITE_API_BASE_URL`** in `apps/web` (see `.env.example`); default matches Angular `environment.apiBaseUrl` |
| Auth storage | **`token`**, **`userId`**, **`userData`** (same keys as Angular `AuthService`); React `AuthProvider` + `useAuth()`; guards read storage in `beforeLoad` |
| WebSocket | Same URL/auth headers as Angular `websocket.service` |

---

## Progress log

_Add a row per session or merged milestone._

| Date | Milestone | Notes |
|------|-----------|-------|
| 2026-03-21 | Phase 0–1 | pnpm workspace, `apps/web` scaffold: Vite React TS, Tailwind v4, shadcn (base-nova), TanStack Router + Query, `api-client` + `env`, committed `routeTree.gen.ts` |
| 2026-03-21 | Phase 2 | App shell: `AppSidebar` + `AppShell` (Angular parity), student/admin nav, theme provider (light/dark + system), root `errorComponent` + `notFoundComponent`, stub routes for all nav targets, landing header links |
| 2026-03-21 | Phase 3 | Auth: `lib/auth/storage` + `guards` (`requireGuest` / `requireAuth` / `requireAdmin`), `AuthProvider`/`useAuth`, `beforeLoad` on routes, Angular-aligned redirects; API client uses `STORAGE_TOKEN` |
| 2026-03-21 | Phase 4.1–4.3 | Landing + Auth + Dashboard: `services/`, yup schemas, React Hook Form, TanStack Query + mutations, Sonner toasts, API error body parsing; `/auth` search `mode`; dashboard parity with rides queries + driver/rider toggle |
| 2026-03-21 | Phase 4.4 | Profile: `QUERY_KEYS`, `updateUserProfile` / `uploadUserDocument` / `fetchUserDocumentByType`, `profile-page` (summary, edit/save, academic/vehicle, verification + progress, doc upload/preview, notification toggles UI), `setAuth` + query invalidation on success |
| 2026-03-21 | Phase 4.5 | Post ride: Leaflet `LocationSelector` (map pin, Nominatim + Digipin mock, geolocation), `createRide` → `POST /rides`, yup `postRideSchema`, `post-ride-page` (route/schedule/seats/notes UI), TanStack Query invalidation + navigate to `/my-rides` |
| 2026-03-21 | Phase 4.6 | My rides: tabs (active/completed/cancelled), `fetchMyRides` per status, `deleteRide` / `completeRide` mutations, `mapBackendRideToMyRide` + `formatRideLocation` export, `dropdown-menu` for delete, Sonner toasts |
| 2026-03-21 | Phase 4.7 | All rides: `fetchRidesPaginated`, `createBooking` → `POST /bookings`, cards + pagination (parity with Angular), exclude own rides, query invalidation |
| 2026-03-21 | Phase 4.8 | Messages: REST (`/messages/conversations`, messages, send), Socket.IO (`use-messages-socket`, path `/messages/ws`), `MessagesPage` (merge/optimistic, typing, read receipts), route wired with `requireAuth` |
| 2026-03-21 | Phase 5 | Admin: `fetchAdminStats` → `GET /admin/stats`, `fetchPendingDocuments` → `GET /admin/pending`, `verifyDocumentRequest` (PATCH verify/reject), `AdminDashboardPage` (stats + quick actions), `AdminDocumentsPage` (cards, approve, reject sheet + reason), `requireAdmin` routes |
| 2026-03-21 | Phase 6 | Cutover: removed Angular (`src/`, `angular.json`, root TS configs, `sync-env`); workspace `apps/*` only; README + `docs/MANUAL_TEST_CHECKLIST.md`; GitHub Actions CI (`pnpm install --frozen-lockfile`, typecheck, lint, build); `use-messages-socket` ref + derived disconnect state; yup `.default()` for profile/post-ride; `NotificationPref` typing; ESLint override for socket setState in effect |

---

## How we work

1. Review and adjust phases above (especially Phase 0.3 and Open decisions).
2. Implement **one checkbox** (or one small group) per PR/session.
3. Update **Done** columns and **Progress log** when something is finished.
