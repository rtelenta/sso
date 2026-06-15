## MODIFIED Requirements

### Requirement: OAuth clients are registered as trustedClients in lib/auth.ts
The system SHALL register downstream apps as entries in the `trustedClients` plugin option, each with `clientId`, `clientSecret`, and `redirectURLs`. Client secrets SHALL be read from environment variables exported from `lib/constants.ts`. All trusted clients SHALL have `skipConsent: true` since they are internal apps. Client secrets SHALL be stored using better-auth's secure default hashing — the `storeClientSecret` override SHALL NOT be configured.

#### Scenario: Client with valid secret authenticates successfully
- **WHEN** `POST /api/auth/oauth2/token` is called with a `client_id` and `client_secret` matching a `trustedClients` entry
- **THEN** the server returns a token response with `access_token`, `token_type`, and optionally `refresh_token`

#### Scenario: Client with invalid secret is rejected
- **WHEN** `POST /api/auth/oauth2/token` is called with a wrong `client_secret`
- **THEN** the server returns HTTP 401

#### Scenario: Client secrets are not stored as plaintext
- **WHEN** an OAuth client secret is written to the database
- **THEN** the stored value SHALL be a hash produced by better-auth's default `storeClientSecret` mechanism, not the raw secret string
