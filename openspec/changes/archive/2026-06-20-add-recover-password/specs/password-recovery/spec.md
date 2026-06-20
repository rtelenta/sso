## ADDED Requirements

### Requirement: User can request a password reset link
The system SHALL provide a `/recover-password` page where a user can enter their email address to request a password reset link. The page SHALL be accessible without an active OAuth2 flow (no `client_id`/`redirect_uri` required). On submission, better-auth SHALL generate a secure reset token and invoke the `sendResetPassword` callback, which SHALL POST to the external email API using the `"Password Reset"` template with `{ resetLink }` content. The page SHALL display a "Check your email" message on success regardless of whether the email is registered (to prevent email enumeration).

#### Scenario: Successful recovery request for a registered email
- **WHEN** a user submits `/recover-password` with a valid email address that exists in the system
- **THEN** better-auth generates a reset token, the external email API is called with `templateName: "Password Reset"` and `to: <email>`, and the page shows a "Check your email" success message

#### Scenario: Recovery request for an unrecognised email
- **WHEN** a user submits `/recover-password` with an email address that does not exist in the system
- **THEN** the page still shows the "Check your email" success message and no email is sent

#### Scenario: Invalid email rejected client-side
- **WHEN** a user submits `/recover-password` with a malformed email address
- **THEN** the form shows an inline validation error and no request is sent to the server

#### Scenario: Submit button shows loading state while request is in flight
- **WHEN** the recovery request is in flight
- **THEN** the submit button is disabled and displays the loading label from `locales/en.json`

### Requirement: User can reset their password via the link in the email
The system SHALL provide a `/reset-password` page that reads the `token` query parameter. The user SHALL enter a new password (minimum 8 characters). On submission, better-auth SHALL validate the token and update the password. On success, the user SHALL be redirected to `/sign-in`. On failure (expired or invalid token), the page SHALL display an error message.

#### Scenario: Successful password reset with a valid token
- **WHEN** a user visits `/reset-password?token=<valid-token>` and submits a new password of at least 8 characters
- **THEN** better-auth updates the user's password, the token is consumed, and the browser is redirected to `/sign-in`

#### Scenario: Expired or invalid token is rejected
- **WHEN** a user visits `/reset-password?token=<expired-or-invalid-token>` and submits a new password
- **THEN** better-auth returns an error and the page displays an error message without redirecting

#### Scenario: Password too short is rejected client-side
- **WHEN** a user submits `/reset-password` with a password shorter than 8 characters
- **THEN** the form shows an inline validation error and no request is sent to the server

#### Scenario: Submit button shows loading state while request is in flight
- **WHEN** the reset request is in flight
- **THEN** the submit button is disabled and displays the loading label from `locales/en.json`

#### Scenario: Missing token — page renders an error state
- **WHEN** a user navigates to `/reset-password` with no `token` query parameter
- **THEN** the page displays an error message indicating the link is invalid

### Requirement: External email API is called server-side with correct payload
The system SHALL call `POST {EMAIL_API_URL}/api/v1/send` from within the server-only `sendResetPassword` callback in `lib/auth.ts`. The request SHALL include `Authorization: Bearer {EMAIL_API_TOKEN}` and a JSON body of `{ templateName: "Password Reset", to: <user-email>, content: { resetLink: <url> } }`. `EMAIL_API_URL` and `EMAIL_API_TOKEN` SHALL be exported from `lib/constants.ts` and sourced from environment variables. They SHALL NOT be referenced in any client-side code.

#### Scenario: Email API is called with correct payload on a valid recovery request
- **WHEN** a registered user submits the recovery form
- **THEN** the server calls `POST {EMAIL_API_URL}/api/v1/send` with `Authorization: Bearer {EMAIL_API_TOKEN}`, `templateName: "Password Reset"`, `to` set to the user's email, and `content.resetLink` set to the better-auth-generated URL

#### Scenario: EMAIL_API_URL and EMAIL_API_TOKEN are not leaked to the client
- **WHEN** any client-side bundle is inspected
- **THEN** `EMAIL_API_URL` and `EMAIL_API_TOKEN` values are not present (server-only constants)
