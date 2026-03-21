# Manual test checklist (React `apps/web`)

Run against a working API (e.g. `VITE_API_BASE_URL` in `apps/web/.env`). Check off as you verify.

## Auth & guards

- [ ] **Guest landing** (`/`) — loads when logged out; links to auth work.
- [ ] **Login** (`/auth`) — valid credentials set session (`token`, `userId`, `userData`) and redirect to dashboard.
- [ ] **Register** — new account flow completes without errors (adjust for your backend rules).
- [ ] **Logged-in user** cannot open `/auth` (redirect away).
- [ ] **Unauthenticated** cannot open `/dashboard`, `/profile`, `/post-ride`, `/my-rides`, `/all-rides`, `/messages` (redirect to auth).
- [ ] **Non-admin** cannot open `/admin/dashboard` or `/admin/documents` (redirect per `requireAdmin`).

## Student flows

- [ ] **Dashboard** — loads rides summary; driver/rider toggle works.
- [ ] **Profile** — view/edit profile; document upload/preview if applicable.
- [ ] **Post ride** — create ride with map/location; success navigates or invalidates lists.
- [ ] **My rides** — tabs (active/completed/cancelled); delete/complete where applicable.
- [ ] **All rides** — list + pagination; book a ride; booking reflected in UI or after refresh.

## Messages

- [ ] **Conversations** load; select thread shows history.
- [ ] **Send message** — optimistic UI; appears for recipient after refresh or via socket.
- [ ] **Socket** — connect with token; typing/read receipts behave if backend supports them.

## Admin

- [ ] **Admin dashboard** (`/admin/dashboard`) — stats load; link to documents works.
- [ ] **Documents** (`/admin/documents`) — pending list loads; **Approve** updates list; **Reject** requires reason and succeeds.

## Cross-cutting

- [ ] **Theme** — light/dark/system toggles (if exposed in UI).
- [ ] **404** — unknown path shows not-found page.
- [ ] **Mobile** — sidebar shell usable on narrow viewport.
