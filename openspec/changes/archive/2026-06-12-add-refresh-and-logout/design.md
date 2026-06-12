## Context

The `refresh_token` table already exists with an `revoked_at` timestamptz column (nullable). `POST /api/token/refresh` already checks `revokedAt IS NOT NULL` and rejects revoked tokens. The only missing wiring is:
1. A way for downstream apps to explicitly revoke a refresh token (logout from the app)
2. A way for the SSO to revoke all refresh tokens for a user when they sign out of the SSO

## Goals / Non-Goals

**Goals:**
- `POST /api/logout` — client-facing revocation of one specific refresh token
- `signOutAndRevokeTokens` server action — SSO-side logout that bulk-revokes all user refresh tokens then clears the better-auth session
- A sign-out button wired to the server action

**Non-Goals:**
- No refresh token rotation
- No push notification to apps on revocation — apps discover it on next refresh attempt
- No new DB columns or migrations

## Decisions

### POST /api/logout shape

```
POST /api/logout
Content-Type: application/json

{ "refresh_token": "...", "client_id": "...", "client_secret": "..." }
```

Returns:
- `200 {}` — revoked (or already revoked — idempotent)
- `400 { error: "invalid_request" }` — malformed body
- `401 { error: "invalid_client" }` — bad client credentials
- `404 { error: "not_found" }` — token doesn't exist

**Rationale:** Requiring client credentials prevents one app from revoking another app's tokens. Idempotent on already-revoked tokens — a second `POST /api/logout` call with the same token returns 200, not an error. This keeps retries safe.

**File location:** `features/oauth2/api/logout.ts` — consistent with `oauth.ts` and `token.ts` in the same directory. Registered in `lib/api/index.ts`.

### SSO sign-out server action

`features/auth/actions/signOutAndRevokeTokens.ts` — a `"use server"` function that:
1. Gets the current session via `auth.api.getSession({ headers: await headers() })`
2. If session exists: bulk-updates `refresh_token` WHERE `user_id = session.user.id AND revoked_at IS NULL` → sets `revoked_at = NOW()`
3. Calls `auth.api.signOut({ headers: await headers() })` to destroy the better-auth session
4. Returns `"/"` as the redirect target

The action is called from a `<form action={signOutAndRevokeTokens}>` button so Next.js handles the POST with no client JS required. The home page (`app/page.tsx` or a nav component) wires it.

**Why bulk-revoke all user tokens on SSO logout (not just one)?** The SSO doesn't know which apps the user accessed. Revoking all ensures consistent logout across all downstream apps with one action.

### No sign-out UI component from scratch

The sign-out button is a plain HTML `<form>` with a `<button type="submit">` calling the server action. No new component needed — the wiring goes on the existing home page (`app/page.tsx`) since no persistent nav/layout exists yet.

## Risks / Trade-offs

- **Risk:** Race condition — two concurrent sign-out calls bulk-revoking the same tokens.
  **Mitigation:** SQL `WHERE revoked_at IS NULL` is idempotent; the second update affects 0 rows, not a problem.

- **Trade-off:** Bulk revocation is coarse-grained. If a user is logged into app1 and app2, signing out of the SSO revokes both apps' tokens simultaneously. This is the intended behavior per the spec, but it means no per-app session scoping.

- **Trade-off:** `POST /api/logout` requires the downstream app to hold the refresh token to call revocation. If the app already deleted the token from its store before calling logout, it can't revoke. Acceptable — the 30-day TTL is the fallback.
