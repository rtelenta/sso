## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Completing sign-in during an OAuth2 flow redirects directly to the app
When a user signs in via the credential form while an OAuth2 authorization flow is in progress (i.e., a `client_id` query param is present), the system SHALL redirect the browser directly to the originating app's callback URL upon successful sign-in. The account picker SHALL NOT be shown after sign-in in this context; the redirect SHALL happen immediately.

#### Scenario: Successful credential sign-in during OAuth2 flow goes straight to app
- **WHEN** a user arrives at `/sign-in` with an active OAuth2 flow (URL contains `client_id`)
- **AND** the user submits the sign-in form with valid credentials
- **THEN** the system signs the user in
- **AND** the browser is immediately redirected to `/api/auth/oauth2/authorize` (which then redirects to the app callback)
- **AND** the account picker is NOT shown at any point

#### Scenario: Successful credential sign-in outside OAuth2 flow does not auto-redirect
- **WHEN** a user arrives at `/sign-in` with no OAuth2 flow (URL has no `client_id`)
- **AND** the user submits the sign-in form with valid credentials
- **THEN** the system signs the user in
- **AND** the user is NOT automatically redirected (no `client_id` means no pending OAuth flow)
