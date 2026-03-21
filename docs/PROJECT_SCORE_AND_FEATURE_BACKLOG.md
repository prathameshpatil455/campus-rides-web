# Project score & feature backlog

This document scores **what the project is trying to achieve** and lists **features that can or should be added** next. It complements [`plan.md`](../plan.md) (migration complete) and [`FEATURES.md`](../FEATURES.md) (original Angular wishlist — partly outdated).

---

## What the project is trying to achieve

| Goal | Description |
|------|-------------|
| **Product** | **Campus ride sharing** for students: post rides, discover and book seats, manage trips, verify identity, and chat between users — backed by **`campus-rides-service`** (REST + JWT). |
| **Technical** | **Modern SPA**: Vite + React + TypeScript, Tailwind + shadcn-style UI, TanStack Router & Query, env-driven API base URL, Socket.IO for messaging. |
| **Process** | **Replace Angular** with a maintainable frontend, **pnpm** workspace, **CI** (typecheck, lint, build), manual regression checklist. |

---

## Score (qualitative, 1–10)

Scores reflect **intent vs delivery**, not personal judgment.

| Dimension | Score | Notes |
|-----------|------:|--------|
| **Mission clarity** | **8** | Purpose and API contract are clear; student + admin + messaging are well scoped. |
| **Core user journeys** | **8** | Auth, profile, post/browse/book rides, my rides, messages, admin stats + document review are implemented in `apps/web`. |
| **Technical quality** | **8** | Strict TS, layered services, guards, Query cache, Vite build, GitHub Actions — solid baseline. |
| **Parity with aspirational spec** | **6** | [`FEATURES.md`](../FEATURES.md) and [`Roadmap.md`](../Roadmap.md) still list many items not built (filters, dedicated ride detail, admin user/ride CRUD UI, Firebase, etc.). |
| **Docs & discoverability** | **6** | `README` + `plan.md` are current; `FEATURES.md` / `Roadmap.md` still read Angular-era; worth consolidating. |
| **Hardening & scale** | **6** | Manual checklist only (no E2E); SSR undecided; no feature flags / observability in repo. |
| **Overall (weighted)** | **~7.5** | **Strong MVP / migration success**; room to grow toward full product spec and production polish. |

**One-line summary:** The project **achieves its primary migration and MVP ride-sharing goals**; the **remaining gap** is mostly **product depth** (search/filters, admin tooling, bookings UX, ratings, payments) and **operational maturity** (E2E, hosting runbooks, doc refresh).

---

## Features that can or should be added

Below: **should** = high value / common next step; **can** = optional or backend-dependent.

### Admin & operations

| Feature | Priority | Notes |
|---------|----------|--------|
| **Admin: manage users** | Should | API exists (`/admin/users`); UI was deferred — list, search, edit role/status, delete. |
| **Admin: manage rides** | Should | Same pattern as users (`/admin/rides`); filters, edit/delete ride. |
| **Admin: activity / audit log** | Can | If API exposes events; dashboard “recent activity” from [`FEATURES.md`](../FEATURES.md). |
| **Feature flags / env-driven toggles** | Can | For staged rollouts (e.g. payments, maps provider). |

### Rides & discovery

| Feature | Priority | Notes |
|---------|----------|--------|
| **Ride filters & sort** | Should | Origin/destination/date/price/seats — [`FEATURES.md`](../FEATURES.md) § Ride filter; needs API support if not present. |
| **Dedicated ride detail route** | Should | Full-screen ride view: map, driver snippet, share link — today booking may be card-only. |
| **Edit ride (driver)** | Can | `PUT /rides/:id` in roadmap; implement if backend supports. |
| **Price per seat (UI)** | Can | Post-ride / cards if product requires paid seats. |

### Bookings

| Feature | Priority | Notes |
|---------|----------|--------|
| **“My bookings” hub** | Should | Distinct from “my rides as driver”: list upcoming/past bookings, cancel if API allows. |
| **Booking detail & cancel** | Should | Confirmation, status, link to ride/thread. |
| **Seat count & total price in booking flow** | Can | Align with backend pricing rules. |

### Profile & trust

| Feature | Priority | Notes |
|---------|----------|--------|
| **Ride history unified** | Can | “Past rides as driver + passenger” if API provides `GET /users/me/rides` or equivalent. |
| **Ratings & reviews** | Can | Post-ride rating; display on profile/cards — needs API + UX policy. |
| **Phone / verification UI** | Can | If backend adds fields beyond current profile. |

### Messaging & real time

| Feature | Priority | Notes |
|---------|----------|--------|
| **Push / browser notifications** | Can | Service worker + permission; complements in-app messaging. |
| **Connection status / retry UX** | Can | Clearer offline/reconnect banner for Socket.IO. |

### Auth & security

| Feature | Priority | Notes |
|---------|----------|--------|
| **Token refresh** | Should | If backend issues refresh tokens — avoids surprise logouts. |
| **Remember me / session length** | Can | UX preference; storage policy. |
| **Global 401 handling** | Partial | Ensure single place invalidates auth and redirects (interceptor pattern vs current `api-client`). |

### UI / UX / a11y

| Feature | Priority | Notes |
|---------|----------|--------|
| **Skeleton loaders** | Can | Replace spinners on heavy routes. |
| **Keyboard & screen-reader pass** | Should | Focus order, labels, live regions for toasts. |
| **Empty states & onboarding** | Can | First-time user tips for post-ride and booking. |

### Quality & delivery

| Feature | Priority | Notes |
|---------|----------|--------|
| **E2E tests (Playwright / Cypress)** | Should | Critical paths from [`MANUAL_TEST_CHECKLIST.md`](./MANUAL_TEST_CHECKLIST.md). |
| **Update `FEATURES.md` / `Roadmap.md`** | Should | Mark Angular references as historical or rewrite for React + current API. |
| **SSR or SSG decision** | Can | Document in `plan.md` open decisions — SEO vs simplicity. |
| **Deployment guide** | Should | Static host (e.g. Firebase, Cloudflare, S3+CDN) + env vars + API CORS. |
| **PWA (installable, offline shell)** | Can | Nice for mobile students; scope carefully. |

### Maps & location

| Feature | Priority | Notes |
|---------|----------|--------|
| **Google Maps or Mapbox route preview** | Can | Optional upgrade from Leaflet/Nominatim — cost & keys. |
| **Saved places / campus presets** | Can | Faster posting for repeat routes. |

### Payments (large scope)

| Feature | Priority | Notes |
|---------|----------|--------|
| **In-app payments** | Can | Only if product + legal + backend settle on flow; often last milestone. |

---

## Suggested order (opinionated)

1. **Docs cleanup** — Align `FEATURES.md` / `Roadmap.md` with React reality.  
2. **Admin users & rides** — Unblock admins who relied on old Angular routes.  
3. **My bookings + cancel + ride detail** — Completes passenger story.  
4. **Ride search/filters** — If API ready.  
5. **E2E on critical paths** — Protect regressions.  
6. **Ratings / payments / PWA** — As product priorities dictate.

---

## References

- [`plan.md`](../plan.md) — Migration phases (complete).  
- [`docs/MANUAL_TEST_CHECKLIST.md`](./MANUAL_TEST_CHECKLIST.md) — Manual QA.  
- [`FEATURES.md`](../FEATURES.md) — Legacy checklist (many items still valid as ideas).  
- [`MESSAGING_API.md`](../MESSAGING_API.md) — Messaging contract.
