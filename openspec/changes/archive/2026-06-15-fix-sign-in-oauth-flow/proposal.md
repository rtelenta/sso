## Why

Three bugs exist in the OAuth2 sign-in flow, all rooted in the client-side code not using the mechanisms `better-auth`'s `oauthProvider` plugin was designed for.

**Bug 1 / "Auto-logout": Already-logged-in user is sent back to the sign-in form.**
When an external app redirects a logged-in user to the SSO's OAuth2 authorize URL, the SSO's authorize endpoint checks consent. Because `consentPage: "/sign-in"` is configured, any consent prompt redirects the browser back to `/sign-in`. The account picker then displays, the user clicks "Continue as", and `useContinueAs` sends the browser to `/api/auth/oauth2/authorize` again — triggering the same consent check, the same redirect, and an infinite loop. The user sees the sign-in page repeatedly, which looks like being logged out.

**Bug 2: Account picker flashes briefly after submitting the sign-in form.**
When a user submits the sign-in form during an OAuth2 flow, the `oauthProviderClient` plugin automatically attaches `oauth_query` to the POST request. The server's "after" hook detects the new session cookie, runs the OAuth2 authorization, and returns a JSON response `{ redirect: true, url: "<app-callback-url>" }` instead of a real HTTP redirect (because it's a fetch request). `authClient.signIn.email()` resolves with `{ data: { redirect: true, url: "..." } }`. `useSignIn.onSuccess` ignores `data` entirely and calls `continueAs()`, which navigates to `/api/auth/oauth2/authorize` again — issuing a second, redundant auth code. Between mutation success and navigation, `broadcastSessionUpdate` fires asynchronously, the session atom updates, and the component re-renders showing the account picker before the navigation completes.

**Bug 3: After a fresh sign-in during an OAuth2 flow, `continueAs` navigates to `/api/auth/oauth2/authorize`, duplicating the authorization.**
Because the server "after" hook already completed the OAuth2 authorization and embedded the callback URL in the response, calling `continueAs()` creates a second code. The intended pattern is: read `data.url` from the server response and navigate there directly.

## What Changes

**`useContinueAs`** — change from a browser GET to `/api/auth/oauth2/authorize` to a POST to `/api/auth/oauth2/continue` with `{ selected: true }`. The `oauthProviderClient` plugin auto-attaches `oauth_query`, so the server can resolve the pending authorization and return `{ redirect: true, url }`. Navigate to the returned URL. When there is no OAuth context (`client_id` absent), keep the existing fallback to `/`.

**`useSignIn`** — after `authClient.signIn.email()` resolves, inspect `res.data`. If `res.data.redirect === true`, navigate to `res.data.url` directly (the server already completed the OAuth2 flow). Otherwise fall through to the existing `onSuccess` callback or home redirect. Remove the `onSuccess: isOAuthFlow ? continueAs : undefined` coupling from `SignInPage`.

**`SignInPage`** — remove the `isOAuthFlow` conditional that passes `continueAs` as `useSignIn`'s `onSuccess`. Add an `isRedirecting` state that is set to `true` when either `continueAs` or sign-in is in-flight, and render nothing (or a loading state) while redirecting to prevent the account picker from flashing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

**`sign-in-account-picker`** — The mechanism for completing an OAuth2 flow changes for both paths:

- "Continue as" now POSTs to `/api/auth/oauth2/continue` (not a GET to `/api/auth/oauth2/authorize`), eliminating the consent-redirect loop.
- Sign-in form submission during an OAuth2 flow navigates to `res.data.url` from the server response (not a second call to `continueAs`), eliminating the duplicate auth code and picker flash.
- The "Successful credential sign-in during OAuth2 flow" scenario wording changes: the redirect goes to the callback URL returned by the server (previously described as going to `/api/auth/oauth2/authorize`).

## Impact

- `features/auth/hooks/useSignIn.ts` — read `data.url` and navigate directly when `redirect === true`
- `features/auth/hooks/useContinueAs.ts` — POST to `/api/auth/oauth2/continue` instead of GET to `/api/auth/oauth2/authorize`
- `features/auth/pages/SignInPage.tsx` — remove `onSuccess` coupling; add `isRedirecting` guard
- `openspec/specs/sign-in-account-picker/spec.md` — update the "credential sign-in during OAuth2 flow" scenario to reflect the new redirect mechanism
