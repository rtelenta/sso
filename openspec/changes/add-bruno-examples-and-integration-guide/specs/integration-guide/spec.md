## ADDED Requirements

### Requirement: Integration guide covers the full OAuth2 Authorization Code flow
`docs/integration-guide.md` SHALL describe the complete end-to-end OAuth2 Authorization Code flow a downstream app must implement: initiating the redirect, receiving the auth code callback, exchanging the code for tokens, and storing the tokens. Each step SHALL include exact URL shapes, query parameter names, request body fields, and expected response fields.

#### Scenario: Guide shows exact redirect URL shape for OAuth start
- **WHEN** a developer reads the "Initiating the flow" section
- **THEN** they see the full redirect URL template: `{SSO_BASE_URL}/api/oauth/start?redirect_uri={encoded_uri}&state={random_state}&client_id={client_id}` with each parameter described

#### Scenario: Guide shows exact callback URL shape
- **WHEN** a developer reads the "Receiving the callback" section
- **THEN** they see that the SSO redirects to `{redirect_uri}?code={auth_code}&state={state}` and that the app MUST verify `state` matches the value it sent

#### Scenario: Guide shows exact token exchange request and response
- **WHEN** a developer reads the "Exchanging the code" section
- **THEN** they see a complete POST /api/token request example with all five body fields and the full response shape including `access_token`, `refresh_token`, `token_type`, and `expires_in`

### Requirement: Integration guide explains JWT validation
The guide SHALL describe how downstream apps MUST validate the access JWT: algorithm (HS256), required claims (`sub`, `email`, `iat`, `exp`), and the shared secret (`JWT_SECRET` environment variable obtained from the SSO operator). The guide SHALL state that apps MUST reject tokens with an expired `exp` claim without calling the SSO.

#### Scenario: Guide provides JWT validation checklist
- **WHEN** a developer reads the "Validating the JWT" section
- **THEN** they see: verify algorithm is HS256, verify `exp` is in the future, extract `sub` (user ID) and `email` claims

#### Scenario: Guide warns against trusting JWTs without validation
- **WHEN** a developer reads the JWT section
- **THEN** a callout block explicitly states that skipping `exp` validation allows access after logout (the 15-minute window)

### Requirement: Integration guide explains the token refresh strategy
The guide SHALL describe when and how to refresh: call `POST /api/token/refresh` with the stored `refresh_token`, `client_id`, and `client_secret` before the access token expires (or on receiving a 401). The guide SHALL note that the refresh token has a 30-day TTL and is not rotated on use. It SHALL state that a 401 from `/api/token/refresh` means the token was revoked (user logged out of SSO) and the app must re-initiate the OAuth flow.

#### Scenario: Guide shows refresh request and response
- **WHEN** a developer reads the "Refreshing the token" section
- **THEN** they see a complete POST /api/token/refresh request example and the response with the new `access_token`

#### Scenario: Guide describes how to handle refresh failure
- **WHEN** a developer reads the refresh section
- **THEN** they see: on 401, clear stored tokens and redirect the user through the OAuth flow again

### Requirement: Integration guide explains logout
The guide SHALL describe two logout scenarios: (1) app-side logout — the app calls `POST /api/logout` with the stored refresh token to revoke it, then clears its local session; (2) SSO-side logout — the refresh token is revoked at the SSO directly, causing the next app refresh attempt to fail with 401.

#### Scenario: Guide shows logout request
- **WHEN** a developer reads the "Logging out" section
- **THEN** they see a complete POST /api/logout request example with body fields and expected 200 `{}` response

#### Scenario: Guide explains SSO-initiated logout
- **WHEN** a developer reads the logout section
- **THEN** they understand the app must handle 401 from /api/token/refresh as a logout signal and cannot rely solely on app-side revocation

### Requirement: Integration guide includes prerequisites and error reference
The guide SHALL open with a Prerequisites section listing what the app team must obtain before integration: `client_id`, `client_secret`, `JWT_SECRET`, and an allowlisted `redirect_uri`. It SHALL close with an Error Reference table mapping each API error response (`error` field value) to its HTTP status and remediation action.

#### Scenario: Prerequisites section lists required credentials
- **WHEN** a developer reads the prerequisites
- **THEN** they see `client_id`, `client_secret`, `JWT_SECRET`, and `redirect_uri` allowlisting as required items with instructions to contact the SSO operator

#### Scenario: Error reference covers all documented error codes
- **WHEN** a developer reads the error reference
- **THEN** they see entries for: `invalid_request` (400), `invalid_client` (401), `invalid_grant` (400/401), `not_found` (404), and server errors (500)
