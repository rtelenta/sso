## Context

The root page (`/`) currently shows a session-aware state: a sign-out button for authenticated users or a link to `/sign-in` for unauthenticated ones. This is a development leftover — the SSO is not intended to be used as a standalone app. Users who land here directly (e.g., by typing the URL or following a bookmark) see confusing UI that implies they can log in independently.

The sign-in page at `/sign-in` is reachable both via the OAuth2 flow (with `client_id`, `redirect_uri`, `state` params) and directly without any params. The `/sign-in` page already preserves search params through the flow (passes them forward to `/sign-up`, etc.), so the OAuth context travels correctly once the flow starts — the gap is only at the entry point.

## Goals / Non-Goals

**Goals:**
- Replace `/` with a static, informational screen that explains this is an internal SSO provider and is not meant for direct access
- Guard `/sign-in` (and `/sign-up`) so they redirect to `/` if accessed without the required OAuth params (`client_id` + `redirect_uri`)

**Non-Goals:**
- IP allowlisting or network-level access control
- Showing any session state or account info on the direct-access screen
- Blocking the OAuth-initiated flow in any way

## Decisions

### Decision 1: Replace `/` rather than redirect from it

**Choice:** Make `app/page.tsx` render the `DirectAccessPage` feature component directly.

**Rationale:** The root is the natural landing point for direct navigation. Replacing it is the simplest, zero-middleware change. A redirect loop risk (e.g., `/` → `/not-for-you` → `/` ) is avoided entirely.

**Alternative considered:** A dedicated route like `/not-for-direct-access`. Rejected — adds an unnecessary URL that users could also navigate to directly, and requires a redirect from `/` anyway.

### Decision 2: Guard `/sign-in` and `/sign-up` with a server-side redirect

**Choice:** In `app/(auth)/sign-in/page.tsx` and `app/(auth)/sign-up/page.tsx`, read `searchParams` server-side and redirect to `/` if `client_id` or `redirect_uri` is missing.

**Rationale:** Next.js App Router Server Components receive `searchParams` as a prop — no middleware, no client logic needed. The guard is a one-liner redirect using `redirect()` from `next/navigation`. Keeps the feature logic thin and co-located with the route.

**Alternative considered:** Middleware at `middleware.ts`. Rejected — adds another file and indirection for a rule that only applies to two routes. Server Component redirect is simpler and more explicit.

### Decision 3: `DirectAccessPage` lives in `features/direct-access/`

**Choice:** Create `features/direct-access/pages/DirectAccessPage.tsx` following existing conventions.

**Rationale:** Consistent with all other feature pages. Even though this page has no hooks or domain logic today, the folder establishes the right home if copy or behaviour evolves.

## Next.js page / layout involved

- `app/page.tsx` — replaced entirely; renders `<DirectAccessPage />`
- `app/(auth)/sign-in/page.tsx` — adds server-side `searchParams` guard before rendering `<SignInPage />`
- `app/(auth)/sign-up/page.tsx` — same guard as sign-in (sign-up is only reachable via the sign-in link which carries OAuth params)

New component:
- `features/direct-access/pages/DirectAccessPage.tsx` — static Server Component; no `"use client"` needed

## Risks / Trade-offs

- **Legitimate direct sign-out links break** → If any app deep-links to `/sign-in` without OAuth params (e.g., for a "sign out then sign in again" flow), those will now redirect to `/`. Mitigation: this is intentional — apps should re-initiate the OAuth flow rather than deep-linking into the SSO.
- **Copy is fixed in `locales/en.json`** → If the message needs to change per-environment (e.g., include a support contact), it must go through a code change. Acceptable for an internal tool.
