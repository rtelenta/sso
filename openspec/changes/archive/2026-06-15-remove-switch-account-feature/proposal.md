## Why

The switch/choose account picker UI adds complexity without delivering value — the app has a single-user-pool SSO with no need to switch between accounts. Removing it simplifies the sign-in flow and eliminates dead code.

## What Changes

- **BREAKING** Delete `AccountPickerCard` component
- **BREAKING** Delete `useSwitchAccount` hook
- **BREAKING** Delete `useContinueAs` hook
- Simplify `SignInPage` to always render the sign-in form regardless of existing session state
- Remove `forceForm` and `isRedirecting` UI states from `SignInPage`
- Remove `auth.account_picker` translation keys from `locales/en.json`

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `sign-in-account-picker`: Entire capability is being removed. The sign-in page no longer checks for an existing session or renders a picker UI — it always shows the credential form.

## Impact

- `features/auth/components/AccountPickerCard.tsx` — deleted
- `features/auth/hooks/useSwitchAccount.ts` — deleted
- `features/auth/hooks/useContinueAs.ts` — deleted
- `features/auth/pages/SignInPage.tsx` — simplified (remove picker logic, state, imports)
- `locales/en.json` — remove `auth.account_picker` block
- `openspec/specs/sign-in-account-picker/spec.md` — retired (capability removed)
- No API, DB schema, or env var changes required
