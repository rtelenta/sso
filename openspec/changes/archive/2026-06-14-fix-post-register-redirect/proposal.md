## Why

When a user arrives at the SSO via an OAuth2 redirect (with `redirect_uri` and `state` params) and chooses to register instead of sign in, after registration they land on the SSO home page rather than being sent back to the originating app. The pending OAuth2 authorization request is lost at the register step, breaking the sign-up flow for downstream apps.

## What Changes

- After successful registration, the SSO reads the pending OAuth2 authorization context (preserved by `@better-auth/oauth-provider`) and redirects the user through the authorization flow to the app's callback URL.
- If there is no pending OAuth2 context (i.e., the user registered directly on the SSO without coming from an app), the current behaviour (redirect to SSO home) is preserved.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `oauth2-code-flow`: Add requirement that after successful registration during an OAuth2 flow, the user is redirected to the app callback (not the SSO home page). The pending authorization request must be honoured post-registration the same way it is post-sign-in.

## Impact

- `features/auth/` — registration success handler must check for a pending OAuth2 context and redirect accordingly.
- No DB schema changes.
- No new environment variables.
- Touches UI (register page/component) and potentially the API layer if the post-registration redirect is handled server-side.
- No new better-auth plugins required.

## Non-goals

- Changing the sign-in post-redirect behaviour (already works).
- Supporting social (Google) registration redirect — same fix applies but is a separate test scenario.
- Multi-app consent screens.
