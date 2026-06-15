## Context

The SSO uses `better-auth` with the `@better-auth/oauth-provider` plugin. The plugin ships two complementary pieces:

- **Server side**: "before" and "after" hooks. The "before" hook reads `oauth_query` from the POST body, verifies the signed OAuth params, and stores the authorization context in per-request `AsyncLocalStorage`. The "after" hook fires whenever a session cookie is SET in the response — it picks up the stored context and calls `runOAuth2Authorize`, which emits a JSON response `{ redirect: true, url: "<app-callback-url>" }` instead of an HTTP redirect (because the request is a browser fetch, not a top-level navigation).
- **Client side**: `oauthProviderClient()` fetch plugin. Its `onRequest` hook intercepts every non-GET POST request when the current page URL has `sig` in the search string. It adds `oauth_query: buildSignedOAuthQuery(window.location.search)` to the request body automatically — no call site needs to pass it manually.

The current flow has three bugs:

1. `useContinueAs` navigates to `/api/auth/oauth2/authorize?...` via a browser GET. If the client has `skipConsent = false`, the authorize endpoint issues a consent prompt and redirects back to `consentPage` (`/sign-in`). The account picker shows again, the user clicks "Continue as" again, and the loop repeats.

2. After `authClient.signIn.email()` resolves during an OAuth2 flow, the server has already completed the authorization and embedded the callback URL in the response. `useSignIn.onSuccess` ignores `res.data` entirely and calls `continueAs()`, triggering a second, redundant authorization request.

3. Between mutation settlement and the navigation triggered by `continueAs()`, `broadcastSessionUpdate` fires asynchronously and updates the session atom, causing `SignInPage` to briefly render the `AccountPickerCard`.

No server-side changes are needed. The `@better-auth/oauth-provider` plugin's intended path is already wired up:
- `POST /api/auth/oauth2/continue` with `{ selected: true }` → plugin auto-attaches `oauth_query` → server "before" hook verifies → server calls `runOAuth2Authorize` → returns `{ redirect: true, url }`.
- `POST /sign-in/email` already auto-completes the OAuth2 flow via the "after" hook when `oauth_query` is present.

## Goals / Non-Goals

**Goals:**
- Fix the consent-redirect loop when a logged-in user clicks "Continue as"
- Fix the double-authorization after sign-in form submission during an OAuth2 flow
- Prevent the `AccountPickerCard` from flashing after sign-in

**Non-Goals:**
- Server-side changes to `lib/auth.ts`
- Consent UI (consent is skipped via `skipConsent` on the client config; the loop fix makes this moot)
- Changes to the sign-up flow
- Changes to `useSwitchAccount` (sign-out path is unaffected)

## Decisions

### Decision 1: POST to `/api/auth/oauth2/continue` for "Continue as" (not GET to `/api/auth/oauth2/authorize`)

`/api/auth/oauth2/continue` is the endpoint the plugin exposes specifically for "user confirmed their existing session." It expects a POST with `{ selected: true }`. The `oauthProviderClient` plugin auto-attaches `oauth_query`, the server verifies it, runs `runOAuth2Authorize`, and returns `{ redirect: true, url }`. The client then reads `url` and navigates.

**Alternative considered**: Strip `sig`/`exp`/`ba_*` params and GET `/api/auth/oauth2/authorize`. This is what `useContinueAs` currently does, and it is the cause of the consent-redirect loop (GET authorize goes through the full authorize endpoint, which re-evaluates consent).

**Why the alternative fails**: `runOAuth2Authorize` in the "continue" path bypasses the consent check (`selected: true` signals the user already confirmed). The GET authorize path does not.

### Decision 2: Navigate to `res.data.url` after sign-in (not call `continueAs()`)

When `authClient.signIn.email()` returns `{ data: { redirect: true, url: "..." } }`, the server "after" hook has already run `runOAuth2Authorize` and produced a valid auth code embedded in `url`. The client must navigate to `url` directly.

`useSignIn` will inspect `data`: if `data?.redirect === true`, use `window.location.href = data.url` (a full browser navigation, matching the intent). If no redirect in data, fall through to the existing `onSuccess` callback or home redirect.

This removes the need to pass `onSuccess: continueAs` from `SignInPage` to `useSignIn`. `useSignIn` becomes self-contained for the OAuth2 case.

**Why `window.location.href` instead of `router.push`**: The destination (`data.url`) is the external app's callback URL (e.g., `http://localhost:3006/api/auth/sso/callback/internal?code=...`). `router.push` only works for same-origin Next.js routes. The external-app URL requires a real browser navigation.

### Decision 3: `isRedirecting` state to suppress account picker flash

After sign-in or "Continue as", there is a brief window between mutation settlement and full browser navigation where React may re-render with the updated session, showing `AccountPickerCard`. Setting `isRedirecting = true` immediately on initiation and rendering nothing (or a loading state) during that window eliminates the flash.

The state lives in `SignInPage` (alongside `forceForm`). When `isRedirecting` is true, render `null` instead of the account picker or form. Navigation will complete within milliseconds, so no timeout is needed.

## Risks / Trade-offs

**Navigation timing**: `window.location.href` assignments are synchronous but the actual browser unload is async. During the gap, React could re-render. The `isRedirecting` flag prevents visible flicker.

**`data.url` trust**: The URL comes from the SSO server response over localhost/HTTPS. It is not user-controlled. No sanitization is needed beyond the type check (`redirect === true`).

**`/api/auth/oauth2/continue` without OAuth context**: If a user arrives at `/sign-in` without OAuth params (no `sig`, no `client_id`), clicking "Continue as" calls `useContinueAs` which checks `searchParams.has("client_id")` before posting. When absent, it falls back to `window.location.href = "/"` as before.

**`better-auth` version coupling**: The shape `{ redirect: true, url }` is from `@better-auth/oauth-provider` internals. This is read from the same package already in use. If the package bumps its response shape, `useSignIn` would need updating — but this is already true of `useContinueAs`'s current approach.

## Migration Plan

Client-only changes; no DB migrations or endpoint additions. Deploy as a single commit. No feature flags or rollback steps needed — the sign-in page is the only affected surface.
