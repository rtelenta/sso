# Sign-In Spec

## Purpose

TBD

## Requirements

### Requirement: Sign-in page builds successfully
The `/sign-in` route SHALL be statically prerenderable by Next.js. Any component that reads `useSearchParams()` MUST be wrapped in a `<Suspense>` boundary so the build can generate a static shell.

#### Scenario: Production build succeeds
- **WHEN** `npm run build` is executed
- **THEN** the `/sign-in` route prerendering completes without error

#### Scenario: Search params forwarded to sign-up link
- **WHEN** the sign-in page is visited with query parameters (e.g. `?redirect_uri=...&state=...`)
- **THEN** the "Sign up" link includes those same query parameters in its `href`

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

### Requirement: Sign-in form has a "Forgot password?" link
The sign-in form SHALL display a "Forgot password?" link below the password field. The link SHALL navigate to `/recover-password`. The link text SHALL be sourced from `locales/en.json`.

#### Scenario: "Forgot password?" link is visible on the sign-in page
- **WHEN** a user views the sign-in page
- **THEN** a "Forgot password?" link is rendered below the password input field

#### Scenario: "Forgot password?" link navigates to the recovery page
- **WHEN** a user clicks the "Forgot password?" link on the sign-in page
- **THEN** the browser navigates to `/recover-password`
