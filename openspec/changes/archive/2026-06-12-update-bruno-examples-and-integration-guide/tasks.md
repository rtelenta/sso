## 1. Update Bruno Collection — Request Files

- [x] 1.1 Update `bruno/sso-api/01_oauth-start.bru`: change URL to `{{sso_base_url}}/api/auth/oauth2/authorize`, add `response_type: code` query param, update inline docs to use new endpoint name and note OIDC discovery
- [x] 1.2 Update `bruno/sso-api/02_token-exchange.bru`: change URL to `{{sso_base_url}}/api/auth/oauth2/token`, switch body from `body: json` to `body: form-urlencoded` with fields `grant_type`, `code`, `redirect_uri`, `client_id`, `client_secret`, update Content-Type header, update inline docs
- [x] 1.3 Update `bruno/sso-api/03_token-refresh.bru`: change URL to `{{sso_base_url}}/api/auth/oauth2/token`, switch body to `body: form-urlencoded` with fields `grant_type=refresh_token`, `refresh_token`, `client_id`, `client_secret`, update inline docs
- [x] 1.4 Replace `bruno/sso-api/04_logout.bru`: change URL to `{{sso_base_url}}/api/auth/oauth2/revoke`, switch body to `body: form-urlencoded` with fields `token`, `client_id`, `client_secret`, update name and inline docs to reflect RFC 7009 token revocation

## 2. Update Bruno Environment

- [x] 2.1 Review `bruno/sso-api/environments/local.bru`: confirm no `jwt_secret` variable exists (it shouldn't be needed client-side); ensure `client_id`, `client_secret`, `code`, `refresh_token` variables are still present and correct

## 3. Update Integration Guide — Endpoints and Flow

- [x] 3.1 Update Overview section: change `/api/oauth/start` to `/api/auth/oauth2/authorize` in the flow summary diagram
- [x] 3.2 Add OIDC Discovery section (after Overview, before Prerequisites): explain `GET {SSO_BASE_URL}/api/auth/.well-known/openid-configuration`, show example response fields, note that OIDC client libraries can auto-configure from it
- [x] 3.3 Update Prerequisites table: remove `JWT_SECRET` row, replace with a note that JWT validation uses JWKS (no shared secret required); keep `client_id`, `client_secret`, `redirect_uri`
- [x] 3.4 Update Initiating the Flow section: change endpoint from `/api/oauth/start` to `/api/auth/oauth2/authorize`, add `response_type=code` parameter to the URL example and the Node.js code sample
- [x] 3.5 Update Exchanging the Code section: change endpoint from `/api/token` to `/api/auth/oauth2/token`, switch request body example from JSON to form-encoded (`application/x-www-form-urlencoded`), update the Node.js `exchangeCode` function accordingly
- [x] 3.6 Update Refreshing the Token section: change endpoint from `/api/token/refresh` to `/api/auth/oauth2/token`, switch body to form-encoded with `grant_type=refresh_token`, update Node.js `refreshAccessToken` function
- [x] 3.7 Update Logging Out section: change endpoint from `/api/logout` to `/api/auth/oauth2/revoke`, switch body to form-encoded with `token` field (rename from `refresh_token`), update Node.js `logout` function; add note about `end-session` endpoint for browser-based OIDC logout

## 4. Update Integration Guide — JWT Validation

- [x] 4.1 Rewrite Validating the JWT section: remove HS256 / `JWT_SECRET` approach entirely; replace with EdDSA + JWKS approach using `jose`'s `createRemoteJWKSet`, show updated `verifyAccessToken` example with `algorithms: ["EdDSA"]` and `issuer` validation
- [x] 4.2 Update the JWT claims table: confirm `sub` is UUID v7 (unchanged), update algorithm note from HS256 to EdDSA
- [x] 4.3 Add JWKS caching note: warn against fetching JWKS on every request; note that `createRemoteJWKSet` from `jose` handles caching automatically; warn against hardcoding the public key (will break on key rotation)

## 5. Update Integration Guide — Error Reference and FAQ

- [x] 5.1 Update Error Reference table: replace custom error shapes (`invalid_request`, `invalid_client`, etc.) with plugin's OAuth2 error response format (`error` + `error_description` fields); update HTTP status codes where they differ
- [x] 5.2 Update Troubleshooting FAQ: replace references to `/api/token`, `/api/token/refresh`, `JWT_SECRET`, and HS256 with new endpoints and EdDSA/JWKS approach; add entry for HTTP 415 (wrong Content-Type on token endpoint)
