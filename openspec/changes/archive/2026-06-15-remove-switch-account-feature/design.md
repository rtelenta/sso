## Context

The sign-in page currently checks for an active SSO session on mount. When a session exists it renders an `AccountPickerCard` that lets the user continue as the logged-in account or sign out and switch to another. This logic lives across three files: `AccountPickerCard.tsx`, `useContinueAs.ts`, and `useSwitchAccount.ts`, and is wired into `SignInPage.tsx` via two extra state variables (`forceForm`, `isRedirecting`).

The feature is being removed in its entirety. After this change the sign-in page always renders the credential form, regardless of whether a session already exists.

## Goals / Non-Goals

**Goals:**
- Delete all account picker code (component, hooks, translations)
- Leave `SignInPage` lean: only sign-in form logic remains
- Retire the `sign-in-account-picker` spec

**Non-Goals:**
- Auto-completing an OAuth2 flow for an already-logged-in user — not needed
- Any replacement UX for session-aware sign-in
- Changes to the OAuth2 authorization or token endpoints
- DB schema or migration changes

## Decisions

**Remove `useContinueAs` entirely (do not repurpose it)**

The hook's sole purpose is to POST to the consent endpoint on behalf of an already-logged-in user. Without the account picker there is no UI surface that calls it. Repurposing it as an auto-consent mechanism on page load would silently complete OAuth2 flows without user interaction — undesirable for an auth page. It is deleted.

**Remove `isRedirecting` state from `SignInPage`**

`isRedirecting` existed only to blank the page between "Continue as" click and navigation. With no such action, the state is unnecessary. `useSignIn` already handles the post-sign-in redirect; no additional blank-screen suppression is needed.

**Remove `forceForm` state from `SignInPage`**

`forceForm` toggled from picker back to form after signing out. With no picker, there is no toggle.

**Remove `initialSession` prop from `SignInPage`**

`initialSession` was passed to hydrate the session check on first render and avoid a flash of the form. Without the session check, it serves no purpose. The page component signature is simplified to take no props.

**Retire `sign-in-account-picker` spec (do not delete the file)**

The spec file is left in place but its delta spec marks all requirements as removed. This preserves history while making the current state unambiguous.

## Risks / Trade-offs

- **Already-logged-in users hitting `/sign-in` during an OAuth2 flow will see the credential form instead of being auto-continued.** They will need to sign in again. Acceptable for this single-tenant internal SSO — users are unlikely to have concurrent sessions or tab-switch mid-flow.
- **`useContinueAs` and `useSwitchAccount` deletions are breaking** — any future feature that imports them will need to recreate them. Low risk given the internal-only codebase.
