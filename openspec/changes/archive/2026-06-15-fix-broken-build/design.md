## Context

`SignInPage` calls `useSearchParams()` at the top level of the component. Next.js 16 (App Router) requires any component that reads search params on the client to be nested inside a `<Suspense>` boundary; without it, the static prerender phase throws and the build fails.

Current shape of `app/(auth)/sign-in/page.tsx`:
```tsx
export default function SignInPage() {
  return <SignInPageFeature />;
}
```

`features/auth/pages/SignInPage.tsx` calls `useSearchParams()` directly and is marked `"use client"`.

## Goals / Non-Goals

**Goals:**
- Satisfy Next.js's Suspense requirement so `npm run build` succeeds.
- Keep the fix minimal and local to the affected component.

**Non-Goals:**
- Adding a visible loading skeleton or fallback UI.
- Refactoring unrelated parts of the sign-in flow.

## Decisions

**Extract `useSearchParams` into an inner component, wrap with `<Suspense>` in the page shell.**

The `useSearchParams()` call is only used to build `signUpHref`. Extract a small `SignInSearchParamsConsumer` component (or similar) that reads the params and passes the derived href as a prop to the rest of the form. Wrap that inner component with `<Suspense fallback={null}>` inside `SignInPage`.

Alternative considered: move `<Suspense>` into `app/(auth)/sign-in/page.tsx` and wrap the entire `<SignInPage />` import. This works but keeps business-domain concerns (Suspense is needed because of a search-params read) visible in the routing layer, which conflicts with the project convention that all logic lives in `features/`. The inner-component approach keeps the Suspense boundary co-located with the code that needs it.

**Next.js page involved:** `app/(auth)/sign-in/page.tsx` (routing shell, unchanged) and `features/auth/pages/SignInPage.tsx` (where the fix lives).

## Risks / Trade-offs

- [Minimal fallback] `fallback={null}` means the sign-up link briefly renders with the default `/sign-up` href before hydration supplies the search params. This is acceptable — the params are only used to forward OAuth state to the sign-up page, and the window is imperceptible.  
  → Mitigation: no action needed; behaviour is correct after hydration.
