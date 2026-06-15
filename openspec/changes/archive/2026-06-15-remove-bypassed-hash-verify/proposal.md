## Why

The `oauthProvider` plugin in `lib/auth.ts` is configured with no-op `hash` and `verify` functions, meaning OAuth2 client secrets are stored as plaintext in the database. This is a security vulnerability that needs to be corrected before any downstream apps register real OAuth clients.

## What Changes

- Remove the bypassed `storeClientSecret` config block from the `oauthProvider` plugin so better-auth uses its secure default hashing behaviour.
- Verify that the default behaviour actually hashes secrets (one-way, e.g. SHA-256 or bcrypt) and that client verification still works end-to-end.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `oauth-provider`: The client secret storage contract changes — secrets will no longer be stored as plaintext. Any existing registered OAuth clients will have their stored secret invalidated by this change and must be re-registered.

## Impact

- **Code**: Single change in `lib/auth.ts` — remove the `storeClientSecret` option.
- **API**: No API surface change; token exchange and client authentication behaviour remains the same from the outside.
- **DB**: Existing rows in the OAuth clients table that have a plaintext secret stored will become unusable. If any real clients exist, they must be re-registered after the change.
- **Dependencies**: No new packages required — better-auth provides secure defaults.
- **Non-goals**: Implementing custom hashing (bcrypt, argon2) beyond what better-auth provides by default; migrating existing client secrets.
