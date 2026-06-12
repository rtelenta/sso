## Context

Two correctness gaps from the `add-refresh-and-logout` verification:
1. `app/page.tsx` (Server Component) renders sign-out unconditionally.
2. Hono routes return 404 for wrong-method requests — should be 405.

## Goals / Non-Goals

**Goals:**
- Session-gate the home page: show sign-out form only when authenticated
- Return 405 for wrong-method requests on all four OAuth2 routes

**Non-Goals:**
- No persistent nav or layout changes — home page stays minimal
- No new routes or auth flows

## Decisions

### Session-aware home page

`app/page.tsx` is a Server Component — it can `await` directly. Call `auth.api.getSession({ headers: await headers() })` from `next/headers`. This is the same pattern used in `handlePostAuthRedirect.ts` and `signOut.ts`.

```tsx
// app/page.tsx
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { signOut } from "@/features/auth/actions/signOut";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    return (
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    );
  }
  return <Link href="/sign-in">Sign in</Link>;
}
```

The page becomes dynamic (server-rendered on demand) because it reads request headers — this is expected and already the case since it uses a Server Action.

### 405 Method Not Allowed via Hono `on` catch-all

Hono's router matches by method then path. For a path that exists under one method but not another, there's no built-in 405 — it falls through to 404. The fix is to add an explicit handler for all other methods.

Hono doesn't have a native "method not allowed" helper, but we can use `app.on([...methods], path, handler)` to handle the wrong-method case, or simply add `router.all('/path', c => c.text('Method Not Allowed', 405))` and place it **after** the specific method handler. Because Hono routes match in registration order and `all` catches everything, it acts as a fallback for unhandled methods.

```ts
// after the POST handler:
logoutRouter.all("/logout", (c) => c.text("Method Not Allowed", 405));
```

Apply the same pattern to `/token`, `/token/refresh`, and `/oauth/start`.

## Risks / Trade-offs

- **Home page now dynamic**: Previously static, now server-rendered on each request (reads session cookie). This is a trivial cost for a placeholder page.
- **`router.all` as fallback**: This relies on registration order in Hono. The `all` handler must be registered after the specific method handlers. All existing route files register the specific handler first, so this is safe.
