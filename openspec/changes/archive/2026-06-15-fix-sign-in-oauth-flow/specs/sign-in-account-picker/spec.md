## MODIFIED Requirements

### Requirement: Completing sign-in during an OAuth2 flow redirects directly to the app
When a user signs in via the credential form while an OAuth2 authorization flow is in progress (i.e., a `client_id` query param is present), the system SHALL redirect the browser directly to the originating app's callback URL upon successful sign-in. The server completes the OAuth2 authorization inline (via the `oauthProvider` "after" hook) and returns `{ redirect: true, url: "<callback-url>" }` in the sign-in response. The client SHALL read `url` from that response and navigate directly to it. The account picker SHALL NOT be shown after sign-in in this context; the redirect SHALL happen immediately.

#### Scenario: Successful credential sign-in during OAuth2 flow goes straight to app callback
- **WHEN** a user arrives at `/sign-in` with an active OAuth2 flow (URL contains `client_id` and signed `sig` param)
- **AND** the user submits the sign-in form with valid credentials
- **THEN** the system signs the user in
- **AND** the server returns `{ redirect: true, url: "<app-callback-url>" }` in the sign-in response
- **AND** the browser is immediately navigated to the app callback URL from `url`
- **AND** the account picker is NOT shown at any point

#### Scenario: Successful credential sign-in outside OAuth2 flow does not auto-redirect
- **WHEN** a user arrives at `/sign-in` with no OAuth2 flow (URL has no `client_id`)
- **AND** the user submits the sign-in form with valid credentials
- **THEN** the system signs the user in
- **AND** the user is redirected to `/` (the SSO home page)

### Requirement: "Continue as" button completes the OAuth2 flow for the existing session
When the user clicks "Continue as <name>" on the account picker, the system SHALL complete the pending OAuth2 authorization flow by POSTing to `/api/auth/oauth2/continue` with `{ selected: true }`. The `oauthProviderClient` plugin SHALL automatically attach the signed OAuth params (`oauth_query`) from the current URL. The server SHALL return `{ redirect: true, url: "<callback-url>" }`. The client SHALL navigate to `url`. The signed OAuth params from the URL (the `sig` query param injected by `@better-auth/oauth-provider`) MUST NOT be stripped before the POST — the plugin handles them. While the request is in flight and until navigation completes, the sign-in page SHALL render nothing visible to prevent flickering.

#### Scenario: Already-logged-in user continues OAuth2 flow via account picker
- **WHEN** a user with an active session arrives at `/sign-in` via an OAuth2 authorize redirect (URL contains signed params with `sig`)
- **AND** the user clicks "Continue as <name>"
- **THEN** the system POSTs to `/api/auth/oauth2/continue` with `{ selected: true }`
- **AND** the server returns `{ redirect: true, url: "<app-callback-url>" }`
- **AND** the browser is navigated to `<app-callback-url>` (e.g., `https://app1/callback?code=<code>&state=xyz`)
- **AND** the consent redirect loop does NOT occur

#### Scenario: Already-logged-in user continues without OAuth context is redirected to home
- **WHEN** a user with an active session navigates directly to `/sign-in` (no `sig` in URL, no `client_id`)
- **AND** the user clicks "Continue as <name>"
- **THEN** the user is redirected to `/` (SSO home page)

### Requirement: Sign-in page renders nothing during in-progress OAuth2 redirect
When an OAuth2 redirect is in progress (after clicking "Continue as" or after sign-in form submission resolved with a redirect URL), the system SHALL render the sign-in page as blank (no account picker, no form) until browser navigation completes.

#### Scenario: No flash of account picker during post-sign-in redirect
- **WHEN** a user submits the sign-in form during an OAuth2 flow
- **AND** the server returns a redirect URL
- **THEN** the account picker is NOT rendered at any point between form submission and navigation
- **AND** the page renders blank (no visible UI) while the navigation is in progress

#### Scenario: No flash of account picker during "Continue as" redirect
- **WHEN** a user clicks "Continue as <name>" on the account picker
- **THEN** the page renders blank (no visible UI) while the `/api/auth/oauth2/continue` request is in flight and until navigation completes
