## 1. Auth Config & DB Schema

- [x] 1.1 Enable `emailAndPassword: { enabled: true }` in `lib/auth.ts`
- [x] 1.2 Add `user`, `session`, `account`, and `verification` table definitions to `db/schema/index.ts`
- [x] 1.3 Run `bunx drizzle-kit generate` to produce the initial migration file in `db/migrations/`
- [x] 1.4 Run `bunx drizzle-kit migrate` to apply the migration to the database

## 2. Auth Client

- [x] 2.1 Create `lib/auth-client.ts` exporting `authClient` via `createAuthClient` from `better-auth/client`, using `NEXT_PUBLIC_APP_URL` from `@/lib/constants`

## 3. Mutation Hooks

- [x] 3.1 Create `features/auth/hooks/useSignIn.ts` wrapping `authClient.signIn.email` in a `useMutation` hook; throw on `res.error`
- [x] 3.2 Create `features/auth/hooks/useSignUp.ts` wrapping `authClient.signUp.email` in a `useMutation` hook; throw on `res.error`

## 4. Locale Strings

- [x] 4.1 Add sign-in and sign-up page copy to `locales/en.json` (page titles, field labels, button text, error messages, links between pages)

## 5. Sign-In Page

- [x] 5.1 Create `app/(auth)/layout.tsx` with a centered card layout for auth pages
- [x] 5.2 Create `features/auth/pages/SignInPage.tsx` with the sign-in form (email + password fields, submit button, link to sign-up) using shadcn Form/Input/Button, react-hook-form, and `useSignIn`
- [x] 5.3 Create `app/(auth)/sign-in/page.tsx` as a thin shell rendering `<SignInPage />`

## 6. Sign-Up Page

- [x] 6.1 Create `features/auth/pages/SignUpPage.tsx` with the sign-up form (name, email, password fields, submit button, link to sign-in) using shadcn Form/Input/Button, react-hook-form, and `useSignUp`
- [x] 6.2 Create `app/(auth)/sign-up/page.tsx` as a thin shell rendering `<SignUpPage />`

## 7. shadcn Components

- [x] 7.1 Add shadcn `form`, `input`, `label`, and `card` components via `bunx shadcn@latest add form input label card`
