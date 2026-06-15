## Why

The account picker feature shipped with two broken behaviors: logged-in users still see the sign-in form (instead of the picker) on initial page load, and users who complete sign-in see the picker flash on screen before being redirected to the app. Both undermine the intended UX and break the expected OAuth2 flow.

## What Changes

- Fix initial render: account picker must show immediately when an active session exists — the sign-in form must never flash before the session check resolves
- Fix post-sign-in: after a successful credential sign-in inside an OAuth2 flow (`client_id` param present), redirect directly to `/api/auth/oauth2/authorize` without surfacing the account picker
- No changes to the account picker UI, `useContinueAs`, or `useSwitchAccount` behavior

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `sign-in-account-picker`: Two scenarios are broken — initial render shows form instead of picker, and post-sign-in shows picker briefly before redirect. Requirements remain the same; implementation must be corrected.

## Impact

- `features/auth/pages/SignInPage.tsx` — primary fix location
- `features/auth/hooks/useSignIn.ts` — add `onSuccess` callback to trigger `continueAs` after sign-in in OAuth context
- No DB schema, no API, no environment variable changes
- No new dependencies

## Non-goals

- Changing the account picker UI or copy
- Supporting social sign-in (Google) in the OAuth2 redirect flow
- Server-side session redirect (keeping fix client-side)
