## Why

When a user is redirected to the SSO sign-in page from a downstream app but already has an active SSO session, they are presented with the standard email/password form — requiring them to re-enter credentials they've already proven. This creates unnecessary friction and a confusing UX. The fix is a Google-style account picker screen that surfaces their existing session and lets them continue in one click, while also supporting a "use a different account" escape hatch.

## What Changes

- The sign-in page detects an active session on load
- If a session exists, show an account picker UI instead of the sign-in form:
  - Display the logged-in user's name and email
  - "Continue as <name>" button — proceeds through the OAuth2 flow and redirects back to the originating app
  - "Use a different account" button — signs the current user out, then shows the standard sign-in form
- If no session exists, show the standard sign-in form (current behavior, unchanged)
- Both the continue and sign-in/register paths must complete the OAuth2 redirect back to the originating app

## Capabilities

### New Capabilities
- `sign-in-account-picker`: Account picker screen shown on the sign-in page when the user already has an active SSO session — allows one-click continue or switch account with logout

### Modified Capabilities
- `oauth2-code-flow`: The already-logged-in case now resolves the OAuth2 flow immediately via the account picker continue path

## Impact

- `features/auth/pages/SignInPage.tsx` — add session check and conditional rendering of account picker vs sign-in form
- `features/auth/hooks/` — new hook to check current session and to perform the "continue as" OAuth2 handshake
- `lib/auth-client.ts` — uses existing `authClient.getSession()` and sign-out methods
- No DB schema changes, no new env vars, no API changes
- Touches: UI only (no new routes, no new API endpoints)

## Non-goals

- Multi-account selection (only one active session exists at a time in this SSO)
- Persisting "remembered accounts" across logouts
- Changing logout behavior outside the sign-in page account picker flow
