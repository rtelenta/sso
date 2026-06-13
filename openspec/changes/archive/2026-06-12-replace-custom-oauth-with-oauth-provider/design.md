## Context

The SSO currently has a fully custom OAuth 2.0 Authorization Code implementation: a signed `oauth_pending` cookie to carry params through the login redirect, custom `auth_code` and `refresh_token` DB tables, Hono routes for `/api/oauth/start`, `/api/token`, `/api/token/refresh`, and `/api/logout`, JWT signing via `jose`, and a `handlePostAuthRedirect` server action called from both auth hooks.

`@better-auth/oauth-provider` is a first-party Better Auth plugin that implements the same flow as a plugin, integrating directly with the existing Better Auth session. Replacing the custom layer removes ~250 lines of auth plumbing and gains OIDC compliance and a discovery endpoint.

## Goals / Non-Goals

**Goals:**
- Replace all custom OAuth code with the plugin
- Maintain the same Authorization Code flow behavior for downstream apps
- Drop the two custom DB tables and the `uuidv7` / implicit `jose` dependencies
- Expose `/.well-known/openid-configuration` for downstream app auto-configuration

**Non-Goals:**
- Consent screen UI (all clients are trusted internal apps)
- Dynamic client registration
- Scopes beyond `openid`, `profile`, `email`
- Migrating existing refresh tokens (old tokens are invalidated; downstream apps re-authenticate)

## Decisions

### Decision: Use `trustedClients` instead of DB-backed client registration

The plugin supports both DB-registered clients (`POST /api/auth/oauth2/register`) and statically configured `trustedClients`. Since this SSO has a small, fixed set of internal apps, `trustedClients` in `lib/auth.ts` replaces the `OAUTH_CLIENTS` env var. Clients are configured as an array of objects with `clientId`, `clientSecret`, `redirectURLs`, and `skipConsent: true`.

Alternative considered: keep env var JSON, parse it into `trustedClients` at runtime. Rejected — the array shape required by the plugin is richer than a flat `{id: secret}` map and the extra parsing adds noise.

### Decision: Remove `handlePostAuthRedirect` — rely on plugin's `after` hook

The plugin registers an `after` hook that runs post-authentication. When a session is created and a pending OAuth request exists (stored internally by the plugin), the hook generates the auth code and issues the redirect automatically. The `useSignIn` and `useSignUp` hooks become simpler: on success, just `router.push("/")`. If an OAuth flow was pending the plugin redirect takes precedence over that push.

### Decision: `signOut` no longer manually revokes refresh tokens

The custom `signOut` action currently queries the `refresh_token` table. After migration, that table is gone. Better Auth's `auth.api.signOut` invalidates the Better Auth session; the plugin ties its access tokens to that session, so they become invalid when the session is revoked. No custom revocation logic is needed.

### Decision: Remove Hono OAuth routes entirely — plugin mounts under `/api/auth/*`

The existing Hono routes (`/api/oauth/start`, `/api/token`, etc.) are removed from `lib/api/index.ts`. The plugin exposes endpoints under `/api/auth/oauth2/...` through the existing `app.all("/auth/*", ...)` handler that already proxies to `auth.handler`. No new Hono routes are needed.

**New endpoint paths for downstream apps:**

| Purpose | Old | New |
|---|---|---|
| Start OAuth flow | `GET /api/oauth/start?redirect_uri=...` | `GET /api/auth/oauth2/authorize?client_id=...&redirect_uri=...&response_type=code&state=...` |
| Exchange code | `POST /api/token` | `POST /api/auth/oauth2/token` |
| Refresh token | `POST /api/token/refresh` | `POST /api/auth/oauth2/token` (`grant_type=refresh_token`) |
| Revoke / logout | `POST /api/logout` | `POST /api/auth/oauth2/revoke` |
| OIDC discovery | — | `GET /.well-known/openid-configuration` |

### Decision: Configure plugin in `lib/auth.ts`

```ts
import { oAuthProvider } from "@better-auth/oauth-provider";

export const auth = betterAuth({
  // ...existing config
  plugins: [
    oAuthProvider({
      loginPage: "/sign-in",
      clientAuthentication: "client_secret_post",
      trustedClients: [
        {
          clientId: "app1",
          clientSecret: "...",
          redirectURLs: ["https://app1.internal/callback"],
          skipConsent: true,
        },
      ],
    }),
  ],
});
```

Client secrets are read from environment variables (new pattern: one env var per client, e.g. `APP1_CLIENT_SECRET`), exported from `lib/constants.ts` as usual.

### Decision: Drop `auth_code` and `refresh_token` tables via a single Drizzle migration

A new migration drops both tables. `uuidv7` is removed from `package.json` and `db/schema/index.ts` after the tables are removed. The plugin creates its own `oauth_access_token` and `oauth_application` tables via Better Auth's schema sync (`db:push` or a generated migration).

## Risks / Trade-offs

**Breaking change for downstream apps** → Downstream apps must update their OAuth endpoint URLs. Since this is an internal SSO with known apps, coordinate the cutover. No parallel running of old and new endpoints — a clean switch is simpler than a compatibility shim.

**Existing refresh tokens are invalidated** → Any user currently holding a refresh token from the old system will need to re-authenticate once. For an internal SSO this is acceptable; surface it as expected behavior during deployment.

**Plugin internals are a black box** → The custom code was fully inspectable. The plugin's auth code generation and token signing are internal to the package. Mitigation: the plugin is a first-party Better Auth package, actively maintained alongside the auth library.

**`@better-auth/oauth-provider` may not be on the installed `better-auth` version** → Must verify the package exists and is compatible with `better-auth@^1.6.17` before starting. If it isn't published yet, fall back to the built-in `oidcProvider` plugin (deprecated but present in the installed version).

## Migration Plan

1. Install `@better-auth/oauth-provider` (or confirm `oidcProvider` fallback)
2. Configure plugin in `lib/auth.ts` with `trustedClients`
3. Add new env vars for per-client secrets; remove `JWT_SECRET` and `OAUTH_CLIENTS`
4. Remove all files under `features/oauth2/`
5. Update `lib/api/index.ts` — remove the three Hono route mounts
6. Update `useSignIn`, `useSignUp` — remove `handlePostAuthRedirect` call
7. Update `signOut` — remove refresh token revocation block
8. Update `db/schema/index.ts` — remove `authCode` and `refreshToken` table definitions, remove `uuidv7` import
9. Run `db:generate` to create a DROP TABLE migration; run `db:migrate`
10. Remove `uuidv7` from `package.json`
11. Coordinate downstream apps to update their OAuth endpoint URLs

**Rollback**: The old code is preserved in git. If the plugin doesn't work as expected, revert the commit, restore the old env vars, and re-run the previous migration state. No data migration is involved (only dropping tables), so rollback is a git revert + DB restore from backup.

## Open Questions

- Is `@better-auth/oauth-provider` published and compatible with `better-auth@^1.6.17`? If not, use `oidcProvider` from the installed package as a fallback.
- Does the plugin's `after` hook fire correctly in the Next.js + Hono routing setup, or does it need a dedicated Next.js middleware?
