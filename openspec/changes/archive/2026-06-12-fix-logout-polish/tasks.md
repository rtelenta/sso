## 1. Session-Gate the Home Page

- [x] 1.1 In `app/page.tsx`, make the component `async` and import `headers` from `next/headers`, `auth` from `@/lib/auth`, and `Link` from `next/link`. Call `auth.api.getSession({ headers: await headers() })`. If session exists, render the sign-out form; otherwise render `<Link href="/sign-in">Sign in</Link>`.

## 2. Return 405 for Wrong-Method Requests

- [x] 2.1 In `features/oauth2/api/logout.ts`, after the `POST /logout` handler, add `logoutRouter.all("/logout", (c) => c.text("Method Not Allowed", 405))`.
- [x] 2.2 In `features/oauth2/api/token.ts`, after the `POST /token` handler add `tokenRouter.all("/token", ...)`, and after `POST /token/refresh` add `tokenRouter.all("/token/refresh", ...)` — both returning 405.
- [x] 2.3 In `features/oauth2/api/oauth.ts`, after the `GET /oauth/start` handler, add `oauthRouter.all("/oauth/start", (c) => c.text("Method Not Allowed", 405))`.

## 3. Verification

- [x] 3.1 Run `bun run build` — confirm no TypeScript errors.
- [x] 3.2 Start the dev server. Confirm `GET /api/logout` → 405, `GET /api/token` → 405, `GET /api/token/refresh` → 405, `POST /api/oauth/start` → 405.
- [x] 3.3 Confirm `GET /` (no session) → renders "Sign in" link. Sign up, then confirm `GET /` (with session cookie) → renders "Sign out" form.
