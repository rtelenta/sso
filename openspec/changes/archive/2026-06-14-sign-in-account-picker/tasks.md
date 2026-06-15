## 1. Locale strings

- [x] 1.1 Add account picker copy to `locales/en.json`: `auth.account_picker.title`, `auth.account_picker.description`, `auth.account_picker.continue_as` (with `{{name}}` interpolation), `auth.account_picker.switch_account`, `auth.account_picker.switch_error`

## 2. Hooks

- [x] 2.1 Create `features/auth/hooks/useContinueAs.ts` — reads `searchParams`, strips plugin-added params (`sig`, `exp`, `ba_iat`, `ba_pl`), sets `window.location.href` to `/api/auth/oauth2/authorize?{remaining}` if `client_id` is present, otherwise to `/`
- [x] 2.2 Create `features/auth/hooks/useSwitchAccount.ts` — wraps `authClient.signOut()` in a `useMutation`; accepts `onSuccess` callback called after sign-out resolves

## 3. AccountPickerCard component

- [x] 3.1 Create `features/auth/components/AccountPickerCard.tsx` — receives `user: { name: string; email: string }`, `onContinue: () => void`, `onSwitch: () => void`, `isSwitching: boolean`, `switchError: string | null` as props; renders a `Card` (shadcn) with user avatar placeholder (initials), "Continue as" primary `Button`, "Use a different account" secondary `Button`, and an error message when `switchError` is non-null

## 4. Update SignInPage

- [x] 4.1 In `features/auth/pages/SignInPage.tsx`: add `const { data: session, isPending } = authClient.useSession()`
- [x] 4.2 Add `const [forceForm, setForceForm] = useState(false)` to track when the user chose to switch accounts
- [x] 4.3 Wire up `useContinueAs(searchParams)` and `useSwitchAccount({ onSuccess: () => setForceForm(true) })`
- [x] 4.4 Add render branching: if `isPending` → return a skeleton card; if `session && !forceForm` → return `<AccountPickerCard>`; else → return the existing sign-in form
