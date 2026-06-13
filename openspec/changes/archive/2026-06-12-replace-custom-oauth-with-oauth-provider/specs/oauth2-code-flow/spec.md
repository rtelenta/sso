## REMOVED Requirements

### Requirement: Sign-in and sign-up pages accept OAuth2 redirect parameters
**Reason**: Replaced by `@better-auth/oauth-provider` plugin, which manages OAuth state internally. The `oauth_pending` cookie pattern and `handlePostAuthRedirect` server action are no longer needed.
**Migration**: Downstream apps must redirect to `GET /api/auth/oauth2/authorize?client_id=...&redirect_uri=...&response_type=code&state=...`. The plugin redirects unauthenticated users to `/sign-in` automatically.

### Requirement: Auth code is issued after successful authentication when an OAuth2 flow is pending
**Reason**: The plugin's `after` hook handles auth code generation and the redirect to `redirect_uri?code=...&state=...` automatically after a session is created.
**Migration**: Remove `handlePostAuthRedirect` calls from `useSignIn` and `useSignUp`. No replacement code is needed in those hooks.

### Requirement: Auth codes are single-use and expire after 5 minutes
**Reason**: Auth code lifecycle is managed internally by the plugin.
**Migration**: No action required by downstream apps — behavior is preserved.

### Requirement: POST /api/token exchanges an auth code for an access JWT and refresh token
**Reason**: Replaced by the plugin's standard endpoint.
**Migration**: Update to `POST /api/auth/oauth2/token` with body `grant_type=authorization_code&code=...&redirect_uri=...&client_id=...&client_secret=...` (form-encoded or JSON per plugin docs).

### Requirement: POST /api/token/refresh exchanges a refresh token for a new access JWT
**Reason**: Replaced by the plugin's standard endpoint.
**Migration**: Update to `POST /api/auth/oauth2/token` with body `grant_type=refresh_token&refresh_token=...&client_id=...&client_secret=...`.

### Requirement: auth_code and refresh_token tables exist in the database
**Reason**: Plugin manages its own token storage in `oauth_access_token` table. Custom tables are no longer needed.
**Migration**: A Drizzle migration drops `auth_code` and `refresh_token`. Existing refresh tokens are invalidated — users must re-authenticate once.

### Requirement: JWT_SECRET and OAUTH_CLIENTS are sourced from constants
**Reason**: JWT signing is handled by the plugin (uses `BETTER_AUTH_SECRET`). Client registry moves from `OAUTH_CLIENTS` env var to `trustedClients` array in plugin config.
**Migration**: Remove `JWT_SECRET` and `OAUTH_CLIENTS` from `.env`. Add one env var per client secret (e.g. `APP1_CLIENT_SECRET`), exported from `lib/constants.ts`.

## ADDED Requirements

### Requirement: OAuth2 Authorization Code flow is provided by @better-auth/oauth-provider plugin
The system SHALL use `@better-auth/oauth-provider` configured in `lib/auth.ts` as the sole implementation of the OAuth2 Authorization Code flow. The plugin SHALL be configured with `loginPage: "/sign-in"` and a `trustedClients` array. All OAuth endpoints are mounted automatically under `/api/auth/oauth2/` via the existing Better Auth handler.

#### Scenario: Unauthenticated user is redirected to sign-in
- **WHEN** a browser GETs `/api/auth/oauth2/authorize?client_id=app1&redirect_uri=https://app1/callback&response_type=code&state=xyz`
- **THEN** the server redirects to `/sign-in` and the pending OAuth request is preserved internally by the plugin

#### Scenario: Authenticated user is redirected to callback with auth code
- **WHEN** a user is already authenticated and GETs `/api/auth/oauth2/authorize` with valid params
- **THEN** the server redirects to `https://app1/callback?code=<code>&state=xyz` immediately

#### Scenario: Auth code is exchanged for tokens
- **WHEN** `POST /api/auth/oauth2/token` is called with a valid `authorization_code` grant
- **THEN** the response is HTTP 200 with `{ access_token, refresh_token, token_type: "Bearer", expires_in }`

#### Scenario: Refresh token yields a new access token
- **WHEN** `POST /api/auth/oauth2/token` is called with `grant_type=refresh_token` and a valid refresh token
- **THEN** the response is HTTP 200 with a new `access_token`

#### Scenario: Unknown client is rejected
- **WHEN** `/api/auth/oauth2/authorize` is called with a `client_id` not in `trustedClients`
- **THEN** the server returns an OAuth2 error response

### Requirement: OAuth clients are registered as trustedClients in lib/auth.ts
The system SHALL register downstream apps as entries in the `trustedClients` plugin option, each with `clientId`, `clientSecret`, and `redirectURLs`. Client secrets SHALL be read from environment variables exported from `lib/constants.ts`. All trusted clients SHALL have `skipConsent: true` since they are internal apps.

#### Scenario: Client with valid credentials can exchange a code
- **WHEN** `POST /api/auth/oauth2/token` is called with a `client_id` and `client_secret` matching a `trustedClients` entry
- **THEN** the token exchange succeeds

#### Scenario: Client with invalid secret is rejected
- **WHEN** `POST /api/auth/oauth2/token` is called with a wrong `client_secret`
- **THEN** the response is HTTP 401

### Requirement: OIDC discovery endpoint is available
The system SHALL expose `GET /.well-known/openid-configuration` returning a JSON document with the issuer URL, authorization endpoint, token endpoint, and supported grant types. This is provided automatically by the plugin.

#### Scenario: Discovery document is accessible
- **WHEN** a client GETs `/.well-known/openid-configuration`
- **THEN** the response is HTTP 200 with a valid OIDC metadata JSON document containing at minimum `issuer`, `authorization_endpoint`, and `token_endpoint`

### Requirement: Sign-out invalidates the OAuth session without manual refresh token revocation
The `signOut` server action SHALL call `auth.api.signOut` only. It SHALL NOT query or modify any custom refresh token table. The plugin invalidates associated OAuth tokens when the Better Auth session is revoked.

#### Scenario: Sign-out succeeds without custom DB queries
- **WHEN** `signOut()` is called
- **THEN** the Better Auth session is revoked and the user is redirected to `/`, with no queries to `auth_code` or `refresh_token` tables
