## 1. Add the discovery route

- [x] 1.1 Create `app/.well-known/oauth-authorization-server/[...path]/route.ts` exporting `export const GET = auth.handler` (import `auth` from `@/lib/auth`)

## 2. Silence the warning

- [x] 2.1 In `lib/auth.ts`, add `silenceWarnings: { oauthAuthServerConfig: true }` to the `oauthProvider({...})` options

## 3. Verify

- [x] 3.1 Run `npm run build` and confirm the `oauthAuthServerConfig` warning is gone and the build succeeds
