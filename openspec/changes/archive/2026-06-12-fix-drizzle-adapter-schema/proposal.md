## Why

Sign-up and sign-in are broken with a 500. `drizzleAdapter` is called without a `schema` option, so better-auth cannot locate any of its required models (`user`, `session`, `account`, `verification`) at runtime and throws `BetterAuthError: The model "user" was not found in the schema object`.

## What Changes

- In `lib/auth.ts`, import all schema exports as a namespace and pass them to `drizzleAdapter` as the `schema` option.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None — no spec-level behavior changes. This restores the intended behavior that was always specified.

## Non-goals

- No changes to the schema itself
- No changes to any other file

## Impact

- **UI**: no
- **API**: no (sign-up/sign-in paths unchanged; they just stop returning 500)
- **DB schema**: no
- **better-auth plugins**: no
- **Env vars**: no
- **Files touched**: `lib/auth.ts` only
