## 1. Configuration & Constants

- [x] 1.1 Add `EMAIL_API_URL` and `EMAIL_API_TOKEN` exports to `lib/constants.ts` (sourced from `process.env`)
- [x] 1.2 Enable `sendResetPassword` callback in `lib/auth.ts` — call `POST {EMAIL_API_URL}/api/v1/send` with `Authorization: Bearer {EMAIL_API_TOKEN}` and body `{ templateName: "Password Reset", to: user.email, content: { resetLink: url } }`

## 2. Locale Strings

- [x] 2.1 Add recover-password page keys to `locales/en.json` (`auth.recover_password.title`, `description`, `email_label`, `email_placeholder`, `submit`, `submitting`, `success_title`, `success_message`)
- [x] 2.2 Add reset-password page keys to `locales/en.json` (`auth.reset_password.title`, `description`, `password_label`, `password_placeholder`, `submit`, `submitting`, `invalid_link`)
- [x] 2.3 Add forgot-password link key to `locales/en.json` (`auth.sign_in.forgot_password`)

## 3. Client Hooks

- [x] 3.1 Create `features/auth/hooks/useForgotPassword.ts` — `useMutation` wrapping `authClient.forgetPassword({ email, redirectTo: "/reset-password" })`; throw on error
- [x] 3.2 Create `features/auth/hooks/useResetPassword.ts` — `useMutation` wrapping `authClient.resetPassword({ newPassword, token })`; throw on error; `onSuccess` redirects to `/sign-in`

## 4. Recover Password Page

- [x] 4.1 Create `features/auth/pages/RecoverPasswordPage.tsx` — zod schema (`email`), react-hook-form, submit calls `useForgotPassword`, shows success state ("Check your email") after mutation succeeds
- [x] 4.2 Create `app/(auth)/recover-password/page.tsx` — thin shell rendering `RecoverPasswordPage` (no OAuth guard)

## 5. Reset Password Page

- [x] 5.1 Create `features/auth/pages/ResetPasswordPage.tsx` — reads `token` from `useSearchParams`, shows error state if missing; zod schema (`newPassword` min 8), react-hook-form, submit calls `useResetPassword`; wrap in `<Suspense>`
- [x] 5.2 Create `app/(auth)/reset-password/page.tsx` — thin shell rendering `ResetPasswordPage` (no OAuth guard)

## 6. Sign-In Page Update

- [x] 6.1 Add "Forgot password?" `<Link href="/recover-password">` below the password field in `features/auth/pages/SignInPage.tsx`, using `t("auth.sign_in.forgot_password")`
