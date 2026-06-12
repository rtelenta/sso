## 1. Create Route Files Under features/oauth2/api/

- [x] 1.1 Create `features/oauth2/api/oauth.ts` with the contents of `lib/api/routes/oauth.ts` (export name unchanged: `oauthRouter`)
- [x] 1.2 Create `features/oauth2/api/token.ts` with the contents of `lib/api/routes/token.ts` (export name unchanged: `tokenRouter`)

## 2. Update Assembly Point

- [x] 2.1 In `lib/api/index.ts`, update import paths: `@/lib/api/routes/oauth` → `@/features/oauth2/api/oauth` and `@/lib/api/routes/token` → `@/features/oauth2/api/token`

## 3. Delete Old Files

- [x] 3.1 Delete `lib/api/routes/oauth.ts`
- [x] 3.2 Delete `lib/api/routes/token.ts`
- [x] 3.3 Delete the now-empty `lib/api/routes/` directory

## 4. Verification

- [x] 4.1 Run `bun run build` — confirm no TypeScript errors and clean compile
- [x] 4.2 Confirm `GET /api/health`, `GET /api/oauth/start`, `POST /api/token`, and `POST /api/token/refresh` all resolve correctly (curl or browser)
