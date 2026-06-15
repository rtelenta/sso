## MODIFIED Requirements

### Requirement: "Continue as" button completes the OAuth2 flow for the existing session
When the user clicks "Continue as <name>" on the account picker, the system SHALL complete the pending OAuth2 authorization flow by POSTing to `/api/auth/oauth2/consent` with `{ accept: true }`. The `oauthProviderClient` plugin SHALL automatically attach the signed OAuth params (`oauth_query`) from the current URL. The server SHALL upsert an `oauthConsent` record for the (user, client) pair and then call `authorize()`, which issues the authorization code and returns `{ redirect: true, url: "<callback-url>" }`. The client SHALL navigate to `url`. The signed OAuth params from the URL (the `sig` query param injected by `@better-auth/oauth-provider`) MUST NOT be stripped before the POST — the plugin handles them. While the request is in flight and until navigation completes, the sign-in page SHALL render nothing visible to prevent flickering.

#### Scenario: Already-logged-in user continues OAuth2 flow via account picker
- **WHEN** a user with an active session arrives at `/sign-in` via an OAuth2 authorize redirect (URL contains signed params with `sig`)
- **AND** the user clicks "Continue as <name>"
- **THEN** the system POSTs to `/api/auth/oauth2/consent` with `{ accept: true }`
- **AND** the server creates or updates the consent record for the user + client
- **AND** the server returns `{ redirect: true, url: "<app-callback-url>" }`
- **AND** the browser is navigated to `<app-callback-url>` (e.g., `https://app1/callback?code=<code>&state=xyz`)
- **AND** no consent redirect loop occurs

#### Scenario: Already-logged-in user continues without OAuth context is redirected to home
- **WHEN** a user with an active session navigates directly to `/sign-in` (no `sig` in URL, no `client_id`)
- **AND** the user clicks "Continue as <name>"
- **THEN** the user is redirected to `/` (SSO home page)
