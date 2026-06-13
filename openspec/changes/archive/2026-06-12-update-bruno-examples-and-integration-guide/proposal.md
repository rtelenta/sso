## Why

The Bruno API collection and the `docs/integration-guide.md` were written for the old custom OAuth implementation (`/api/oauth/start`, `/api/token`, `/api/token/refresh`, `/api/logout`, HS256 JWT signed with a shared `JWT_SECRET`). Both are now stale after migrating to `@better-auth/oauth-provider` (new endpoints, RS256 JWTs via JWKS, DB-based client registration) and enabling UUID v7 as the default ID format for all Better Auth records.

## What Changes

- **Update Bruno collection** (`bruno/sso-api/`):
  - `01_oauth-start`: new endpoint `GET /api/auth/oauth2/authorize`, add `response_type=code` param, drop `state` URL param note (still required, just standard OAuth now)
  - `02_token-exchange`: new endpoint `POST /api/auth/oauth2/token`, switch body to form-encoded (`application/x-www-form-urlencoded`), update docs to reflect plugin response shape
  - `03_token-refresh`: new endpoint `POST /api/auth/oauth2/token` with `grant_type=refresh_token`, form-encoded body
  - `04_logout`: replace custom `/api/logout` (deleted) with token revocation via `POST /api/auth/oauth2/revoke`
  - `environments/local.bru`: confirm variables still cover what's needed (no `JWT_SECRET` required client-side)

- **Update `docs/integration-guide.md`**:
  - Replace all endpoint URLs (`/api/oauth/start` → `/api/auth/oauth2/authorize`, `/api/token` → `/api/auth/oauth2/token`, etc.)
  - **BREAKING** for JWT validation: remove `JWT_SECRET` / HS256 section; replace with RS256 + JWKS discovery (`GET /api/auth/.well-known/openid-configuration` → `jwks_uri`)
  - Add OIDC discovery section (clients can auto-configure from `/.well-known/openid-configuration`)
  - Update Prerequisites table (remove `JWT_SECRET`, add JWKS note)
  - Update token body format (form-encoded, not JSON)
  - Update Error Reference for plugin error shapes
  - Update UUID note: user `sub` claim is now UUID v7

- **Non-goals**: No changes to the SSO application code. No new auth features. No changes to app-side session management beyond endpoint URL updates.

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `oauth2-code-flow`: endpoint URLs and JWT validation method changed (HS256+shared-secret → RS256+JWKS); token request body is now form-encoded; logout uses token revocation endpoint

## Impact

- `bruno/sso-api/*.bru` — all four requests need updating
- `docs/integration-guide.md` — endpoint URLs, JWT validation section, prerequisites, error reference
- No code changes, no DB changes, no new dependencies
