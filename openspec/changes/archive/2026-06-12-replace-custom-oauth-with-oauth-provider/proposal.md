## Why

The SSO has ~250 lines of hand-rolled OAuth 2.0 code (auth code generation, JWT signing, token exchange, refresh tokens, pending cookie logic, logout) that duplicates what `@better-auth/oauth-provider` provides out-of-the-box — and the custom code lacks OIDC compliance, a discovery endpoint, and proper client storage, making it harder for downstream apps to integrate.

## What Changes

- **BREAKING**: OAuth endpoints change paths — `/api/oauth/start` → `/api/auth/oauth2/authorize`, `/api/token` → `/api/auth/oauth2/token`, `/api/token/refresh` → `/api/auth/oauth2/token` (with `grant_type=refresh_token`), `/api/logout` → `/api/auth/oauth2/revoke`
- Add `@better-auth/oauth-provider` plugin to `lib/auth.ts`; configure trusted clients directly in plugin config
- Delete entire `features/oauth2/` folder (all custom routes, utilities, server action)
- Remove `handlePostAuthRedirect` calls from `useSignIn` and `useSignUp` hooks — plugin handles post-auth redirect automatically via its `after` hook
- Simplify `signOut` action — remove manual refresh token revocation against custom table; plugin manages its own tokens
- Drop `auth_code` and `refresh_token` tables from schema; add Drizzle migration to drop them
- Remove `JWT_SECRET` and `OAUTH_CLIENTS` from `lib/constants.ts` and `.env`
- Remove `uuidv7` package (only used by the deleted tables and routes)
- Add new OIDC discovery endpoint: `GET /.well-known/openid-configuration` (provided by plugin for free)

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `oauth2-code-flow`: All requirements change — custom implementation replaced by `@better-auth/oauth-provider`; endpoint paths, token management, client registration, and DB schema all differ

## Impact

- **Deleted**: `features/oauth2/` (6 files), `auth_code` and `refresh_token` DB tables
- **Modified**: `lib/auth.ts`, `lib/api/index.ts`, `lib/constants.ts`, `db/schema/index.ts`, `features/auth/hooks/useSignIn.ts`, `features/auth/hooks/useSignUp.ts`, `features/auth/actions/signOut.ts`
- **New DB migration**: DROP TABLE `auth_code`, DROP TABLE `refresh_token`
- **Dependencies removed**: `uuidv7`
- **Dependencies added**: `@better-auth/oauth-provider`
- **Env vars removed**: `JWT_SECRET`, `OAUTH_CLIENTS`
- **Env vars added**: none (client config moves into `lib/auth.ts`)

## Non-goals

- OIDC/SAML enterprise federation (orgs plugging in their own IdP)
- Consent screen UI (internal trusted clients, consent is skipped)
- Dynamic client registration endpoint
- Scopes beyond the default (`openid`, `profile`, `email`)
