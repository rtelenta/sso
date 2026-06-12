## Why

`lib/api/routes/` contains Hono route handlers with OAuth2 business logic (auth code exchange, JWT signing, refresh token management, OAuth pending cookie). Business logic in `lib/` violates the project convention that `lib/` is generic shared code and domain logic lives in `features/<domain>/`. The mismatch makes the `features/oauth2/` feature incomplete and forces future OAuth2 work to be split across two locations.

## What Changes

- Move `lib/api/routes/oauth.ts` → `features/oauth2/api/oauth.ts`
- Move `lib/api/routes/token.ts` → `features/oauth2/api/token.ts`
- Update `lib/api/index.ts` to import from the new locations (file stays — it is thin infrastructure with no business logic)
- Delete the now-empty `lib/api/routes/` directory

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None — this is a pure code reorganisation. The API surface (`GET /api/oauth/start`, `POST /api/token`, `POST /api/token/refresh`) and all runtime behavior remain identical.

## Non-goals

- No changes to route paths, request/response shapes, or any runtime behavior
- No changes to `lib/api/index.ts` beyond the import paths
- No changes to `lib/auth.ts`, `features/oauth2/utils/`, or `features/oauth2/actions/`
- No changes to the Next.js route handler at `app/api/[...route]/route.ts`

## Impact

- **UI**: no
- **API**: no (paths and contracts unchanged)
- **DB schema**: no
- **better-auth plugins**: no
- **Env vars**: no
- **Files touched**: `lib/api/routes/oauth.ts` (deleted), `lib/api/routes/token.ts` (deleted), `lib/api/index.ts` (import paths updated), two new files created under `features/oauth2/api/`
