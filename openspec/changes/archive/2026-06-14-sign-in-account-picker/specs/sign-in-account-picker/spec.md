## ADDED Requirements

### Requirement: Sign-in page shows account picker when user already has an active session
When the sign-in page is loaded and the user already has an active SSO session, the system SHALL display an account picker UI instead of the standard sign-in form. The account picker SHALL show the logged-in user's name and email, a "Continue as <name>" primary action, and a "Use a different account" secondary action. The standard sign-in form SHALL only be shown when no active session exists.

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

### Requirement: "Continue as" button completes the OAuth2 flow for the existing session
When the user clicks "Continue as <name>" on the account picker, the system SHALL complete the pending OAuth2 authorization flow using the existing session and redirect the user to the originating app's callback URL. The signed OAuth params from the URL (the `sig` query param injected by `@better-auth/oauth-provider`) SHALL be forwarded in the request so the plugin can resolve the pending authorization.

#### Scenario: Already-logged-in user continues OAuth2 flow via account picker
- **WHEN** a user with an active session arrives at `/sign-in` via an OAuth2 authorize redirect (URL contains signed params with `sig`)
- **AND** the user clicks "Continue as <name>"
- **THEN** the system completes the OAuth2 authorization using the existing session
- **AND** the browser is redirected to `https://app1/callback?code=<code>&state=xyz`

#### Scenario: Already-logged-in user continues without OAuth context is redirected to home
- **WHEN** a user with an active session navigates directly to `/sign-in` (no `sig` in URL)
- **AND** the user clicks "Continue as <name>"
- **THEN** the user is redirected to `/` (SSO home page)

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
