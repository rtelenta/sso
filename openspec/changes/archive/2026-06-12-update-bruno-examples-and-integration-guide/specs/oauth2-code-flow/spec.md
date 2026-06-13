## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: OAuth2 Authorization Code flow is provided by @better-auth/oauth-provider plugin
The system SHALL use `@better-auth/oauth-provider` configured in `lib/auth.ts` as the sole implementation of the OAuth2 Authorization Code flow. The plugin SHALL be configured with `loginPage: "/sign-in"`. All OAuth endpoints are mounted automatically under `/api/auth/oauth2/` via the existing Better Auth handler. OAuth clients SHALL be registered in the database (seeded via `bun db:seed`) with `requirePKCE: false` for confidential server-side clients and `skipConsent: true` for internal apps.

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
