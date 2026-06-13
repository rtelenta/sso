## 1. Bruno Collection Scaffold

- [x] 1.1 Create `bruno/sso-api/` directory and `bruno.json` collection metadata file (name: "SSO API", version: 1).
- [x] 1.2 Create `bruno/sso-api/environments/local.bru` with variables: `sso_base_url=http://localhost:3000`, `client_id=app1`, `client_secret=secret1`, `code=` (empty placeholder), `refresh_token=` (empty placeholder).

## 2. Bruno Request Files

- [x] 2.1 Create `bruno/sso-api/01_oauth-start.bru` — `GET {{sso_base_url}}/api/oauth/start` with query params `redirect_uri`, `state`, and `client_id`. Include a `docs` block explaining this URL is opened in a browser and the callback delivers `?code=<code>&state=<state>`.
- [x] 2.2 Create `bruno/sso-api/02_token-exchange.bru` — `POST {{sso_base_url}}/api/token` with JSON body `{ grant_type, code, redirect_uri, client_id, client_secret }` and a `docs` block showing the expected response shape.
- [x] 2.3 Create `bruno/sso-api/03_token-refresh.bru` — `POST {{sso_base_url}}/api/token/refresh` with JSON body `{ refresh_token, client_id, client_secret }` and a `docs` block noting the 15-min access token TTL and that the refresh token is not rotated.
- [x] 2.4 Create `bruno/sso-api/04_logout.bru` — `POST {{sso_base_url}}/api/logout` with JSON body `{ refresh_token, client_id, client_secret }` and a `docs` block noting that success returns `{}` and subsequent refreshes will fail with 401.

## 3. Integration Guide

- [x] 3.1 Create `docs/integration-guide.md` with sections: Overview, Prerequisites, Initiating the Flow, Receiving the Callback, Exchanging the Code, Validating the JWT, Refreshing the Token, Logging Out, Error Reference, Troubleshooting FAQ.
- [x] 3.2 Fill in the "Overview" section: what this SSO provides (auth code flow, JWTs, refresh tokens), what the app gets (stateless JWT for user identity).
- [x] 3.3 Fill in "Prerequisites": `client_id`, `client_secret`, `JWT_SECRET` (shared signing secret), and allowlisted `redirect_uri` — all obtained from the SSO operator. Add a warning callout about keeping `client_secret` and `JWT_SECRET` server-side only.
- [x] 3.4 Fill in "Initiating the Flow": exact redirect URL template with all query params, note to generate a cryptographically random `state` and store it in session for CSRF protection.
- [x] 3.5 Fill in "Receiving the Callback": callback URL shape, state verification requirement, note to extract `code` and pass it to the back-channel token exchange (never expose `code` in a client-side redirect).
- [x] 3.6 Fill in "Exchanging the Code": complete POST /api/token example with all five body fields, full response example, note that the code is single-use and expires in 5 minutes.
- [x] 3.7 Fill in "Validating the JWT": algorithm (HS256), required claims (`sub`, `email`, `iat`, `exp`), validation checklist, warning callout that skipping `exp` check allows access up to 15 min after logout.
- [x] 3.8 Fill in "Refreshing the Token": complete POST /api/token/refresh example, when to refresh (proactively before `exp` or reactively on 401), 401 handling (re-initiate OAuth flow, clear stored tokens).
- [x] 3.9 Fill in "Logging Out": complete POST /api/logout example, SSO-initiated logout explanation (next refresh → 401), instructions to clear local session regardless of API response.
- [x] 3.10 Fill in "Error Reference": table with columns (error field, HTTP status, meaning, remediation) covering `invalid_request`, `invalid_client`, `invalid_grant`, `not_found`, and 500.
- [x] 3.11 Fill in "Troubleshooting FAQ" with at least 4 entries: token exchange fails with 400, refresh fails with 401 immediately after sign-in, JWT validation fails, `state` mismatch on callback.
