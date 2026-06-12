## ADDED Requirements

### Requirement: POST /api/logout revokes a specific refresh token
The system SHALL expose `POST /api/logout` in the Hono app. The request body SHALL be JSON with fields: `refresh_token`, `client_id`, `client_secret`. The endpoint SHALL validate the client credentials against `OAUTH_CLIENTS`, look up the refresh token, and set its `revoked_at` to the current timestamp. The operation SHALL be idempotent — calling it on an already-revoked token SHALL return 200. After revocation, subsequent calls to `POST /api/token/refresh` with that token SHALL be rejected.

#### Scenario: Valid revocation request succeeds
- **WHEN** `POST /api/logout` is called with valid client credentials and a known refresh token
- **THEN** the response is HTTP 200, and the `revoked_at` column for that refresh token row is set to the current timestamp

#### Scenario: Revoking an already-revoked token is idempotent
- **WHEN** `POST /api/logout` is called with a refresh token whose `revoked_at` is already set
- **THEN** the response is HTTP 200 and no error is returned

#### Scenario: Invalid client credentials are rejected
- **WHEN** `POST /api/logout` is called with an unrecognized `client_id` or wrong `client_secret`
- **THEN** the response is HTTP 401

#### Scenario: Unknown refresh token returns 404
- **WHEN** `POST /api/logout` is called with a `refresh_token` value that does not exist in the database
- **THEN** the response is HTTP 404

### Requirement: SSO sign-out revokes all refresh tokens for the user
When a user signs out of the SSO, the system SHALL revoke all non-revoked refresh tokens associated with that user (set `revoked_at = NOW()` WHERE `revoked_at IS NULL`). The better-auth session SHALL then be destroyed. This ensures that all downstream apps are locked out at the next refresh attempt.

#### Scenario: SSO sign-out revokes all user refresh tokens
- **WHEN** a user signs out of the SSO via the sign-out action
- **THEN** all `refresh_token` rows for that user with `revoked_at IS NULL` are updated to set `revoked_at = NOW()`, and the better-auth session is destroyed

#### Scenario: Refresh attempt after SSO sign-out is rejected
- **WHEN** a downstream app calls `POST /api/token/refresh` with a refresh token that was revoked by SSO sign-out
- **THEN** the response is HTTP 401
