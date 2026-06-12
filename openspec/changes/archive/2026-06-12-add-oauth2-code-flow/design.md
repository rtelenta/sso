## Context

The SSO currently supports email+password login but has no mechanism for downstream apps to authenticate users through it. The OAuth2 Authorization Code flow is the missing bridge: the app redirects a user to the SSO, the SSO authenticates them and issues a short-lived auth code, and the app exchanges the code for a JWT via a back-channel request.

better-auth manages sessions within the SSO itself; this change adds a separate, bespoke auth code + token layer on top for app-facing JWT issuance.

## Goals / Non-Goals

**Goals:**
- Accept `redirect_uri`, `state`, `client_id` on sign-in/sign-up pages and carry them through authentication
- Generate a short-lived, single-use auth code stored in the DB after successful login
- Redirect to `redirect_uri?code=<auth-code>&state=<state>` post-auth
- `POST /api/token` — exchange auth code for access JWT + refresh token
- `POST /api/token/refresh` — exchange refresh token for a new access JWT

**Non-Goals:**
- PKCE, dynamic client registration, OIDC `id_token`, token introspection

## Decisions

### Decision 1: OAuth2 params carried via encrypted short-lived cookie, not session

**Choice**: Store `redirect_uri`, `state`, `client_id` in a signed, HttpOnly cookie (`oauth_pending`) set on the sign-in page load.

**Why**: better-auth's session is scoped to the SSO user's browser session and not the right place for pre-auth OAuth2 state. A dedicated cookie with a 10-minute TTL keeps the concern isolated and survives form resubmissions. The cookie is signed with `BETTER_AUTH_SECRET` using HMAC-SHA256 to prevent tampering.

**Alternative considered**: URL pass-through (append params to the sign-in form action). Rejected — params would be visible in server logs and referrer headers.

### Decision 2: Auth codes stored as opaque random tokens in the DB

**Choice**: Auth code = 32-byte random token (hex-encoded), stored in `auth_code` table with `user_id`, `redirect_uri`, `expires_at` (5 min TTL), `used_at`.

```ts
// db/schema/auth-code.ts
export const authCode = pgTable("auth_code", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  code: text("code").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  redirectUri: text("redirect_uri").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});
```

**Why**: Opaque tokens don't leak user data. Storing `redirect_uri` allows the token endpoint to validate it matches the exchange request (replay/open-redirect defense). Single-use enforced by setting `used_at` on first exchange and rejecting codes where `used_at IS NOT NULL`.

**Alternative considered**: JWT auth codes (signed, no DB). Rejected — can't enforce single-use without a DB check, which negates the advantage.

### Decision 3: Access tokens are short-lived JWTs; refresh tokens are opaque DB tokens

**Choice**:
- Access token: JWT, signed with `JWT_SECRET` (HS256), 15-min TTL, payload `{ sub: userId, email, iat, exp }`
- Refresh token: 64-byte random token (hex), stored in `refresh_token` table with `user_id`, `expires_at` (30 days), `revoked_at`

```ts
// db/schema/refresh-token.ts
export const refreshToken = pgTable("refresh_token", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  token: text("token").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});
```

**Why**: Stateless access JWTs minimize DB hits on every resource access for downstream apps. Opaque refresh tokens allow instant revocation (matching the logout model described in context).

### Decision 4: Token endpoint validates client via `client_id` + `client_secret` in request body

**Choice**: `POST /api/token` requires `client_id` and `client_secret` in the request body. Valid clients are statically configured in `lib/constants.ts` as a map. No dynamic registration.

```ts
// Hono route shape
app.post("/token", async (c) => {
  const { code, redirect_uri, client_id, client_secret, grant_type } = await c.req.json();
  // validate client, then validate code
});
```

**Why**: Internal-only trusted clients; static config is simpler and auditable. Environment variable `OAUTH_CLIENTS` holds a JSON map of `{ [clientId]: clientSecret }`.

### Decision 5: Post-auth redirect is handled in the sign-in/sign-up Server Action / mutation hook

**Choice**: After better-auth's `signIn` / `signUp` completes successfully, the page component checks for a valid `oauth_pending` cookie. If present: generate the auth code, delete the cookie, redirect to `redirect_uri?code=<code>&state=<state>`. If absent: redirect to the default post-auth destination.

The auth code generation logic lives in `features/oauth2/utils/generateAuthCode.ts` (server-only).

**Hono routes** for token endpoints live in `lib/api/routes/token.ts` and are registered on the Hono app.

## Risks / Trade-offs

- **`redirect_uri` open-redirect** → Mitigated: the token endpoint validates that `redirect_uri` in the exchange matches the one stored with the auth code. The SSO does not validate `redirect_uri` against a pre-registered whitelist on inbound redirect (internal trust model), but code issuance is still tied to the URI that initiated the flow.
- **Cookie stuffing / CSRF on `oauth_pending` cookie** → Mitigated: signed with HMAC; attacker cannot forge a valid `redirect_uri` + `state` pair without the secret. Cookie is SameSite=Lax.
- **Clock skew on JWT exp validation** → Downstream apps should apply a 30-second leeway. Not enforced by SSO.
- **Refresh token table grows unboundedly** → A periodic cleanup job (cron or background task) deleting revoked/expired rows is out of scope for this change but should be added before production.

## Migration Plan

1. Add Drizzle schema for `auth_code` and `refresh_token` tables
2. Generate and apply migration (`bun drizzle-kit generate && bun drizzle-kit migrate`)
3. Add `JWT_SECRET` and `OAUTH_CLIENTS` to environment (`.env.local` and deployment secrets)
4. Deploy — no breaking change to existing sign-in flow; cookie is only set when `redirect_uri` query param is present

## Open Questions

- Should `client_id` be required on the inbound redirect, or is `redirect_uri` + `state` sufficient? (Current proposal: `client_id` is required on token exchange, optional on the inbound redirect.)
- What should the SSO render if `redirect_uri` is absent after successful login? (Current assumption: redirect to `/` or a "you are logged in" page.)
