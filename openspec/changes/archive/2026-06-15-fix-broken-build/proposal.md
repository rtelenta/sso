## Why

The production build fails because `SignInPage` calls `useSearchParams()` directly, which Next.js requires to be wrapped in a `<Suspense>` boundary during static generation. This blocks all deployments until fixed.

## What Changes

- Wrap the `SignInPage` component in a `<Suspense>` boundary so Next.js can statically prerender the `/sign-in` route shell while the search-params-dependent content hydrates on the client.

## Capabilities

### New Capabilities
<!-- None introduced — this is a build-correctness fix -->

### Modified Capabilities
- `sign-in`: Route shell is now statically prerendered; search-params reading happens inside a Suspense boundary.

## Impact

- **UI**: `features/auth/pages/SignInPage.tsx` — extract the `useSearchParams` consumer into a small inner component and wrap it with `<Suspense>`.
- **Routing**: `app/(auth)/sign-in/page.tsx` — optionally move the Suspense boundary here.
- **API / DB / deps**: None.
- **Env vars**: None.

## Non-goals

- Changing sign-in UI appearance or behavior.
- Adding loading skeletons or fallback UIs beyond the minimum required for the Suspense boundary.
- Fixing any other pages or routes.
