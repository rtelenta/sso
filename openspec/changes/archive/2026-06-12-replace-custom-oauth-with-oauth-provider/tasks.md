## 1. Verify and Install Plugin

- [x] 1.1 Check if `@better-auth/oauth-provider` is published and compatible with `better-auth@^1.6.17` — if not, confirm `oidcProvider` from the installed package is the fallback
- [x] 1.2 Install `@better-auth/oauth-provider` (or confirm built-in `oidcProvider` will be used) with `bun add @better-auth/oauth-provider`

## 2. Environment Variables

- [x] 2.1 Add per-client secret env vars to `.env` (e.g. `APP1_CLIENT_SECRET=...`) for each downstream app
- [x] 2.2 Remove `JWT_SECRET` and `OAUTH_CLIENTS` from `.env`
- [x] 2.3 Export new client secret constants from `lib/constants.ts` and remove `JWT_SECRET` and `OAUTH_CLIENTS` exports

## 3. Configure Plugin in lib/auth.ts

- [x] 3.1 Import `oAuthProvider` (or `oidcProvider`) in `lib/auth.ts`
- [x] 3.2 Add plugin to `betterAuth({ plugins: [...] })` with `loginPage: "/sign-in"`, `trustedClients` array (one entry per app with `clientId`, `clientSecret`, `redirectURLs`, `skipConsent: true`)

## 4. Remove Custom OAuth Routes from Hono

- [x] 4.1 Remove `oauthRouter`, `tokenRouter`, and `logoutRouter` imports and mounts from `lib/api/index.ts`

## 5. Delete features/oauth2/

- [x] 5.1 Delete `features/oauth2/api/oauth.ts`
- [x] 5.2 Delete `features/oauth2/api/token.ts`
- [x] 5.3 Delete `features/oauth2/api/logout.ts`
- [x] 5.4 Delete `features/oauth2/utils/oauthPendingCookie.ts`
- [x] 5.5 Delete `features/oauth2/utils/generateAuthCode.ts`
- [x] 5.6 Delete `features/oauth2/actions/handlePostAuthRedirect.ts`
- [x] 5.7 Remove the now-empty `features/oauth2/` directory

## 6. Update Auth Hooks

- [x] 6.1 Remove `handlePostAuthRedirect` import and call from `features/auth/hooks/useSignIn.ts` — `onSuccess` should just `router.push("/")`
- [x] 6.2 Remove `handlePostAuthRedirect` import and call from `features/auth/hooks/useSignUp.ts` — same simplification

## 7. Update signOut Action

- [x] 7.1 Remove the refresh token revocation block (DB query against `refreshToken` table) from `features/auth/actions/signOut.ts` — keep only `auth.api.signOut` and `redirect("/")`
- [x] 7.2 Remove `db`, `refreshToken`, `and`, `isNull`, `eq` imports that are no longer used in `signOut.ts`

## 8. Update DB Schema and Migrate

- [x] 8.1 Remove `authCode` and `refreshToken` table definitions from `db/schema/index.ts`
- [x] 8.2 Remove `uuidv7` import from `db/schema/index.ts`
- [x] 8.3 Run `bun db:generate` to generate a migration that drops `auth_code` and `refresh_token` tables and creates the plugin's new tables
- [x] 8.4 Run `bun db:migrate` to apply the migration

## 9. Remove uuidv7 Dependency

- [x] 9.1 Remove `uuidv7` from `package.json` dependencies with `bun remove uuidv7`

## 10. Verify

- [x] 10.1 Run `bun run build` — confirm no TypeScript errors
- [x] 10.2 Start the dev server and confirm `GET /.well-known/openid-configuration` returns a valid JSON document
- [x] 10.3 Test the full OAuth2 Authorization Code flow end-to-end: authorize → sign-in → callback with code → token exchange → refresh
