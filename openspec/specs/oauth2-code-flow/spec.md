# Spec: OAuth2 Authorization Code Flow

## Purpose

Defines the OAuth2 Authorization Code flow for the SSO: accepting redirect parameters from downstream apps, issuing short-lived auth codes after successful authentication, and exposing token exchange endpoints so apps can obtain access JWTs and refresh tokens.

## Requirements

### Requirement: Sign-in and sign-up pages accept OAuth2 redirect parameters
The system SHALL accept `redirect_uri`, `state`, and `client_id` as query parameters on the `/sign-in` and `/sign-up` pages. When present, these parameters SHALL be stored in a signed, HttpOnly, SameSite=Lax cookie named `oauth_pending` with a 10-minute TTL. The cookie SHALL be signed using HMAC-SHA256 with `BETTER_AUTH_SECRET`. The parameters SHALL NOT be forwarded through the form or URL.

#### Scenario: OAuth2 params are stored in cookie on page load
- **WHEN** a browser GETs `/sign-in?redirect_uri=https://app1/callback&state=abc&client_id=app1`
- **THEN** the server sets an `oauth_pending` HttpOnly cookie containing the signed `redirect_uri`, `state`, and `client_id` values, and the sign-in page renders normally

#### Scenario: Missing redirect_uri results in no cookie being set
- **WHEN** a browser GETs `/sign-in` without a `redirect_uri` query parameter
- **THEN** no `oauth_pending` cookie is set and the sign-in page renders with its default post-auth behavior

#### Scenario: Tampered oauth_pending cookie is rejected
- **WHEN** a request arrives with an `oauth_pending` cookie whose HMAC signature does not match
- **THEN** the cookie is treated as absent and the default post-auth redirect is used

### Requirement: Auth code is issued after successful authentication when an OAuth2 flow is pending
After a user successfully authenticates (sign-in or sign-up), the system SHALL check for a valid `oauth_pending` cookie. If present, the system SHALL generate a 32-byte random hex auth code, persist it in the `auth_code` table with the associated `user_id`, `redirect_uri`, and a 5-minute expiry, delete the `oauth_pending` cookie, and redirect the browser to `{redirect_uri}?code={code}&state={state}`.

#### Scenario: Auth code issued and browser redirected after sign-in
- **WHEN** a user successfully authenticates and a valid `oauth_pending` cookie exists
- **THEN** a new row is inserted into `auth_code`, the browser is redirected to `{redirect_uri}?code={code}&state={state}`, and the `oauth_pending` cookie is cleared

#### Scenario: No auth code issued when no OAuth2 flow is pending
- **WHEN** a user successfully authenticates and no `oauth_pending` cookie exists
- **THEN** no `auth_code` row is created and the browser is redirected to the default post-auth destination

#### Scenario: Expired oauth_pending cookie is treated as absent
- **WHEN** a user authenticates and the `oauth_pending` cookie has passed its 10-minute TTL
- **THEN** no auth code is issued and the default post-auth redirect is used

### Requirement: Auth codes are single-use and expire after 5 minutes
Each auth code SHALL be usable exactly once. The system SHALL reject auth codes that have been previously exchanged (`used_at IS NOT NULL`) or that have passed their `expires_at` timestamp. A used code's `used_at` column SHALL be set at the time of first successful exchange.

#### Scenario: Already-used auth code is rejected
- **WHEN** `POST /api/token` is called with an auth code whose `used_at` is not null
- **THEN** the response is HTTP 400 with an error indicating the code has already been used

#### Scenario: Expired auth code is rejected
- **WHEN** `POST /api/token` is called with an auth code whose `expires_at` is in the past
- **THEN** the response is HTTP 400 with an error indicating the code has expired

### Requirement: POST /api/token exchanges an auth code for an access JWT and refresh token
The system SHALL expose `POST /api/token` in the Hono app. The request body SHALL be JSON with fields: `grant_type` (must equal `"authorization_code"`), `code`, `redirect_uri`, `client_id`, `client_secret`. The endpoint SHALL validate the client credentials against `OAUTH_CLIENTS`, validate the auth code, verify `redirect_uri` matches the stored value, mark the code as used, and return a JSON response with `access_token` (JWT, 15-min TTL), `refresh_token` (opaque, 30-day TTL), `token_type: "Bearer"`, and `expires_in: 900`.

#### Scenario: Valid code exchange returns tokens
- **WHEN** `POST /api/token` is called with a valid `client_id`, `client_secret`, `code`, and matching `redirect_uri`
- **THEN** the response is HTTP 200 with `{ access_token, refresh_token, token_type: "Bearer", expires_in: 900 }`

#### Scenario: Invalid client credentials are rejected
- **WHEN** `POST /api/token` is called with an unrecognized `client_id` or wrong `client_secret`
- **THEN** the response is HTTP 401

#### Scenario: Mismatched redirect_uri is rejected
- **WHEN** `POST /api/token` is called with a `redirect_uri` that does not match the one stored with the auth code
- **THEN** the response is HTTP 400

#### Scenario: Unknown auth code is rejected
- **WHEN** `POST /api/token` is called with a `code` that does not exist in the `auth_code` table
- **THEN** the response is HTTP 400

#### Scenario: Wrong grant_type is rejected
- **WHEN** `POST /api/token` is called with `grant_type` other than `"authorization_code"`
- **THEN** the response is HTTP 400

### Requirement: POST /api/token/refresh exchanges a refresh token for a new access JWT
The system SHALL expose `POST /api/token/refresh` in the Hono app. The request body SHALL be JSON with fields: `refresh_token`, `client_id`, `client_secret`. The endpoint SHALL validate the client, look up the refresh token, reject it if revoked or expired, and return a new access JWT with 15-min TTL. The refresh token itself SHALL NOT be rotated on each use.

#### Scenario: Valid refresh token returns new access JWT
- **WHEN** `POST /api/token/refresh` is called with valid client credentials and a non-revoked, non-expired refresh token
- **THEN** the response is HTTP 200 with `{ access_token, token_type: "Bearer", expires_in: 900 }`

#### Scenario: Revoked refresh token is rejected
- **WHEN** `POST /api/token/refresh` is called with a refresh token whose `revoked_at` is not null
- **THEN** the response is HTTP 401

#### Scenario: Expired refresh token is rejected
- **WHEN** `POST /api/token/refresh` is called with a refresh token whose `expires_at` is in the past
- **THEN** the response is HTTP 401

#### Scenario: Invalid client credentials on refresh are rejected
- **WHEN** `POST /api/token/refresh` is called with an unrecognized `client_id` or wrong `client_secret`
- **THEN** the response is HTTP 401

### Requirement: auth_code and refresh_token tables exist in the database
The database SHALL contain an `auth_code` table with columns: `id` (UUID v7 PK), `code` (text, unique), `user_id` (UUID FK → user), `redirect_uri` (text), `expires_at` (timestamptz), `used_at` (timestamptz, nullable). It SHALL also contain a `refresh_token` table with columns: `id` (UUID v7 PK), `token` (text, unique), `user_id` (UUID FK → user), `expires_at` (timestamptz), `revoked_at` (timestamptz, nullable). Both tables SHALL be defined in `db/schema/` and applied via a Drizzle migration.

#### Scenario: auth_code table exists after migration
- **WHEN** the Drizzle migration is applied
- **THEN** the `auth_code` table exists with all required columns

#### Scenario: refresh_token table exists after migration
- **WHEN** the Drizzle migration is applied
- **THEN** the `refresh_token` table exists with all required columns

### Requirement: JWT_SECRET and OAUTH_CLIENTS are sourced from constants
`JWT_SECRET` (used to sign access JWTs) and `OAUTH_CLIENTS` (JSON map of `{ [clientId]: clientSecret }`) SHALL be exported from `lib/constants.ts`. Neither SHALL be accessed via `process.env` outside that file.

#### Scenario: JWT_SECRET is accessible via constants
- **WHEN** `lib/api/routes/token.ts` signs a JWT
- **THEN** it imports `JWT_SECRET` from `@/lib/constants`

#### Scenario: OAUTH_CLIENTS is accessible via constants
- **WHEN** the token endpoint validates a client
- **THEN** it imports `OAUTH_CLIENTS` from `@/lib/constants`
