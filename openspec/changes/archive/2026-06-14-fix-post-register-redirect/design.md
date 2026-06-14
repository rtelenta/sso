## Context

When the `@better-auth/oauth-provider` plugin needs to authenticate a user, it redirects to the configured `loginPage` (`/sign-in`) with signed query params appended: `client_id`, `redirect_uri`, `state`, `response_type`, `exp`, and `sig`.

The `oauthProviderClient` better-auth client plugin (already installed in `lib/auth-client.ts`) has a `fetchPlugin` that fires before every POST request. It reads `window.location.search`, calls `buildSignedOAuthQuery`, and — if `sig` is present — adds the full signed query string as `oauth_query` to the request body. The server hook then verifies the signature and, after a successful session is created, continues the OAuth2 flow and redirects to the app callback URL.

This mechanism works correctly for sign-in (`/sign-in?...&sig=...` → `authClient.signIn.email()` includes `oauth_query` → server redirects to app).

**Why it breaks for registration:**

1. `SignInPage.tsx` links to `/sign-up` without forwarding the current URL's query params (line 87: `<Link href="/sign-up">`).
2. The user lands on `/sign-up` with no query string, so `window.location.search` has no `sig`.
3. `buildSignedOAuthQuery` returns `undefined` → no `oauth_query` in the `signUp.email()` request body.
4. The server creates the account and session but has no OAuth state to continue — the client falls back to `router.push("/")`.

**Secondary issue (dead code):** `app/(auth)/sign-up/page.tsx` contains a server-side guard that redirects to `/api/oauth/start` when `redirect_uri` is present in query params. That endpoint does not exist. This code was never reachable (the sign-in link never passed params) but would break if params were forwarded.

## Goals / Non-Goals

**Goals:**
- After registration during an OAuth2 flow, redirect the user to the originating app's callback URL with the auth code.
- Preserve the existing direct-registration UX (no OAuth context → redirect to `/`).

**Non-Goals:**
- Fixing sign-in redirect (already works via the same `oauthProviderClient` mechanism).
- Handling magic-link or Google OAuth registration paths.
- Creating or registering new OAuth clients.

## Decisions

### Decision: Forward search params from sign-in to sign-up via the link href

The sign-in link to the sign-up page must carry the signed OAuth params so that `window.location.search` on the sign-up page contains `sig`. This enables `oauthProviderClient` to automatically attach `oauth_query` when `signUp.email()` is called.

**Why not pass `oauth_query` manually:** The `oauthProviderClient` plugin already handles this automatically when the URL has `sig`. Manual wiring would duplicate logic and diverge from the sign-in pattern.

**Why not use a cookie/server-side session to carry the OAuth state:** The plugin already has its own signed-param mechanism. We should use it rather than invent a parallel one.

**Implementation:** In `SignInPage.tsx`, use `useSearchParams()` (Next.js) to read the current query string and forward it to the `/sign-up` link href. Since `SignInPage.tsx` is already `"use client"`, `useSearchParams()` is available.

Sign-up link before:
```tsx
<Link href="/sign-up">
```
After:
```tsx
// read current OAuth params and forward them so the sign-up page
// has window.location.search with sig, enabling oauthProviderClient
const searchParams = useSearchParams();
const search = searchParams.toString();
<Link href={search ? `/sign-up?${search}` : "/sign-up"}>
```

### Decision: Remove the dead `/api/oauth/start` redirect from the sign-up page

The guard in `app/(auth)/sign-up/page.tsx` would redirect to a non-existent endpoint if params were forwarded. Remove it entirely. The `oauthProviderClient` mechanism on the client side is the correct hook for post-registration OAuth continuation — no server-side redirect is needed.

## Risks / Trade-offs

- **Signed param expiry** → The plugin sets `exp` on the params (default 600s / 10 min). If the user spends more than 10 min on the sign-in page before clicking Register, the params will be expired and the OAuth flow will fail. Mitigation: same risk already exists for sign-in; plugin handles it with an error.
- **URL length** → Forwarding all signed OAuth params adds ~300 bytes to the sign-up URL. No practical concern.
- **No DB changes, no API changes, no new dependencies** — the fix is purely in two files.
