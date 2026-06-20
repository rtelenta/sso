## ADDED Requirements

### Requirement: Sign-in form has a "Forgot password?" link
The sign-in form SHALL display a "Forgot password?" link below the password field. The link SHALL navigate to `/recover-password`. The link text SHALL be sourced from `locales/en.json`.

#### Scenario: "Forgot password?" link is visible on the sign-in page
- **WHEN** a user views the sign-in page
- **THEN** a "Forgot password?" link is rendered below the password input field

#### Scenario: "Forgot password?" link navigates to the recovery page
- **WHEN** a user clicks the "Forgot password?" link on the sign-in page
- **THEN** the browser navigates to `/recover-password`
