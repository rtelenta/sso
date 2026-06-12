## 1. Dark Theme — globals.css Token Swap

- [x] 1.1 Remove the `@custom-variant dark (&:is(.dark *))` directive from `app/globals.css`
- [x] 1.2 Replace the light `:root` token block with the dark values from the `.dark {}` block; add `color-scheme: dark` to `:root`
- [x] 1.3 Delete the `.dark {}` class block entirely
- [x] 1.4 In the `@theme inline` block, fix `--font-sans: var(--font-sans)` → `--font-sans: var(--font-geist-sans)`

## 2. Root Layout — Clean Up Font Wiring

- [x] 2.1 In `app/layout.tsx`, verify `geistSans.variable` sets `--font-geist-sans` on `<html>`; confirm no `class="dark"` is added (dark theme is now CSS-only)

## 3. Locale Strings — Loading Labels

- [x] 3.1 Add `"auth.sign_in.submitting"` key to `locales/en.json` (e.g. `"Signing in…"`)
- [x] 3.2 Add `"auth.sign_up.submitting"` key to `locales/en.json` (e.g. `"Creating account…"`)

## 4. Form Polish — Sign-In Page

- [x] 4.1 In `features/auth/pages/SignInPage.tsx`, update the submit `<Button>` label to conditionally render `t("auth.sign_in.submitting")` when `signIn.isPending`, otherwise `t("auth.sign_in.submit")`

## 5. Form Polish — Sign-Up Page

- [x] 5.1 In `features/auth/pages/SignUpPage.tsx`, update the submit `<Button>` label to conditionally render `t("auth.sign_up.submitting")` when `signUp.isPending`, otherwise `t("auth.sign_up.submit")`

## 6. Verification

- [x] 6.1 Run `bun run build` — confirm no TypeScript errors and clean compile
- [x] 6.2 Start the dev server and visually verify: dark background, Geist font rendering, submit button loading state on form submit
