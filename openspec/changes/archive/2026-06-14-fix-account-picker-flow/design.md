## Context

Two bugs in the sign-in account picker implementation:

**Bug 1 — Form flash when already logged in**

`authClient.useSession()` from `better-auth/react` uses a nanostores atom that is a module-level singleton. On a first visit to `/sign-in` before sign-in, the atom settles to `{ isPending: false, data: null }`. If the user then signs in and is later redirected back to `/sign-in` (new OAuth2 flow), the atom's cached `{ isPending: false, data: null }` state is returned on the FIRST render — before the background refetch (triggered via `setTimeout(() => fetchSession(), 0)` inside nanostores' `onMount`) has run. The `if (isPending) return null` guard works when `isPending` is `true` but does NOT protect against this stale-null case. The form renders briefly, then the refetch discovers the active session and switches to the account picker.

**Bug 2 — Account picker flash after form submit**

`useSignIn`'s `onSuccess` does `router.push("/")`. After a successful sign-in, `authClient.useSession()` detects the new session, sets `session` to the logged-in user, and because `forceForm` is still `false`, the `AccountPickerCard` renders. A moment later, the redirect to `/` completes and the picker disappears. When in an OAuth2 flow the user should never see the picker after submitting credentials — they should be sent directly to the authorize endpoint.

## Goals / Non-Goals

**Goals:**
- Account picker renders from the first paint when user is already logged in — no form flash
- After credential sign-in inside an OAuth2 flow, browser redirects immediately to `/api/auth/oauth2/authorize` — no picker flash

**Non-Goals:**
- Changing the account picker UI
- Fixing the flow for social (Google) sign-in
- Server-side redirect for already-authenticated users (account picker must still show)

## Decisions

### Decision 1: Fix bug 1 via server-side initial session (SSR prop)

**Chosen**: Fetch the session server-side in the `/sign-in` page component and pass it as an `initialSession` prop to `SignInPage`. The client component uses `initialSession` as the starting point, falling back to the live `useSession()` value once hydration completes.

```tsx
// app/sign-in/page.tsx (server component)
const session = await auth.api.getSession({ headers: await headers() });
return <SignInPage initialSession={session} />;

// SignInPage.tsx (client component)
type Props = { initialSession: { user: { name: string | null; email: string } } | null };

export function SignInPage({ initialSession }: Props) {
  const { data: liveSession } = authClient.useSession();
  const session = liveSession ?? initialSession;
  // No loading gate needed — server already knows the answer
  if (session && !forceForm) return <AccountPickerCard ... />;
  return <Card>...form...</Card>;
}
```

**Why over alternatives:**
- *Alternative A — local `sessionChecked` state*: An effect-based flag can't prevent the form flash because effects run after render. The atom's stale-null value causes the form to render before the effect can set the flag.
- *Alternative B — nanostores initial atom value*: We don't control the `better-auth` atom lifecycle; patching it would be fragile.
- *Alternative C — suspense boundary*: Would require wrapping the component in Suspense + a promise-based data source, more complex than necessary.

The server component approach is idiomatic for Next.js App Router, requires zero changes to `better-auth` internals, and eliminates the problem at the source: the server always has the correct session state via the httpOnly cookie.

The `liveSession ?? initialSession` fallback means: use the live client-side session if available (it may have been updated since the page rendered), otherwise use the server-provided value. This correctly handles the "switch account" flow where the session is cleared client-side while the server-side prop still holds the old value — after `useSwitchAccount` signs out, `liveSession` becomes `null` and `setForceForm(true)` shows the form, so the `initialSession` fallback is never used once the form is visible.

### Decision 2: Fix bug 2 by accepting an `onSuccess` override in `useSignIn`

**Chosen**: Add an optional `onSuccess` parameter to `useSignIn`. `SignInPage` detects whether it's in an OAuth2 flow (`searchParams.has("client_id")`), and if so passes `continueAs` as `onSuccess`. Since `continueAs` does `window.location.href = ...` (full navigation), React never re-renders with the new session state, so the account picker is never shown.

```ts
// useSignIn.ts
export function useSignIn({ onSuccess }: { onSuccess?: () => void } = {}) {
  const router = useRouter();
  return useMutation({
    mutationFn: async (data: SignInInput) => { ... },
    onSuccess: () => {
      if (onSuccess) onSuccess();
      else router.push("/");
    },
  });
}

// SignInPage.tsx
const isOAuthFlow = searchParams.has("client_id");
const signIn = useSignIn({ onSuccess: isOAuthFlow ? continueAs : undefined });
```

**Why over alternatives:**
- *Alternative — handle in component's form submit*: Would require access to both the mutation result and the redirect callback in `onSubmit`, adding conditional logic to the form handler. Separating concerns (hook handles redirect, component doesn't know about authorize URL) is cleaner.
- *Alternative — always call continueAs after any sign-in*: If `client_id` is absent, `continueAs` redirects to `/` (as per the existing `useContinueAs` implementation). This would work but is less explicit — better to keep the default `router.push("/")` path unchanged and only override when needed.

## Risks / Trade-offs

- `auth.api.getSession()` adds a DB/cookie read on every `/sign-in` page load. For a low-traffic internal SSO this is acceptable. [Risk: performance] → Mitigation: Already happens on every authenticated page; `/sign-in` is only visited infrequently.
- The `liveSession ?? initialSession` coalescing means if the server session is stale (expired between server render and client hydration) the user briefly sees the account picker before the live `useSession()` detects the expiry. [Risk: brief stale UI] → Mitigation: Sessions are long-lived relative to hydration time; acceptable trade-off for eliminating the form flash.

## Open Questions

None. Both fixes are scoped to existing files with no new dependencies.
