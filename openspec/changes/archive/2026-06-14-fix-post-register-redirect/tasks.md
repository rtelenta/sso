## 1. Remove dead OAuth redirect guard from sign-up page

- [x] 1.1 In `app/(auth)/sign-up/page.tsx`, delete the `searchParams` prop, the `redirectUri` extraction, and the `if (typeof redirectUri === "string" && redirectUri) { redirect(...) }` block — the page should simply return `<SignUpPage />`

## 2. Forward signed OAuth params from sign-in to sign-up link

- [x] 2.1 In `features/auth/pages/SignInPage.tsx`, import `useSearchParams` from `next/navigation`
- [x] 2.2 Inside `SignInPage`, call `useSearchParams()` and build a conditional `signUpHref`: `/sign-up?${params.toString()}` when params are non-empty, otherwise `/sign-up`
- [x] 2.3 Replace the hard-coded `href="/sign-up"` on the `<Link>` with `href={signUpHref}`

## 3. Manual verification

- [x] 3.1 Start the dev server (`bun dev`) and configure a downstream app to redirect to this SSO
- [x] 3.2 Trigger the OAuth2 flow from the app, arrive at `/sign-in`, click "Sign up", complete registration, and confirm the browser lands on the app callback URL (not the SSO home page)
- [x] 3.3 Verify that a user who navigates directly to `/sign-up` (no OAuth params) still lands on `/` after registration
