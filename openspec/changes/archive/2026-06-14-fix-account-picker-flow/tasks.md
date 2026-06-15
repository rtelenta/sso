## 1. Fix bug 1 — serve initial session from server to eliminate form flash

- [x] 1.1 Update `app/(auth)/sign-in/page.tsx` to call `auth.api.getSession({ headers: await headers() })` and pass the result as an `initialSession` prop to `<SignInPage />`
- [x] 1.2 Update `SignInPage` to accept `initialSession` prop (typed as the session user shape or `null`) and derive `session` from `liveSession ?? initialSession` instead of only from `authClient.useSession()`
- [x] 1.3 Remove the `if (isPending) return null` loading gate — it is no longer needed since the server always provides the correct initial session

## 2. Fix bug 2 — redirect directly to app after credential sign-in in OAuth2 flow

- [x] 2.1 Update `useSignIn` to accept an optional `onSuccess` callback; when provided it overrides the default `router.push("/")` redirect
- [x] 2.2 In `SignInPage`, detect OAuth2 flow (`searchParams.has("client_id")`) and pass `continueAs` as `onSuccess` to `useSignIn` when in that context

## 3. Type-check

- [x] 3.1 Run `bunx tsc --noEmit` and fix any TypeScript errors introduced by the prop changes
