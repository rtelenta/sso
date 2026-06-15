## Context

The `oauthProvider` plugin (`@better-auth/oauth-provider`) already implements the `/.well-known/oauth-authorization-server` handler internally and registers it under the better-auth base path (`/api/auth/.well-known/oauth-authorization-server`). Per RFC 8414, the canonical discovery URL is `/.well-known/oauth-authorization-server<issuer-path>`, which for this SSO resolves to `/.well-known/oauth-authorization-server/api/auth`.

Next.js has no route for that path, so any request to it 404s and the plugin logs the warning every time it initialises.

## Goals / Non-Goals

**Goals:**
- Register `/.well-known/oauth-authorization-server/api/auth` as a real Next.js GET route.
- Eliminate the runtime warning by setting `silenceWarnings.oauthAuthServerConfig: true`.

**Non-Goals:**
- OpenID Connect discovery endpoint (`/.well-known/openid-configuration`).
- Any changes to client registration, token issuance, or auth flows.

## Decisions

**Use a catch-all Next.js route handler that delegates to `auth.handler`.**

Create `app/.well-known/oauth-authorization-server/[...path]/route.ts` exporting `GET = auth.handler`. The catch-all `[...path]` segment is intentional: it matches both `/.well-known/oauth-authorization-server/api/auth` (the current issuer path) and any future issuer path change without requiring a route update.

The handler is `auth.handler` (the raw Next.js-compatible handler exported from better-auth), not the Hono `handle` wrapper used for `/api/[...route]`. The Hono layer owns `/api/*`; the `.well-known` route is a direct better-auth delegation.

Next.js page involved: `app/.well-known/oauth-authorization-server/[...path]/route.ts` (new file, no UI).

Alternative considered: a rewrite rule in `next.config.ts` pointing `/.well-known/oauth-authorization-server/api/auth` → `/api/auth/.well-known/oauth-authorization-server`. Rejected — rewrites are invisible to OAuth clients performing strict URL validation, and the better-auth handler checks the incoming URL path when building the metadata response.

**Silence the warning only after the route exists.**

Add `silenceWarnings: { oauthAuthServerConfig: true }` to the `oauthProvider` config in `lib/auth.ts`. This is the mechanism the plugin documents for confirming the route has been created.

## Risks / Trade-offs

- [Catch-all scope] The `[...path]` segment will match *any* path under `/.well-known/oauth-authorization-server/`. Requests for unrecognised paths will reach better-auth, which will return a 404 — no worse than today, and no security exposure.  
  → Mitigation: acceptable; no action needed.
