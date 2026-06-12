## Why

The refresh token table and `POST /api/token/refresh` are already implemented (part of `add-oauth2-code-flow`). What is missing is the ability to **revoke** a refresh token. Without revocation, once a downstream app receives a refresh token there is no way to invalidate it: the 30-day window stays open even after the user logs out of the SSO or the app. This is the last piece needed for a complete, secure token lifecycle.

## What Changes

- Add `POST /api/logout` Hono endpoint in `features/oauth2/api/`:  
  accepts `{ refresh_token, client_id, client_secret }`, validates the client, and sets `revoked_at = NOW()` on the matching `refresh_token` row. Returns 200 on success; 401 on bad credentials; 400 if token not found.
- Add a server action `signOutAndRevokeTokens` in `features/auth/actions/` that:  
  1. looks up the current better-auth session to get `userId`  
  2. bulk-revokes all `refresh_token` rows for that user (`revoked_at = NOW()` where `revoked_at IS NULL`)  
  3. calls better-auth's `auth.api.signOut` to delete the SSO session
- Wire the server action to a sign-out `<form>` or `<button>` (home page or nav) so users can trigger it from the browser.

## Capabilities

### New Capabilities

- `token-revocation`: `POST /api/logout` — client-facing refresh token revocation endpoint, plus the SSO-side sign-out action that bulk-revokes all user refresh tokens on logout.

### Modified Capabilities

- `oauth2-code-flow`: add the `POST /api/logout` endpoint description and the SSO-logout → revocation behavior as new requirements.

## Non-goals

- No refresh token rotation on each refresh call (already deliberate — per existing spec, tokens are not rotated)
- No OIDC end-session endpoint
- No cross-app logout notification (apps discover revocation via next `/api/token/refresh` failure)
- No changes to the `auth_code` or `refresh_token` schema — `revoked_at` already exists

## Impact

- **UI**: yes — sign-out button wired to server action (minimal, home page or layout)
- **API**: yes — new `POST /api/logout` Hono route in `features/oauth2/api/logout.ts`
- **DB schema**: no — `revoked_at` column already exists on `refresh_token`
- **better-auth plugins**: no
- **Env vars**: no (reuses `OAUTH_CLIENTS` for client auth on `POST /api/logout`)
