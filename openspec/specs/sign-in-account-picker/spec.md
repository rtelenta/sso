# Spec: Sign-in Account Picker

## Purpose

TBD — Defines the account picker UI shown on the sign-in page when the user already has an active SSO session. Enables logged-in users to continue an OAuth2 flow or switch to a different account without re-entering credentials.

## Requirements

### Requirement: Sign-in page shows account picker when user already has an active session
When the sign-in page is loaded and the user already has an active SSO session, the system SHALL display an account picker UI instead of the standard sign-in form. The account picker SHALL show the logged-in user's name and email, a "Continue as <name>" primary action, and a "Use a different account" secondary action. The standard sign-in form SHALL only be shown when no active session exists. The sign-in form SHALL NOT appear — even momentarily — before the session state is known; a blank/loading state SHALL be rendered while the session check is in progress.

#### Scenario: Already-logged-in user sees account picker on sign-in page
- **WHEN** a user with an active SSO session is redirected to `/sign-in`
- **THEN** the sign-in form is NOT shown
- **AND** the account picker is shown with the user's name and email
- **AND** a "Continue as <name>" button is visible
- **AND** a "Use a different account" button is visible

#### Scenario: Unauthenticated user sees standard sign-in form
- **WHEN** a user with no active SSO session arrives at `/sign-in`
- **THEN** the standard email/password sign-in form is shown
- **AND** no account picker is shown

#### Scenario: Sign-in form does not flash before account picker appears
- **WHEN** a user with an active SSO session is redirected to `/sign-in`
- **THEN** the sign-in form is NEVER rendered at any point during page load
- **AND** a blank/loading state is shown while the session check is in progress
- **AND** the account picker replaces the loading state once the session is confirmed

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

### Requirement: Sign-in page renders nothing during in-progress OAuth2 redirect
When an OAuth2 redirect is in progress (after clicking "Continue as" or after sign-in form submission resolved with a redirect URL), the system SHALL render the sign-in page as blank (no account picker, no form) until browser navigation completes.

#### Scenario: No flash of account picker during post-sign-in redirect
- **WHEN** a user submits the sign-in form during an OAuth2 flow
- **AND** the server returns a redirect URL
- **THEN** the account picker is NOT rendered at any point between form submission and navigation
- **AND** the page renders blank (no visible UI) while the navigation is in progress

#### Scenario: No flash of account picker during "Continue as" redirect
- **WHEN** a user clicks "Continue as <name>" on the account picker
- **THEN** the page renders blank (no visible UI) while the `/api/auth/oauth2/consent` request is in flight and until navigation completes

### Requirement: "Use a different account" button signs out and shows the sign-in form
When the user clicks "Use a different account" on the account picker, the system SHALL sign out the current user (revoking their session) and then display the standard sign-in form in place of the account picker. The signed OAuth params from the URL SHALL be preserved so that the subsequent sign-in or registration completes the OAuth2 flow.

#### Scenario: User switches account during OAuth2 flow and signs in as different user
- **WHEN** a user with an active session is on the account picker at `/sign-in` (URL contains signed OAuth params)
- **AND** the user clicks "Use a different account"
- **THEN** the current session is revoked
- **AND** the standard sign-in form is shown with the signed OAuth params still present in the URL
- **AND** when the new user signs in, the OAuth2 flow completes and they are redirected to the app callback

#### Scenario: Switch account button shows sign-in form in place of picker
- **WHEN** the user clicks "Use a different account"
- **THEN** the account picker is replaced by the standard sign-in form (no full page reload required)
