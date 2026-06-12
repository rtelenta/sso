## Why

Downstream apps have no way to authenticate users through the SSO — the OAuth2 Authorization Code flow is missing. Without it, apps can't redirect users here, receive an auth code, or exchange that code for a JWT to establish sessions.

## What Changes

- Accept `redirect_uri`, `state`, and `client_id` query params on the sign-in/sign-up pages and persist them in the session for post-auth use
- After successful authentication, redirect the browser to `redirect_uri?code=<auth-code>&state=<state>` instead of a fixed URL
- Issue short-lived, single-use auth codes (stored in the DB) upon successful login when a `redirect_uri` is present
- Add `POST /api/token` endpoint: validates the auth code, deletes it, and returns a signed JWT + refresh token
- Add `POST /api/token/refresh` endpoint: validates a refresh token and returns a new access JWT

## Capabilities

### New Capabilities
- `oauth2-code-flow`: Full Authorization Code flow — redirect_uri/state intake, auth code generation and storage, `/api/token` and `/api/token/refresh` endpoints

### Modified Capabilities
- `email-password-auth`: After successful sign-in or sign-up, the redirect destination changes — if a pending OAuth2 flow exists, the user is sent to `redirect_uri?code=<code>&state=<state>` instead of a hardcoded route

## Impact

- **DB schema**: New `auth_code` table (code, user_id, redirect_uri, expires_at, used_at); new `refresh_token` table (token, user_id, expires_at, revoked_at)
- **API**: New Hono routes `POST /api/token`, `POST /api/token/refresh`
- **Auth flow**: Sign-in/sign-up pages read `redirect_uri`, `state`, `client_id` from query params and stash them (e.g., in a short-lived server-side cookie or session store)
- **Environment variables**: `JWT_SECRET` (for signing access tokens); `OAUTH_CLIENT_SECRET` for validating client credentials on the token endpoint
- **No new better-auth plugins required** — auth code and token issuance are bespoke Hono handlers; better-auth continues to own session management only

## Non-goals

- PKCE / S256 code challenges (not needed for internal trusted clients)
- Dynamic client registration — clients are statically configured
- OIDC `id_token` / userinfo endpoint
- Social provider tokens being forwarded to downstream apps
- Token introspection or revocation endpoints beyond refresh token delete-on-logout
