## Why

The `oauthProvider` plugin from `@better-auth/oauth-provider` logs a build-time warning on every render because the RFC 8414 canonical metadata URL (`/.well-known/oauth-authorization-server/api/auth`) is not registered as a Next.js route. Without it, OAuth clients that perform discovery via the standard path cannot find the server metadata.

## What Changes

- Add a Next.js route handler at `app/.well-known/oauth-authorization-server/[...path]/route.ts` that delegates GET requests to the better-auth handler, satisfying both the RFC 8414 requirement and the plugin's warning condition.
- Set `silenceWarnings: { oauthAuthServerConfig: true }` in `lib/auth.ts` once the route is in place.

## Capabilities

### New Capabilities
- `oauth-server-metadata`: Exposes `/.well-known/oauth-authorization-server/api/auth` as a discoverable endpoint per RFC 8414.

### Modified Capabilities
<!-- No existing spec-level requirements are changing. -->

## Impact

- **Routing**: New file `app/.well-known/oauth-authorization-server/[...path]/route.ts`.
- **Auth config**: `lib/auth.ts` — add `silenceWarnings.oauthAuthServerConfig: true` to the `oauthProvider` options.
- **API / DB / UI**: None.
- **Env vars**: None.
- **better-auth plugin**: `oauthProvider` (already in use) — no version change required.

## Non-goals

- Implementing OpenID Connect discovery (`/.well-known/openid-configuration`) — not needed since this SSO does not expose OIDC.
- Changing any existing auth flows or client registration logic.
