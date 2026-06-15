## 1. Remove bypassed storeClientSecret from lib/auth.ts

- [x] 1.1 Delete the `storeClientSecret` block (lines 23-26) from the `oauthProvider` call in `lib/auth.ts`, leaving the plugin with no custom secret-storage override
- [x] 1.2 Verify the build compiles cleanly with no TypeScript errors (`bun run build` or `bun tsc --noEmit`)

## 2. Update seed to hash secrets before insertion

- [x] 2.1 In `db/seed.ts`, import `createHash` from `@better-auth/utils/hash` and write a local `hashSecret` helper that mirrors the library's default hasher: `SHA-256` digest of the UTF-8 encoded secret, returned as a hex string
- [x] 2.2 Replace `clientSecret: client.clientSecret` with `clientSecret: await hashSecret(client.clientSecret)` in the `db.insert(oauthClient).values(...)` call

## 3. Re-seed the database

- [x] 3.1 Clear existing OAuth client rows so the seed does not skip them: `DELETE FROM oauth_client;` (run via `bun db:studio` or psql)
- [x] 3.2 Run `bun db:seed` and confirm each client logs "Seeded <clientId>" with no errors

## 4. Verify end-to-end OAuth2 flow

- [x] 4.1 Start the dev server and trigger the OAuth2 Authorization Code flow from a downstream app (or replay it via the Bruno collection); confirm the `POST /api/auth/oauth2/token` exchange returns a valid JWT
- [x] 4.2 Confirm that using an incorrect `client_secret` returns HTTP 401
