## ADDED Requirements

### Requirement: Bruno collection covers all SSO API endpoints
The repository SHALL contain a Bruno collection at `bruno/sso-api/` with one `.bru` request file per SSO API endpoint. The collection SHALL include: OAuth start redirect, token exchange (authorization_code grant), token refresh, and logout (refresh token revocation). The collection SHALL NOT cover better-auth internal endpoints at `/api/auth/*`.

#### Scenario: Collection directory exists with expected files
- **WHEN** a developer clones the repository
- **THEN** `bruno/sso-api/bruno.json`, `bruno/sso-api/environments/local.bru`, and four numbered `.bru` request files are present

#### Scenario: Each request file uses Bruno native format
- **WHEN** a request file is opened
- **THEN** it uses Bruno's `.bru` text format (not Postman JSON), with `meta`, `http`, `headers`, `body`, and `docs` blocks as appropriate

### Requirement: Bruno environment provides local dev defaults
The collection SHALL include an environment file at `bruno/sso-api/environments/local.bru` declaring all variables needed to run requests against a local dev instance without modification. Variables SHALL include: `sso_base_url` (default `http://localhost:3000`), `client_id`, `client_secret`, `code` (placeholder), and `refresh_token` (placeholder).

#### Scenario: Loading the local environment pre-fills all variables
- **WHEN** a developer selects the "local" environment in Bruno
- **THEN** all `{{variable}}` placeholders in request files are resolved to their default values

#### Scenario: Placeholder variables are clearly marked
- **WHEN** a developer reads the environment file
- **THEN** `code` and `refresh_token` are set to empty strings or clearly annotated placeholder values, indicating they must be populated from a real auth flow run

### Requirement: OAuth start request documents the browser redirect entry point
The Bruno collection SHALL include `01_oauth-start.bru` with a `GET /api/oauth/start` request. The request SHALL include `redirect_uri`, `state`, and `client_id` as query parameters. The request docs block SHALL explain that this URL is opened in a browser (not called from the app server) and that the resulting redirect to `redirect_uri?code=<code>&state=<state>` carries the auth code.

#### Scenario: OAuth start request is a GET with required query params
- **WHEN** `01_oauth-start.bru` is opened in Bruno
- **THEN** the method is GET, the URL includes `{{sso_base_url}}/api/oauth/start`, and query parameters `redirect_uri`, `state`, and `client_id` are present

### Requirement: Token exchange request demonstrates authorization_code grant
The Bruno collection SHALL include `02_token-exchange.bru` with a `POST /api/token` request. The body SHALL be JSON with `grant_type: "authorization_code"`, `code: "{{code}}"`, `redirect_uri`, `client_id: "{{client_id}}"`, and `client_secret: "{{client_secret}}"`. The response example in the docs block SHALL show the `access_token`, `refresh_token`, `token_type`, and `expires_in` fields.

#### Scenario: Token exchange request has correct body shape
- **WHEN** `02_token-exchange.bru` is opened in Bruno
- **THEN** the method is POST, Content-Type is `application/json`, and the body includes all five required fields with variable references

### Requirement: Token refresh request demonstrates refresh flow
The Bruno collection SHALL include `03_token-refresh.bru` with a `POST /api/token/refresh` request. The body SHALL be JSON with `refresh_token: "{{refresh_token}}"`, `client_id: "{{client_id}}"`, and `client_secret: "{{client_secret}}"`. The docs block SHALL note that the refresh token is not rotated and the access token has a 15-minute TTL.

#### Scenario: Token refresh request has correct body shape
- **WHEN** `03_token-refresh.bru` is opened in Bruno
- **THEN** the method is POST, the body includes `refresh_token`, `client_id`, and `client_secret` with variable references

### Requirement: Logout request demonstrates refresh token revocation
The Bruno collection SHALL include `04_logout.bru` with a `POST /api/logout` request. The body SHALL be JSON with `refresh_token: "{{refresh_token}}"`, `client_id: "{{client_id}}"`, and `client_secret: "{{client_secret}}"`. The docs block SHALL note that a successful call returns HTTP 200 `{}` and subsequent refresh attempts will fail with 401.

#### Scenario: Logout request has correct body shape
- **WHEN** `04_logout.bru` is opened in Bruno
- **THEN** the method is POST, the body includes the three required fields, and the docs explain the revocation semantics
