## Why

When a logged-in user is redirected from an external app to the SSO's OAuth2 sign-in URL, the account picker appears but clicking "Continue as" loops back to the same page instead of completing the OAuth2 flow. This happens because `useContinueAs` posts to `/oauth2/continue` with `{ selected: true }` — the `selected` action is for the `select_account` prompt, not for bypassing consent. The server calls `authorize()` without a consent record, which redirects back to the consent page (`/sign-in`), creating an infinite loop that appears to the user as a session being lost.

Additionally, user debugging revealed a `better-auth.state` cookie (from a prior flow) that is present when the session appears invalid — flagged here as a secondary observation requiring investigation.

## What Changes

- Replace the `useContinueAs` mechanism: POST to `/api/auth/oauth2/consent` with `{ accept: true }` instead of `/oauth2/continue` with `{ selected: true }`
- The consent endpoint creates the `oauthConsent` record (on first use) then calls `authorize()`, which issues the authorization code and redirects to the callback — regardless of whether `client.skipConsent` is true or false

## Non-goals

- Changes to the server-side OAuth2 provider configuration (`lib/auth.ts`)
- Changes to client registration or `skipConsent` flag on existing clients
- Fixing unrelated `better-auth.state` cookie generation (needs separate investigation)

## Capabilities

### New Capabilities
_(none)_

### Modified Capabilities
- `sign-in-account-picker`: "Continue as" action changes from `/oauth2/continue` (selected) to `/oauth2/consent` (accept) to correctly complete the OAuth2 authorization flow

## Impact

- `features/auth/hooks/useContinueAs.ts` — change fetch target and body
- `openspec/specs/sign-in-account-picker/spec.md` — update "Continue as" requirement
