## MODIFIED Requirements

### Requirement: User can sign in with email and password
The system SHALL allow an existing user to authenticate by providing their email and password. A session SHALL be created on successful authentication. Authentication SHALL fail for unrecognized email or incorrect password without revealing which field is wrong. After successful authentication, if a valid `oauth_pending` cookie is present, the system SHALL issue an auth code and redirect to the OAuth2 callback URL; otherwise the system SHALL redirect to the default post-auth destination.

#### Scenario: Successful sign-in without OAuth2 flow
- **WHEN** a user submits the sign-in form with a valid email and correct password and no `oauth_pending` cookie is present
- **THEN** a session is created and the user is redirected to the default post-auth destination

#### Scenario: Successful sign-in with OAuth2 flow pending
- **WHEN** a user submits the sign-in form with a valid email and correct password and a valid `oauth_pending` cookie is present
- **THEN** a session is created, an auth code is issued, the `oauth_pending` cookie is cleared, and the browser is redirected to `{redirect_uri}?code={code}&state={state}`

#### Scenario: Invalid credentials rejected
- **WHEN** a user submits the sign-in form with an unrecognized email or wrong password
- **THEN** the form displays an error and no session is created

#### Scenario: Invalid form data rejected
- **WHEN** a user submits the sign-in form with a malformed email or empty password
- **THEN** the form shows inline validation errors before the request is sent

### Requirement: User can sign up with email and password
The system SHALL allow a new user to create an account by providing their name, email address, and a password. The password SHALL be hashed by better-auth before storage. Registration SHALL fail if the email is already in use. After successful registration, if a valid `oauth_pending` cookie is present, the system SHALL issue an auth code and redirect to the OAuth2 callback URL; otherwise the system SHALL redirect to the default post-auth destination.

#### Scenario: Successful sign-up without OAuth2 flow
- **WHEN** a user submits the sign-up form with a valid name, email, and password (minimum 8 characters) and no `oauth_pending` cookie is present
- **THEN** a new user record is created, a session is established, and the user is redirected to the default post-auth destination

#### Scenario: Successful sign-up with OAuth2 flow pending
- **WHEN** a user submits the sign-up form with a valid name, email, and password and a valid `oauth_pending` cookie is present
- **THEN** a new user record is created, a session is established, an auth code is issued, the `oauth_pending` cookie is cleared, and the browser is redirected to `{redirect_uri}?code={code}&state={state}`

#### Scenario: Duplicate email rejected
- **WHEN** a user submits the sign-up form with an email that already exists in the system
- **THEN** the form displays an error message and no new account is created

#### Scenario: Invalid form data rejected
- **WHEN** a user submits the sign-up form with an invalid email or a password shorter than 8 characters
- **THEN** the form shows inline validation errors before the request is sent
