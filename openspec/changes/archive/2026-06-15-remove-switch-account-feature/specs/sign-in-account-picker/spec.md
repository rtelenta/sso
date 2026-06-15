## REMOVED Requirements

### Requirement: Sign-in page shows account picker when user already has an active session
**Reason**: Account picker feature removed entirely. The sign-in page no longer checks session state — it always renders the credential form.
**Migration**: No migration needed. Users who arrive at `/sign-in` with an existing session will see the sign-in form and must authenticate again.

### Requirement: Completing sign-in during an OAuth2 flow redirects directly to the app
**Reason**: This requirement is satisfied by `useSignIn` (unchanged) and does not depend on the account picker. Removing from this spec as the account-picker spec is being retired; the behavior is covered by the `oauth2-code-flow` spec.
**Migration**: No change to sign-in redirect behavior.

### Requirement: "Continue as" button completes the OAuth2 flow for the existing session
**Reason**: Account picker and `useContinueAs` hook removed entirely. Users with an existing session must sign in again; there is no "Continue as" shortcut.
**Migration**: None. Users re-authenticate via the standard credential form.

### Requirement: Sign-in page renders nothing during in-progress OAuth2 redirect
**Reason**: `isRedirecting` state and blank-page suppression were account-picker concerns. Post-sign-in redirect suppression is handled within `useSignIn` and remains in place.
**Migration**: None.

### Requirement: "Use a different account" button signs out and shows the sign-in form
**Reason**: Account picker removed. There is no "Use a different account" button.
**Migration**: None. Users who want to switch accounts must sign out explicitly from the SSO home page.
