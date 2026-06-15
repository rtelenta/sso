## 1. Fix Suspense boundary in SignInPage

- [x] 1.1 In `features/auth/pages/SignInPage.tsx`, extract the `useSearchParams()` usage into a small inner component (e.g. `SignInSearchParams`) that accepts a callback prop, and wrap it with `<Suspense fallback={null}>` inside `SignInPage`
- [x] 1.2 Verify `npm run build` completes without the `useSearchParams()` Suspense error
