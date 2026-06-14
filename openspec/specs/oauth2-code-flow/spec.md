# Spec: OAuth2 Authorization Code Flow

## Purpose

Defines the OAuth2 Authorization Code flow for the SSO using the `@better-auth/oauth-provider` plugin. The plugin manages the full OAuth2 lifecycle — authorization, auth code issuance, token exchange, and refresh — under `/api/auth/oauth2/`. Downstream apps register as trusted clients in `lib/auth.ts`.

## Requirements

### Requirement: OAuth2 Authorization Code flow is provided by @better-auth/oauth-provider plugin
The system SHALL use `@better-auth/oauth-provider` configured in `lib/auth.ts` as the sole implementation of the OAuth2 Authorization Code flow. The plugin SHALL be configured with `loginPage: "/sign-in"`. All OAuth endpoints are mounted automatically under `/api/auth/oauth2/` via the existing Better Auth handler. OAuth clients SHALL be registered in the database (seeded via `bun db:seed`) with `requirePKCE: false` for confidential server-side clients and `skipConsent: true` for internal apps.

The sign-in page (`/sign-in`) SHALL forward its full query string (the signed OAuth params appended by the plugin, including `sig`) to the sign-up page link so that `window.location.search` on `/sign-up` carries `sig`. This enables the `oauthProviderClient` fetch plugin to include `oauth_query` in the `signUp.email()` request body, allowing the plugin's server-side hook to continue the OAuth flow after registration.

#### Scenario: Unauthenticated user is redirected to sign-in
- **WHEN** a browser GETs `/api/auth/oauth2/authorize?client_id=app1&redirect_uri=https://app1/callback&response_type=code&state=xyz`
- **THEN** the server redirects to `/sign-in` and the pending OAuth request is preserved internally by the plugin

#### Scenario: Authenticated user is redirected to callback with auth code
- **WHEN** a user is already authenticated and GETs `/api/auth/oauth2/authorize` with valid params
- **THEN** the server redirects to `https://app1/callback?code=<code>&state=xyz` immediately

#### Scenario: Auth code is exchanged for tokens via form-encoded request
- **WHEN** `POST /api/auth/oauth2/token` is called with a valid `authorization_code` grant and form-encoded body
- **THEN** the response is HTTP 200 with `{ access_token, refresh_token, token_type: "Bearer", expires_in }`

#### Scenario: Refresh token yields a new access token
- **WHEN** `POST /api/auth/oauth2/token` is called with `grant_type=refresh_token` and a valid refresh token (form-encoded)
- **THEN** the response is HTTP 200 with a new `access_token`

#### Scenario: Refresh token can be revoked
- **WHEN** `POST /api/auth/oauth2/revoke` is called with a valid refresh token and client credentials (form-encoded)
- **THEN** the response is HTTP 200 and the token is invalidated; subsequent refresh attempts return an error

#### Scenario: Unknown client is rejected
- **WHEN** `/api/auth/oauth2/authorize` is called with a `client_id` not in the database
- **THEN** the server returns an OAuth2 error response

#### Scenario: New user registers during OAuth2 flow and is redirected to app callback
- **WHEN** a user arrives at `/sign-in` via an OAuth2 authorize redirect (URL contains signed params with `sig`)
- **AND** the user clicks "Sign up" which navigates to `/sign-up` with the same signed params forwarded
- **AND** the user completes registration via `signUp.email()`
- **THEN** the `oauthProviderClient` plugin attaches `oauth_query` to the request body (derived from `window.location.search`)
- **AND** the server creates the account, establishes a session, and redirects to `https://app1/callback?code=<code>&state=xyz`

#### Scenario: User registers directly on SSO (no OAuth context) and is sent to home
- **WHEN** a user navigates directly to `/sign-up` with no signed OAuth params in the URL
- **AND** completes registration
- **THEN** the user is redirected to `/` (SSO home page)

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

### Requirement: OIDC discovery document is the authoritative source for endpoint URLs
The system SHALL expose a standards-compliant OIDC discovery document at `GET {SSO_BASE_URL}/api/auth/.well-known/openid-configuration`. Downstream integrators SHALL use this document to obtain endpoint URLs and supported algorithms rather than hardcoding them. The document SHALL include at minimum: `issuer`, `authorization_endpoint`, `token_endpoint`, `jwks_uri`, `revocation_endpoint`, and `id_token_signing_alg_values_supported`.

#### Scenario: Discovery document contains required fields
- **WHEN** a client GETs `{SSO_BASE_URL}/api/auth/.well-known/openid-configuration`
- **THEN** the response is HTTP 200 JSON containing `issuer`, `authorization_endpoint`, `token_endpoint`, `jwks_uri`, `revocation_endpoint`, and `id_token_signing_alg_values_supported`

### Requirement: Access tokens are EdDSA-signed JWTs validated via JWKS
The access token issued by the token endpoint SHALL be a JWT signed with EdDSA (Ed25519). Downstream apps SHALL validate it by fetching the public key from the `jwks_uri` in the discovery document (`GET {SSO_BASE_URL}/api/auth/jwks`). Apps SHALL NOT use a shared secret (`JWT_SECRET`) to validate tokens. Apps SHALL validate the `iss` claim against `{SSO_BASE_URL}/api/auth`. JWKS public keys SHALL be cached locally — apps MUST NOT fetch JWKS on every request.

#### Scenario: Valid access token passes JWKS validation
- **WHEN** a downstream app validates an access token using the JWKS public key and `algorithms: ["EdDSA"]`
- **THEN** validation succeeds and `payload.sub` (UUID v7 user ID) and `payload.email` are accessible

#### Scenario: Hardcoded public key breaks on key rotation
- **WHEN** Better Auth rotates its signing key
- **THEN** apps using `createRemoteJWKSet` automatically fetch the new key, while apps with a hardcoded key begin rejecting valid tokens

### Requirement: Token endpoint requires form-encoded body
The token endpoint (`POST /api/auth/oauth2/token`) SHALL accept only `application/x-www-form-urlencoded` request bodies. JSON bodies SHALL be rejected with HTTP 415. This applies to both `authorization_code` and `refresh_token` grant types.

#### Scenario: Form-encoded authorization_code grant succeeds
- **WHEN** `POST /api/auth/oauth2/token` is called with `Content-Type: application/x-www-form-urlencoded` and body `grant_type=authorization_code&code=...&redirect_uri=...&client_id=...&client_secret=...`
- **THEN** the response is HTTP 200 with `{ access_token, refresh_token, token_type, expires_in }`

#### Scenario: JSON body is rejected
- **WHEN** `POST /api/auth/oauth2/token` is called with `Content-Type: application/json`
- **THEN** the response is HTTP 415 with an error indicating the content type is not allowed
