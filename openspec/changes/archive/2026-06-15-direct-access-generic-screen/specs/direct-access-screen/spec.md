## ADDED Requirements

### Requirement: Direct access shows generic informational screen
When a user navigates to the SSO root (`/`) directly — without an active OAuth2 flow — the system SHALL display a static informational screen that explains this app is an internal SSO provider and is not intended for direct use. No sign-in form or session-aware actions SHALL be shown.

#### Scenario: Unauthenticated direct visit to root
- **WHEN** a user navigates to `/` without any OAuth params
- **THEN** the system renders the direct-access informational screen
- **THEN** no sign-in form or authentication controls are visible

#### Scenario: Authenticated direct visit to root
- **WHEN** an authenticated user navigates to `/` directly
- **THEN** the system renders the same direct-access informational screen
- **THEN** no session state, user info, or sign-out control is shown

#### Scenario: Screen copy is managed in locale file
- **WHEN** the direct-access screen is rendered
- **THEN** all visible text is sourced from `locales/en.json` via the `t()` utility
- **THEN** no hardcoded strings appear in the component
