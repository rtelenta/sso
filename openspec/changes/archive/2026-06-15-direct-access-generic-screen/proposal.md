## Why

This SSO is intended to be used exclusively via OAuth2 Authorization Code flow — users should never navigate to it directly. When someone lands on the app root without an active OAuth session or flow, they see the sign-in UI with no context, which is confusing and potentially misleading. A generic "not intended for direct access" screen makes the purpose clear.

## What Changes

- A new landing page is shown at `/` (or any unauthenticated top-level route) when there is no ongoing OAuth2 flow (`client_id` / `redirect_uri` absent)
- The screen explains the app is an SSO provider, not a standalone app, and offers no sign-in options
- Existing OAuth2-initiated flows continue to work unchanged (redirect to sign-in when `client_id` is present)

## Capabilities

### New Capabilities

- `direct-access-screen`: Generic landing screen shown to users who visit the SSO app directly without an active OAuth flow. No sign-in action available; copy explains the app is an internal SSO.

### Modified Capabilities

- `sign-in`: The sign-in page/flow should only be reachable when an OAuth2 flow is in progress (i.e., `client_id` and `redirect_uri` are present). Direct `/` access without those params now routes to the new screen instead.

## Impact

- **UI**: New page component and route under `features/direct-access/`; minimal change to sign-in routing logic
- **API**: No API changes
- **DB schema**: No schema changes
- **Dependencies**: No new dependencies
- **Env vars**: None required

## Non-goals

- Blocking authenticated users from seeing their session state
- Admin or diagnostic UI at the root
- Whitelisting specific IPs or referrers
