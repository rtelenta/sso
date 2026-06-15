## 1. Delete account picker files

- [x] 1.1 Delete `features/auth/components/AccountPickerCard.tsx`
- [x] 1.2 Delete `features/auth/hooks/useSwitchAccount.ts`
- [x] 1.3 Delete `features/auth/hooks/useContinueAs.ts`

## 2. Simplify SignInPage

- [x] 2.1 Remove imports for `useContinueAs`, `useSwitchAccount`, and `AccountPickerCard` from `features/auth/pages/SignInPage.tsx`
- [x] 2.2 Remove the `InitialSession` type and `initialSession` prop from `SignInPage`
- [x] 2.3 Remove `forceForm` and `isRedirecting` state variables
- [x] 2.4 Remove `continueAs` and `switchAccount` hook calls
- [x] 2.5 Remove the `if (isRedirecting) return null` guard
- [x] 2.6 Remove the `if (session && !forceForm)` block that rendered `AccountPickerCard`
- [x] 2.7 Remove the `authClient.useSession()` call and `session` variable (no longer needed)

## 3. Update the page shell

- [x] 3.1 Check `app/sign-in/page.tsx` — remove any server-side session fetch and `initialSession` prop passed to `SignInPage`

## 4. Clean up translations

- [x] 4.1 Remove the `auth.account_picker` block from `locales/en.json`
