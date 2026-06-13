# SSO Integration Guide

This guide explains how a downstream internal app integrates with this SSO platform. All authentication is delegated to the SSO — your app never handles passwords or social OAuth directly.

---

## Table of Contents

1. [Overview](#overview)
2. [OIDC Discovery](#oidc-discovery)
3. [Prerequisites](#prerequisites)
4. [Initiating the Flow](#initiating-the-flow)
5. [Receiving the Callback](#receiving-the-callback)
6. [Exchanging the Code](#exchanging-the-code)
7. [Validating the JWT](#validating-the-jwt)
8. [Refreshing the Token](#refreshing-the-token)
9. [Logging Out](#logging-out)
10. [Error Reference](#error-reference)
11. [Troubleshooting FAQ](#troubleshooting-faq)

---

## Overview

This SSO implements the **OAuth2 Authorization Code flow** via the `@better-auth/oauth-provider` plugin. Here is what it provides and what your app receives:

**What the SSO does:**
- Manages user accounts (email/password, magic link, Google OAuth)
- Handles password recovery and account security
- Issues short-lived access JWTs and long-lived refresh tokens after login
- Revokes refresh tokens on logout

**What your app gets:**
- A signed **access JWT** (EdDSA/Ed25519, 15-minute TTL) containing the user's ID and email — use this to identify the user on every request
- An **opaque refresh token** — use this to get new access JWTs without re-authenticating
- Tokens are exchanged server-side only; they **never appear in the browser URL**

**Flow summary:**

```
User clicks "Sign in" in your app
  → App redirects browser to SSO /api/auth/oauth2/authorize
  → User authenticates on the SSO
  → SSO redirects browser back to your app's /callback?code=<code>&state=<state>
  → Your app server exchanges code for access_token + refresh_token
  → Your app stores tokens and considers the user authenticated
```

---

## OIDC Discovery

The SSO exposes a standards-compliant OIDC discovery document. Use it as the authoritative source for all endpoint URLs and supported algorithms:

```
GET {SSO_BASE_URL}/api/auth/.well-known/openid-configuration
```

**Example response (abbreviated):**

```json
{
  "issuer": "https://sso.internal/api/auth",
  "authorization_endpoint": "https://sso.internal/api/auth/oauth2/authorize",
  "token_endpoint": "https://sso.internal/api/auth/oauth2/token",
  "jwks_uri": "https://sso.internal/api/auth/jwks",
  "revocation_endpoint": "https://sso.internal/api/auth/oauth2/revoke",
  "userinfo_endpoint": "https://sso.internal/api/auth/oauth2/userinfo",
  "end_session_endpoint": "https://sso.internal/api/auth/oauth2/end-session",
  "id_token_signing_alg_values_supported": ["EdDSA"],
  "grant_types_supported": ["authorization_code", "refresh_token"]
}
```

OIDC-compatible client libraries (e.g. `openid-client` for Node.js) can configure themselves automatically from this URL without hardcoding any endpoint paths.

---

## Prerequisites

Before integrating, obtain the following from the SSO operator:

| Item | Description |
|------|-------------|
| `client_id` | Identifies your app to the SSO |
| `client_secret` | Authenticates your app's back-channel requests |
| Allowlisted `redirect_uri` | The callback URL the SSO is permitted to redirect to |

> **Security:** `client_secret` is a server-side secret. Never include it in client-side JavaScript, mobile app bundles, or public repositories.

> **No shared JWT secret needed.** Access tokens are signed with EdDSA (Ed25519). Validation uses the public key from the JWKS endpoint — no secret is shared with your app.

You also need to decide on a `redirect_uri` (e.g. `https://your-app.internal/auth/callback`). This URL must be registered with the SSO operator before the flow will work.

---

## Initiating the Flow

When a user clicks "Sign in", redirect their browser to the SSO with the following URL:

```
GET {SSO_BASE_URL}/api/auth/oauth2/authorize
  ?response_type=code
  &redirect_uri={encoded_callback_url}
  &state={random_state}
  &client_id={client_id}
  &scope=openid%20email%20profile
```

**Parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `response_type` | Yes | Must be `code`. |
| `redirect_uri` | Yes | Your callback URL, URL-encoded. Must match an allowlisted URI. |
| `state` | Yes | A cryptographically random string (≥ 16 bytes of entropy). |
| `client_id` | Yes | Your registered client identifier. |
| `scope` | Yes | Space-separated list of scopes. Use `openid email profile` at minimum. Omitting `scope` defaults to `offline_access`, which requires PKCE. |

**Example redirect (Node.js):**

```js
import crypto from "node:crypto";

const state = crypto.randomBytes(16).toString("hex");
req.session.oauthState = state; // persist state for verification in callback

const params = new URLSearchParams({
  response_type: "code",
  redirect_uri: "https://your-app.internal/auth/callback",
  state,
  client_id: process.env.SSO_CLIENT_ID,
  scope: "openid email profile",
});

res.redirect(`${process.env.SSO_BASE_URL}/api/auth/oauth2/authorize?${params}`);
```

**What `state` is for:** The SSO echoes `state` back in the callback URL. Verifying it prevents CSRF attacks — an attacker cannot forge a callback that your server will accept without knowing the random state you generated.

Store `state` in the user's server-side session (not a cookie visible to JavaScript). Use a cryptographically secure random source, not `Math.random()`.

---

## Receiving the Callback

After the user authenticates, the SSO redirects their browser to:

```
{redirect_uri}?code={auth_code}&state={state}
```

Your callback route must:

1. **Verify `state`** — compare it to the value stored in the user's session. If they do not match, reject the request (possible CSRF attack).
2. **Extract `code`** — this is a short-lived, single-use auth code.
3. **Exchange `code` server-side** — make a back-channel POST to `/api/auth/oauth2/token` from your server (never from the browser).

**Example callback handler (Node.js/Express):**

```js
app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;

  // 1. Verify state
  if (state !== req.session.oauthState) {
    return res.status(400).send("Invalid state parameter");
  }
  delete req.session.oauthState;

  // 2. Exchange code for tokens (server-side)
  const tokens = await exchangeCode(code, "https://your-app.internal/auth/callback");

  // 3. Store tokens server-side and set a session cookie for your app
  req.session.accessToken = tokens.access_token;
  req.session.refreshToken = tokens.refresh_token;
  req.session.accessTokenExp = Date.now() + tokens.expires_in * 1000;

  res.redirect("/dashboard");
});
```

> **Never redirect `code` to the browser or log it.** It grants full authentication if intercepted.

---

## Exchanging the Code

Make a server-to-server POST request to the SSO token endpoint. The token endpoint **only accepts `application/x-www-form-urlencoded`** — JSON bodies are rejected.

```
POST {SSO_BASE_URL}/api/auth/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=<auth_code_from_callback>
&redirect_uri=https://your-app.internal/auth/callback
&client_id=<client_id>
&client_secret=<client_secret>
```

**All five fields are required.** `redirect_uri` must exactly match the one used in the authorize redirect.

**Successful response (HTTP 200):**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "a3f9c2d1e4b7...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | JWT string | EdDSA-signed JWT. Use as a `Bearer` token on protected API calls. 15-min TTL. |
| `refresh_token` | Opaque string | Long-lived token. Use to get new access JWTs. |
| `token_type` | `"Bearer"` | Always `"Bearer"`. |
| `expires_in` | number | Seconds until `access_token` expires. Always `900`. |

**Implementation note:**

```js
async function exchangeCode(code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: process.env.SSO_CLIENT_ID,
    client_secret: process.env.SSO_CLIENT_SECRET,
  });

  const res = await fetch(`${process.env.SSO_BASE_URL}/api/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Token exchange failed: ${err.error}`);
  }

  return res.json(); // { access_token, refresh_token, token_type, expires_in }
}
```

---

## Validating the JWT

The access JWT is signed with **EdDSA (Ed25519)**. Validate it using the public key from the SSO's JWKS endpoint — **no shared secret is required**.

**Algorithm:** `EdDSA` (Ed25519 curve)

**Required claims:**

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | string | User ID (UUID v7) |
| `email` | string | User's email address |
| `iss` | string | Issuer — must equal `{SSO_BASE_URL}/api/auth` |
| `iat` | number | Issued-at timestamp (Unix seconds) |
| `exp` | number | Expiry timestamp (Unix seconds) |

**Validation checklist:**

- [ ] Algorithm is `EdDSA` (reject `none` or any other alg)
- [ ] `exp` is in the future (reject expired tokens)
- [ ] Signature verifies against the JWKS public key
- [ ] `iss` matches `{SSO_BASE_URL}/api/auth`
- [ ] `sub` and `email` are present

**Example (Node.js with `jose`):**

```js
import { createRemoteJWKSet, jwtVerify } from "jose";

// Initialize once at app startup — createRemoteJWKSet caches the key automatically
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.SSO_BASE_URL}/api/auth/jwks`)
);

async function verifyAccessToken(token) {
  const { payload } = await jwtVerify(token, JWKS, {
    algorithms: ["EdDSA"],
    issuer: `${process.env.SSO_BASE_URL}/api/auth`,
  });
  return { userId: payload.sub, email: payload.email };
}
```

> **Warning:** Skipping the `exp` check leaves a window of up to 15 minutes where a revoked user can still access your app. Always validate `exp`.

> **Do not hardcode the public key.** The SSO rotates its signing key periodically. `createRemoteJWKSet` from `jose` handles key fetching and caching automatically — initialize it once at startup and reuse the same instance.

---

## Refreshing the Token

Access tokens expire after 15 minutes. Use the refresh token to obtain a new one without re-authenticating.

**When to refresh:**
- **Proactively:** Check `exp` on each request and refresh when fewer than 2 minutes remain
- **Reactively:** Catch 401 responses from your own API and refresh before retrying

```
POST {SSO_BASE_URL}/api/auth/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=<opaque_refresh_token>
&client_id=<client_id>
&client_secret=<client_secret>
```

**Successful response (HTTP 200):**

```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Handling refresh failure (HTTP 401):**

A 401 from the token endpoint (refresh grant) means the token was revoked (the user logged out of the SSO or was disabled). Your app must:

1. Clear all stored tokens
2. Clear the user's app session
3. Redirect them through the OAuth flow to re-authenticate

```js
async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: process.env.SSO_CLIENT_ID,
    client_secret: process.env.SSO_CLIENT_SECRET,
  });

  const res = await fetch(`${process.env.SSO_BASE_URL}/api/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (res.status === 401) {
    // Token revoked — force re-authentication
    throw new Error("REFRESH_TOKEN_REVOKED");
  }

  if (!res.ok) throw new Error("Refresh failed");

  return res.json(); // { access_token, token_type, expires_in }
}
```

---

## Logging Out

### App-initiated logout (back-channel token revocation)

When the user clicks "Sign out" in your app, revoke the refresh token server-side so it can no longer be used:

```
POST {SSO_BASE_URL}/api/auth/oauth2/revoke
Content-Type: application/x-www-form-urlencoded

token=<opaque_refresh_token>
&client_id=<client_id>
&client_secret=<client_secret>
```

**Successful response:** HTTP 200, empty body. The token has been revoked.

**Error response:** HTTP 400 `{"error":"invalid_request","error_description":"token not found"}` is returned if the token does not exist or was already revoked. Despite RFC 7009 recommending 200 for unknown tokens, this implementation returns 400. Always clear the local session regardless of this call's outcome.

```js
async function logout(refreshToken, session) {
  // Revoke server-side (best-effort, clear session regardless)
  try {
    const body = new URLSearchParams({
      token: refreshToken,
      client_id: process.env.SSO_CLIENT_ID,
      client_secret: process.env.SSO_CLIENT_SECRET,
    });

    await fetch(`${process.env.SSO_BASE_URL}/api/auth/oauth2/revoke`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch {
    // Network error — proceed with local session clear anyway
  }

  // Always clear local session
  session.destroy();
}
```

### Browser-based logout (OIDC end-session)

To also terminate the user's session on the SSO itself (useful when the user should be fully logged out across all apps), redirect the browser to the `end_session_endpoint` from the OIDC discovery document.

### SSO-initiated logout

The SSO may revoke tokens without your app's involvement (e.g. the user deleted their SSO account, or they logged out at the SSO directly). Your app detects this as a **401 from the refresh grant** on the next refresh cycle. Handle this the same way as any refresh failure: clear tokens and redirect to re-authenticate.

> **Important:** Existing access JWTs issued before revocation remain valid until their `exp` (up to 15 minutes). There is no access token blacklist.

---

## Error Reference

All error responses use `Content-Type: application/json` with `error` and `error_description` fields.

| `error` field | HTTP Status | Meaning | Remediation |
|---------------|-------------|---------|-------------|
| `invalid_request` | 400 | Missing or malformed parameter, or token not found on revoke | Check all required fields are present and properly form-encoded |
| `invalid_grant` | 400 | Auth code is invalid, expired, already used, or `redirect_uri` mismatch | Re-initiate the OAuth flow; ensure `redirect_uri` matches exactly |
| `invalid_grant` | 401 | Wrong `client_id`/`client_secret`, or refresh token revoked/expired | Verify credentials with the SSO operator; re-initiate the OAuth flow if a refresh token |
| `unsupported_media_type` | 415 | Request body is not `application/x-www-form-urlencoded` | Switch to form-encoded body (not JSON) |
| *(none)* | 405 | Wrong HTTP method | Use the correct method (GET for authorize, POST for all others) |
| *(none)* | 500 | Internal server error | Transient — retry with exponential backoff; report if persistent |

---

## Troubleshooting FAQ

**Token exchange returns 400 `invalid_grant`**

- The `code` may have already been used — each code is single-use. If your callback handler is invoked twice (duplicate redirect), the second call fails.
- The `code` may have expired. Exchange it immediately after receiving the callback.
- The `redirect_uri` in the token exchange request must be **byte-for-byte identical** to the one used in the authorize redirect. A trailing slash, different scheme (`http` vs `https`), or any encoding difference will cause a mismatch.

**Token endpoint returns 415 Unsupported Media Type**

- The token endpoint (`POST /api/auth/oauth2/token`) and revoke endpoint only accept `application/x-www-form-urlencoded`. JSON bodies are rejected.
- Ensure your `Content-Type` header is set to `application/x-www-form-urlencoded` and your body is encoded accordingly (use `URLSearchParams`, not `JSON.stringify`).

**Token refresh returns 401 immediately after sign-in**

- This should not happen with a freshly issued refresh token. If it does, check that you are sending the exact `refresh_token` string returned by the token exchange — not the access JWT.
- Verify your `client_id` and `client_secret` in the refresh request match what was used during the token exchange.

**JWT validation fails (signature mismatch or algorithm error)**

- Confirm you are fetching the public key from the JWKS endpoint (`GET {SSO_BASE_URL}/api/auth/jwks`) — not using a hardcoded key or a shared secret.
- Confirm the validation library is configured for `EdDSA` (not HS256, RS256, or ES256).
- If you hardcoded the public key and it recently stopped working, the SSO rotated its signing key. Switch to `createRemoteJWKSet` from `jose` to handle rotation automatically.

**`iss` claim validation fails**

- The issuer is `{SSO_BASE_URL}/api/auth` (e.g. `https://sso.internal/api/auth`), not the bare domain. Ensure your `issuer` validation string includes the `/api/auth` path suffix.

**`state` mismatch on callback (`Invalid state parameter`)**

- The session containing `oauthState` expired or was not preserved across the redirect. Ensure your session store persists across redirects (stateless cookies work fine; in-memory stores on serverless functions do not).
- If you are running behind a load balancer, ensure session affinity or use a shared session store (Redis, database) — a different instance may have handled the callback than the one that stored the state.
