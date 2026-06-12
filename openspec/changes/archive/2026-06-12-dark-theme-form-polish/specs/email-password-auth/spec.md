## ADDED Requirements

### Requirement: Submit buttons show a loading state while a request is in flight
The sign-in and sign-up submit buttons SHALL be visually disabled and SHALL display a distinct loading label (from `locales/en.json`) while their respective mutations are pending (`isPending === true`). Once the mutation settles, the button SHALL revert to its default label.

#### Scenario: Sign-in button shows loading label during submission
- **WHEN** a user submits the sign-in form and the request is in flight
- **THEN** the submit button is disabled and its label changes to the loading string from `locales/en.json` (`auth.sign_in.submitting`)

#### Scenario: Sign-up button shows loading label during submission
- **WHEN** a user submits the sign-up form and the request is in flight
- **THEN** the submit button is disabled and its label changes to the loading string from `locales/en.json` (`auth.sign_up.submitting`)

#### Scenario: Button returns to default label after settlement
- **WHEN** the mutation completes (success or error)
- **THEN** the submit button label reverts to its default string and the button becomes enabled again
