## Context

The SSO sign-in page (`/sign-in`) is the `loginPage` for `@better-auth/oauth-provider`. When a downstream app initiates an OAuth2 flow, unauthenticated users are redirected here. However, if a user already has an active SSO session and arrives at `/sign-in` (e.g., from a second app), they currently see the raw sign-in form — requiring them to re-enter credentials they already proved.

The plugin appends signed OAuth params to the login redirect URL: `client_id`, `redirect_uri`, `state`, `response_type`, plus `sig`, `exp`, and `ba_iat` (signature metadata). Crucially, all the original OAuth authorize params are present in `window.location.search` when the user lands on `/sign-in`. This means we can reconstruct the authorize request client-side.

## Goals / Non-Goals

**Goals:**
- Show an account picker (Google-style) on `/sign-in` when the user already has an active session
- "Continue as" completes the OAuth2 flow for the existing session and redirects to the app callback
- "Use a different account" signs out the current user and reveals the sign-in form in-place (no redirect away from `/sign-in`, OAuth params preserved)
- Direct navigation to `/sign-in` with no OAuth context: account picker "Continue as" redirects to `/`

**Non-Goals:**
- Multi-account selection (single active session at a time)
- Persisting a "remembered accounts" list across logouts
- Server-side session check or middleware redirect

## Decisions

### Session detection: `authClient.useSession()` (client-side)

`SignInPage` is already `"use client"`. `authClient.useSession()` is the React hook provided by `better-auth/client` — it uses nanostores under the hood and returns `{ data, isPending, error }`.

While the session loads (`isPending: true`), the page renders nothing to avoid flashing the sign-in form before redirecting. Once resolved, if `data` is non-null, the account picker is shown; otherwise the sign-in form is shown.

Alternative considered: server-side session check with a redirect in the page Server Component. Rejected because `SignInPage` is already a client component (uses `useSearchParams()`), and adding a Server Component shell would split rendering unnecessarily.

### "Continue as" implementation: redirect to `/api/auth/oauth2/authorize`

When the user clicks "Continue as <name>", strip the plugin-added params (`sig`, `exp`, `ba_iat`, `ba_pl`) from the current URL search params and navigate to `/api/auth/oauth2/authorize?{remaining}`. Since the user has an active session cookie, the plugin will recognize the authenticated state and immediately redirect to the app callback with an auth code.

Navigation uses `window.location.href` (not `router.push`) because the authorize endpoint responds with a redirect to an external URL — `window.location.href` ensures the browser follows the full redirect chain correctly.

If no OAuth params are present in the URL (`client_id` is absent), redirect to `/` instead.

Alternative considered: calling a custom API endpoint that re-enters the OAuth2 flow via the server action. Rejected — unnecessary complexity. The authorize endpoint already handles the already-authenticated case.

### "Use a different account": client-side signout + local state toggle

The existing `signOut` server action redirects to `/` after revoking the session — unsuitable here since we need to stay on `/sign-in` with OAuth params intact. Instead, call `authClient.signOut()` (the client-side method) which revokes the session without redirecting.

`SignInPage` holds a `forceForm: boolean` state (default `false`). After `authClient.signOut()` resolves, set `forceForm = true`. The render logic: if `!session && !isPending` OR `forceForm` → show sign-in form.

### New component: `AccountPickerCard`

A new component at `features/auth/components/AccountPickerCard.tsx`. Receives the session user object as a prop (name + email) plus `onContinue` and `onSwitch` callbacks. Keeps the picker stateless; all logic lives in the hooks.

### New hooks

- `useSession` is consumed directly from `authClient.useSession()` — no wrapper needed
- `useContinueAs(searchParams)` — a plain function (not a mutation) that reads the search params and performs the `window.location.href` navigation; returned from a simple hook for testability
- `useSwitchAccount()` — wraps `authClient.signOut()` in a `useMutation`; on success, calls the provided `onSuccess` callback (sets `forceForm = true` in the page)

### Sign-in page Hono route for the `oauthProviderClient` (unchanged)

The `oauthProviderClient` fetch plugin fires on POST requests when `sig` is present in `window.location.search`. Since "Continue as" is a GET redirect (not a POST), the plugin is not involved in this path. The plugin remains relevant only for sign-in and sign-up form submissions.

## Risks / Trade-offs

- **Session loading flash**: A brief blank/loading state while `useSession()` resolves. Mitigation: render a skeleton card of the same height so the layout does not shift.
- **OAuth param mismatch**: If the plugin ever changes which params it includes in the sign-in redirect URL, the "Continue as" redirect may drop required params. This is a plugin-internal contract — monitor on plugin upgrades.
- **`authClient.signOut()` without redirect**: This is a client-side fetch to `/api/auth/sign-out`. If the request fails (network error), the UI should surface an error. The `useSwitchAccount` mutation's `isError` state handles this.

## Migration Plan

No DB changes, no new env vars, no API changes. Deploy is a standard Next.js deploy — no migration steps needed.

## Open Questions

None.
