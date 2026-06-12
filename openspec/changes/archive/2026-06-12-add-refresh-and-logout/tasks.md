## 1. POST /api/logout — Refresh Token Revocation Endpoint

- [x] 1.1 Create `features/oauth2/api/logout.ts` with a Hono router exporting `logoutRouter`. Route: `POST /logout`. Validate body (`{ refresh_token, client_id, client_secret }` via zod), check `OAUTH_CLIENTS`, look up the token row, return 404 if not found, set `revoked_at = new Date()` if not already set (idempotent), return 200.
- [x] 1.2 In `lib/api/index.ts`, import `logoutRouter` from `@/features/oauth2/api/logout` and register it with `app.route("/", logoutRouter)`.

## 2. SSO Sign-Out Server Action

- [x] 2.1 Create `features/auth/actions/signOut.ts` as a `"use server"` action. It should: get the current session via `auth.api.getSession({ headers: await headers() })`; if a session exists, bulk-update `refresh_token` rows `WHERE user_id = session.user.id AND revoked_at IS NULL` setting `revoked_at = new Date()`; then call `auth.api.signOut({ headers: await headers() })`. Return `"/"`.

## 3. Sign-Out UI

- [x] 3.1 In `app/page.tsx`, import the `signOut` action and render a `<form action={signOut}><button type="submit">Sign out</button></form>`. This gives a functional sign-out without requiring client JS.

## 4. Verification

- [x] 4.1 Run `bun run build` — confirm no TypeScript errors.
- [x] 4.2 Start the dev server. Sign up, then call `POST /api/token` to get a refresh token. Call `POST /api/logout` with that token. Confirm 200. Then call `POST /api/token/refresh` with the same token — confirm 401 (revoked).
- [x] 4.3 Confirm `POST /api/logout` with an unknown token returns 404 and with bad client credentials returns 401.
