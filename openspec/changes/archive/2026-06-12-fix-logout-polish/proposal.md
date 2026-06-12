## Why

Two code-level issues were surfaced during verification of the `add-refresh-and-logout` change:

1. **Session-unaware home page**: `app/page.tsx` renders a "Sign out" form unconditionally. A logged-out visitor sees the button, clicks it, loops back to `/`, and achieves nothing useful. The page needs to check the session and only render logout UI for authenticated users.

2. **Incorrect HTTP status on wrong method**: `GET /api/logout` returns 404 (Hono's fallthrough for unregistered routes) instead of 405 Method Not Allowed. The same issue exists on all OAuth2 Hono routes (`GET /api/token`, `GET /api/token/refresh`, `GET /api/oauth/start` with non-GET). Hono supports explicit method-not-allowed handlers; this should be wired.

## What Changes

- In `app/page.tsx`: read the better-auth session in the Server Component via `auth.api.getSession`. If authenticated, render the sign-out form. If not, render a link to `/sign-in`.
- In `features/oauth2/api/logout.ts`: add a catch-all handler that returns 405 for any non-POST method on `/logout`.
- In `features/oauth2/api/token.ts`: add catch-all handlers returning 405 for GET on `/token` and `/token/refresh`.
- In `features/oauth2/api/oauth.ts`: add a catch-all returning 405 for non-GET on `/oauth/start`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None — these are correctness fixes. No spec-level behavior changes to document (405 vs 404 is an HTTP standards detail not worth speccing; the session-gate is a UX detail on a placeholder home page).

## Non-goals

- No changes to the sign-out server action logic itself
- No changes to the database schema or auth flow
- No introduction of a persistent nav component or layout — home page remains minimal

## Impact

- **UI**: yes — `app/page.tsx` becomes session-aware (reads better-auth session)
- **API**: yes — `POST /logout`, `POST /token`, `POST /token/refresh`, `GET /oauth/start` now return 405 for wrong-method requests instead of 404
- **DB schema**: no
- **better-auth plugins**: no
- **Env vars**: no
