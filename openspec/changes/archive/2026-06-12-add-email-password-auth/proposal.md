## Why

The SSO has better-auth configured but no auth methods enabled — users cannot sign in or register. Email + password is the foundational auth method and must ship before any downstream apps can delegate authentication.

## What Changes

- Enable `emailAndPassword: { enabled: true }` in `lib/auth.ts`
- Add Drizzle schema for better-auth's 4 core tables: `user`, `session`, `account`, `verification`
- Generate and apply the initial Drizzle migration
- Create `lib/auth-client.ts` (client-side better-auth instance for React hooks)
- Add sign-in page at `/sign-in` with email + password form
- Add sign-up page at `/sign-up` with name, email, password form
- Add `useSignIn` and `useSignUp` hooks under `features/auth/hooks/`
- Add all UI copy to `locales/en.json`

## Capabilities

### New Capabilities

- `email-password-auth`: Email + password sign-in, sign-up, and sign-out. Covers the auth client, DB schema migration, UI pages, forms, and TanStack Query mutation hooks.

### Modified Capabilities

*(none — no existing spec requirements change)*

## Impact

- **DB schema**: 4 new tables (`user`, `session`, `account`, `verification`) added to `db/schema/index.ts`; first real Drizzle migration generated and applied
- **API**: `POST /api/auth/sign-in/email`, `POST /api/auth/sign-up/email`, `POST /api/auth/sign-out` become active via the existing Hono → better-auth mount
- **UI**: Two new pages (`/sign-in`, `/sign-up`) with shadcn/ui form components; new locale keys added
- **Lib**: `lib/auth-client.ts` added as the client-side auth entry point
- **Env vars**: No new vars required (all three existing vars already cover this)

## Non-goals

- Email verification before sign-in — `requireEmailVerification` stays `false`
- Password reset / recovery — separate change
- Session expiry UI (e.g. "your session expired" redirect) — separate change
- Any redirect-to-app flow (OAuth2 code exchange) — separate change
