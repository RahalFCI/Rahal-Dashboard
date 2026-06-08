# Rahal Dashboard — Onboarding Guide

## Overview

Rahal Dashboard is a React + TypeScript admin/vendor web app backed by a .NET REST API. Two roles exist:

| Role | Entry point after login |
|------|------------------------|
| `Admin` | `/admin/users` |
| `Vendor` | `/vendor/profile` |

`Explorer` is a backend role but has no dashboard access — the route guards block it.

---

## Prerequisites

- Node.js 18+
- npm 9+
- The Rahal backend running (default: `http://localhost:7145`)

---

## First-time Setup

```bash
npm install
cp .env.example .env   # edit if your backend runs on a different port
npm run dev
```

The only required env var is `VITE_API_BASE_URL`. It defaults to `http://localhost:7145/api` if omitted.

---

## Project Structure

```
src/
├── app/
│   ├── router.tsx          # All routes and role guards
│   └── route-guards.tsx    # RequireAuth component
├── config/
│   └── env.ts              # Typed env var access
├── features/
│   ├── auth/               # Login, recovery pages, JWT store
│   ├── users/              # Explorer/vendor/admin CRUD (admin only)
│   ├── vendors/            # Vendor profile and places (vendor + admin)
│   └── places/             # Places and categories (admin only)
└── shared/
    ├── api/
    │   ├── client.ts       # Axios instance + interceptors
    │   ├── errors.ts       # Error codes, ApiError, ApiValidationError
    │   ├── types.ts        # ApiResponse<T>, PagedResult<T>, TokenDto
    │   └── queryClient.ts  # TanStack Query config
    ├── components/         # Reusable UI primitives (shadcn-style)
    ├── layout/             # AppShell (sidebar + outlet)
    ├── lib/utils.ts        # cn() utility for Tailwind class merging
    └── theme/tokens.ts     # Design token aliases
```

Each feature folder follows the same internal shape:

```
features/<name>/
├── api/          # Raw API calls (no React)
├── components/   # Dialogs, tables, forms for this feature
├── pages/        # Route-level components
├── schemas.ts    # Zod validation schemas
└── types.ts      # TypeScript interfaces matching backend DTOs
```

---

## Authentication Flow

### Login

1. User submits credentials on `LoginPage`.
2. `authApi.login()` posts to `POST /User/login`.
3. On success, `useAuthStore.setSession()` persists tokens + expiry to `localStorage` under key `rahal.dashboard.session`.
4. The JWT is parsed with `parseJwtUser()` to extract `{ id, email, role }` — this is what `RequireAuth` reads.

### Session restore

`RequireAuth` calls `hydrate()` on first render. `hydrate()` reads `localStorage`, replays the session into Zustand, and sets `hasHydrated = true`. Until hydration completes the guard renders a "Restoring session…" placeholder to avoid a flash-redirect to `/login`.

### Token refresh

The Axios response interceptor in `client.ts` catches `401` responses and calls `POST /auth/generate` with the stored refresh token. Concurrent requests that 401 share a single refresh promise (`refreshPromise`) to avoid duplicate refresh calls. If the refresh fails, `clearSession()` is called and the user is redirected to login.

---

## API Client

All API calls go through one of two helpers in `src/shared/api/client.ts`:

| Helper | Use when |
|--------|----------|
| `apiClient<T>(config)` | Response has a JSON body (`ApiResponse<T>`) |
| `apiClientNoContent(config)` | Response is `204 No Content` |

The backend wraps all responses in:

```ts
interface ApiResponse<T> {
  data?: T;
  isSuccess: boolean;
  errorCode?: number | string;
}
```

`apiClient` unwraps `data` for you and throws an `ApiError` otherwise.

### Error handling

Errors are normalised to typed `ErrorCode` values (`UNAUTHORIZED`, `NOT_FOUND`, `VALIDATION_FAILED`, etc.) in `src/shared/api/errors.ts`. Each code also carries a `tier`:

| Tier | Meaning |
|------|---------|
| `silent` | Handle quietly (e.g. redirect to login) |
| `toast` | Show a non-blocking toast notification |
| `screen` | Render a full error state |

Form submissions that fail with `ApiValidationError` carry per-field errors in `fieldErrors: { property, message }[]`.

---

## Routing and Role Guards

Routes are defined in `src/app/router.tsx`. The `RequireAuth` component wraps any route that requires authentication:

```tsx
<RequireAuth roles={['Admin']}>
  <SomePage />
</RequireAuth>
```

- If not logged in → redirect to `/login`.
- If logged in but wrong role → redirect to that role's home page.

All unauthenticated paths (`/login`, `/forgot-password`, etc.) are outside the guarded subtree.

---

## Feature Walkthroughs

### User Management (`/admin/users`, `/admin/vendors`)

- Admins can list, edit, change passwords, soft-delete, and restore explorer/vendor/admin accounts.
- The API layer lives in `src/features/users/api/usersApi.ts`.
- `listUsers()` hits different endpoints depending on whether deleted records are included (see `resolveUserListUrl`).
- The role field from the backend may arrive as a numeric enum (`0/1/2`) or as a string (`"Explorer"/"Vendor"/"Admin"`); `normalizeRole()` handles both.
- Hard delete is intentionally absent — the backend restricts permanent deletion to self-only anyway.

### Vendor Profiles (`/admin/vendors`, `/vendor/profile`)

- Vendor profiles are separate from user accounts. A vendor user has both a `User` record and a `VendorProfile` record.
- `vendorProfileApi.ts` handles CRUD for profiles, including profile-picture upload (multipart) and approval.
- Profile updates send multipart form data (the backend reads from the DTO, not JSON).
- Working hours are serialised as `WorkingHours[Monday]=09:00-18:00` etc.

### Places (`/admin/places`, `/admin/categories`)

- Places belong to categories. Create/edit a category first before assigning it to a place.
- Photos are managed separately via `/placephoto` — upload sends multipart, delete passes the photo URL as a query param.
- `src/features/places/api/placesApi.ts` covers all three sub-resources.

### Vendor Places (`/vendor/places`, `/vendor/places/:placeId`)

- A vendor sees only their own places.
- The detail page is at `/vendor/places/:placeId`.
- Place data is fetched via the same `placesApi` endpoints as admin, but the vendor session constrains what the backend returns.

---

## Adding a New Feature

1. Create `src/features/<name>/` with `api/`, `components/`, `pages/`, `schemas.ts`, `types.ts`.
2. Define DTOs in `types.ts` matching the backend contract.
3. Write Zod schemas in `schemas.ts` for any forms.
4. Add API functions in `api/<name>Api.ts` using `apiClient` / `apiClientNoContent`.
5. Add the route(s) to `src/app/router.tsx` wrapped in `<RequireAuth roles={[...]}>`.
6. Add navigation links to `src/shared/layout/AppShell.tsx`.

---

## Testing

```bash
npm run test         # run once
npm run test:watch   # watch mode
```

Tests use Vitest + Testing Library. Test files sit next to the code they test (`*.test.ts` / `*.test.tsx`). The global setup is in `src/test/setup.ts`.

Coverage exists for:
- `src/shared/api/client.test.ts` — interceptor and error-unwrapping logic
- `src/features/auth/store/authStore.test.ts` — session hydration and persistence
- `src/features/auth/api/authApi.test.ts` — login/logout/refresh calls
- `src/features/users/api/usersApi.test.ts` — user CRUD
- `src/features/vendors/api/vendorProfileApi.test.ts` — vendor profile calls
- `src/features/places/schemas.test.ts` — Zod schema validation

**No end-to-end or browser tests have been run yet against a live backend.**

---

## Known Backend Quirks

These are documented in `DASHBOARD_NOTES.md` and worth keeping in mind:

- `SearchController.SearchPlaces` currently calls the user search service instead of the places service — search may return wrong results.
- `DELETE /api/{role}/permanent/{id}` only works when `id` matches the currently authenticated user — permanent deletion of other users will fail.
- User update endpoints include `{id}` in the URL but the service also reads `Id` from the multipart body. The dashboard submits both to satisfy the backend DTO.
