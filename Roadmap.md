The roadmap **explicitly defines how `campus-rides-web` and `campus-rides-service` interact via APIs**.

---

# 🧭 OVERALL ARCHITECTURE (Context for Cursor)

```
campus-rides-web (Angular)
   └── calls REST APIs
       ↓
campus-rides-service (Node + Express)
   └── connects to MongoDB Atlas
```

- Communication via **REST APIs (JSON)**
- Auth via **JWT**
- API base URL stored in Angular environment files

# 📁 ROADMAP — `campus-rides-web` (Frontend)

## Phase 1 — Angular Setup

**Goal:** Prepare Angular app for API-driven UI.

**Tasks:**

- Create Angular project
- Setup routing & shared modules
- Create environments:

  ```
  environment.ts
  environment.prod.ts
  ```

**Add API base URL:**

```ts
export const environment = {
  apiBaseUrl: 'https://campus-rides-service.onrender.com/api',
};
```

---

## Phase 2 — Authentication UI

**Goal:** Connect to backend auth APIs.

**Components:**

- LoginComponent
- RegisterComponent

**Services:**

- AuthService

  - register()
  - login()
  - store JWT in localStorage

**API Calls To:**

- `/auth/register`
- `/auth/login`

---

## Phase 3 — Dashboard & Profile

**Goal:** Logged-in user experience.

**Components:**

- DashboardComponent
- ProfileComponent

**Features:**

- Display user details
- Fetch ride history from backend

---

## Phase 4 — Ride Listing & Search

**Goal:** Show available rides.

**Components:**

- RideListComponent
- RideCardComponent
- RideFilterComponent

**API Calls To:**

- `GET /rides`

---

## Phase 5 — Ride Creation (Drivers)

**Goal:** Post new rides.

**Components:**

- CreateRideComponent
- MyRidesComponent

**API Calls To:**

- `POST /rides`
- `PUT /rides/:id`
- `DELETE /rides/:id`

---

## Phase 6 — Booking Flow

**Goal:** Book seats.

**Components:**

- BookRideComponent
- MyBookingsComponent

**API Calls To:**

- `POST /bookings`
- `GET /bookings/my`

---

## Phase 7 — HTTP Interceptors

**Goal:** Secure API communication.

- Attach JWT to every request
- Handle 401 errors globally

---

## Phase 8 — Admin UI

**Goal:** Admin dashboard.

**Components:**

- AdminDashboardComponent
- UserManagementComponent
- RideManagementComponent

**API Calls To:**

- `/admin/users`
- `/admin/rides`

---

## Phase 9 — UI Polish & Deployment

**Goal:** Production-ready UI.

- Responsive layout
- Error handling
- Deploy to Firebase Hosting
- Configure environment.prod.ts

---

# 🔗 CONTRACT BETWEEN WEB & SERVICE (VERY IMPORTANT)

### API Contract Rules:

- JSON only
- JWT in `Authorization: Bearer <token>`
- Consistent response structure:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```
