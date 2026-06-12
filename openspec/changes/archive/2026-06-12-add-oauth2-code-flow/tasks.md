## 1. Database Schema

- [x] 1.1 Create `db/schema/auth-code.ts` with `authCode` table (id UUID v7 PK, code text unique, userId UUID FK, redirectUri text, expiresAt timestamptz, usedAt timestamptz nullable)
- [x] 1.2 Create `db/schema/refresh-token.ts` with `refreshToken` table (id UUID v7 PK, token text unique, userId UUID FK, expiresAt timestamptz, revokedAt timestamptz nullable)
- [x] 1.3 Export both tables from `db/schema/index.ts`
- [x] 1.4 Generate Drizzle migration (`bun drizzle-kit generate`) and apply it (`bun drizzle-kit migrate`)

## 2. Environment & Constants

- [x] 2.1 Add `JWT_SECRET` and `OAUTH_CLIENTS` to `.env.local` (development values)
- [x] 2.2 Export `JWT_SECRET` and `OAUTH_CLIENTS` (parsed JSON) from `lib/constants.ts`

## 3. OAuth2 Pending Cookie Utility

- [x] 3.1 Create `features/oauth2/utils/oauthPendingCookie.ts` with `setOAuthPendingCookie(redirect_uri, state, client_id)` and `getOAuthPendingCookie(request)` — signs/verifies with HMAC-SHA256 using `BETTER_AUTH_SECRET`, 10-min TTL
- [x] 3.2 Create `features/oauth2/utils/generateAuthCode.ts` (server-only) — generates 32-byte random hex, inserts into `auth_code` table, returns the code string

## 4. Sign-in / Sign-up Page — OAuth2 Param Intake

- [x] 4.1 In the sign-in page Server Component (`app/sign-in/page.tsx` → `features/auth/pages/SignInPage.tsx`), read `redirect_uri`, `state`, `client_id` from `searchParams` and call `setOAuthPendingCookie` if `redirect_uri` is present
- [x] 4.2 Apply the same intake in the sign-up page Server Component

## 5. Post-Auth Redirect Logic

- [x] 5.1 In `useSignIn` hook (`features/auth/hooks/useSignIn.ts`), after a successful mutation, call a new server action `handlePostAuthRedirect()` that reads the `oauth_pending` cookie; if valid, calls `generateAuthCode`, clears the cookie, and returns the redirect URL (`{redirect_uri}?code={code}&state={state}`); otherwise returns the default destination
- [x] 5.2 Apply the same post-auth logic in `useSignUp` hook
- [x] 5.3 Create the server action `features/oauth2/actions/handlePostAuthRedirect.ts` implementing the logic above

## 6. Token Endpoint — POST /api/token

- [x] 6.1 Create `lib/api/routes/token.ts` with a Hono router; add `POST /token` handler
- [x] 6.2 In the handler: validate JSON body (`grant_type`, `code`, `redirect_uri`, `client_id`, `client_secret`) using a zod schema
- [x] 6.3 Validate `client_id` + `client_secret` against `OAUTH_CLIENTS`; return 401 on mismatch
- [x] 6.4 Look up auth code in DB; reject (400) if not found, already used, or expired; set `used_at` on success
- [x] 6.5 Validate `redirect_uri` matches stored value; return 400 if mismatch
- [x] 6.6 Sign a JWT (`{ sub: userId, email }`, 15-min TTL) using `JWT_SECRET` with HS256
- [x] 6.7 Generate 64-byte hex refresh token, insert into `refresh_token` table (30-day TTL)
- [x] 6.8 Return `{ access_token, refresh_token, token_type: "Bearer", expires_in: 900 }`
- [x] 6.9 Register the token router on the Hono app in `lib/api/index.ts`

## 7. Token Refresh Endpoint — POST /api/token/refresh

- [x] 7.1 Add `POST /token/refresh` to `lib/api/routes/token.ts`
- [x] 7.2 Validate JSON body (`refresh_token`, `client_id`, `client_secret`) using zod
- [x] 7.3 Validate client credentials; return 401 on mismatch
- [x] 7.4 Look up refresh token in DB; reject (401) if not found, revoked (`revoked_at IS NOT NULL`), or expired
- [x] 7.5 Sign and return a new access JWT `{ access_token, token_type: "Bearer", expires_in: 900 }`
