## ADDED Requirements

### Requirement: Sign-in requires active OAuth2 flow
The `/sign-in` route SHALL only be accessible when an active OAuth2 flow is in progress, identified by the presence of both `client_id` and `redirect_uri` query parameters. If either parameter is absent, the server SHALL redirect the user to `/` before rendering any UI.

#### Scenario: Direct navigation to sign-in without OAuth params
- **WHEN** a user navigates to `/sign-in` without `client_id` or `redirect_uri` query params
- **THEN** the server redirects to `/` with a `307` (temporary redirect)
- **THEN** no sign-in UI is rendered

#### Scenario: OAuth-initiated sign-in access is unaffected
- **WHEN** a user arrives at `/sign-in` with both `client_id` and `redirect_uri` params present
- **THEN** the sign-in page renders normally
- **THEN** all existing sign-in functionality works as before

### Requirement: Sign-up requires active OAuth2 flow
The `/sign-up` route SHALL apply the same guard as `/sign-in`. If `client_id` or `redirect_uri` is absent, the server SHALL redirect to `/`.

#### Scenario: Direct navigation to sign-up without OAuth params
- **WHEN** a user navigates to `/sign-up` without `client_id` or `redirect_uri` query params
- **THEN** the server redirects to `/` with a `307` (temporary redirect)
- **THEN** no sign-up UI is rendered

#### Scenario: OAuth-initiated sign-up access is unaffected
- **WHEN** a user arrives at `/sign-up` with both `client_id` and `redirect_uri` params present
- **THEN** the sign-up page renders normally
