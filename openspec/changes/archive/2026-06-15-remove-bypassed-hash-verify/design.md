## Context

`lib/auth.ts` configures the `oauthProvider` plugin with a custom `storeClientSecret` block that replaces hashing with identity functions — secrets pass through as plaintext to the database. This was likely added as a temporary workaround during initial development. The library defaults to SHA-256 hashing when no override is provided, which is the correct behavior for an OAuth2 server.

There is a secondary issue: `db/seed.ts` inserts `clientSecret` values directly into the `oauthClient` table, bypassing the library's registration flow. After the bypass is removed, the stored value the library compares against must itself be a SHA-256 hash — not the raw string from the env var.

Current flow (broken):
1. Seed writes raw `CLIENT_SECRET` string into `oauthClient.clientSecret`
2. `storeClientSecret.verify` compares raw `==` raw → match ✓ (but insecure)

Correct flow after this change:
1. Seed hashes `CLIENT_SECRET` with SHA-256 before writing to `oauthClient.clientSecret`
2. Library's default verifier hashes the incoming secret and does a constant-time compare against the stored hash → match ✓

## Goals / Non-Goals

**Goals:**
- Remove the no-op `storeClientSecret` override so better-auth defaults to SHA-256 hashing.
- Update the seed so stored secrets are hashed before insertion, keeping the seed-based workflow intact.
- Ensure the end-to-end token exchange flow continues to work after the change.

**Non-Goals:**
- Switching to bcrypt or argon2 — SHA-256 is sufficient for high-entropy OAuth client secrets and is what the library expects by default.
- Migrating existing production data — this is a dev-only system with no live clients; re-seeding is the rollout plan.
- Changing how clients are registered (seed stays as direct DB insert, not an API call).

## Decisions

**Remove, don't replace, the `storeClientSecret` block**

The library default (`"hashed"` mode via SHA-256) is exactly what we want. Rolling a custom hash function adds surface area for mistakes. Removing the override delegates to the library entirely.

Alternative considered: replacing with `storeClientSecret: "hashed"` (explicit). Equivalent in behaviour but adds a line that conveys no information over the default — rejected.

**Hash in the seed using `@better-auth/utils/hash`**

The seed must write the same hash that the library would produce, so it must use the same hasher (`createHash("SHA-256")` from `@better-auth/utils/hash`, already a transitive dep). This avoids introducing a new dependency.

Alternative considered: switching the seed to call the OAuth provider's client-registration API. More correct in theory, but adds network/auth setup to a simple script; rejected as over-engineering for a seed.

## Risks / Trade-offs

**Existing plaintext records become invalid** → Mitigation: delete all rows from `oauthClient` and re-run `bun db:seed`. Document this as part of the rollout.

**SHA-256 is not a password-hashing function** — it is fast and has no salt. For high-entropy OAuth secrets (256+ bit random strings) this is the standard and what the library ships. If secrets were short or user-chosen, this would be a problem. They are not.

## Migration Plan

1. Deploy the code change (remove bypass from `lib/auth.ts`, update seed hashing).
2. Clear existing OAuth client rows: `DELETE FROM oauth_client;` (or `TRUNCATE oauth_client;`).
3. Re-run `bun db:seed` to repopulate with hashed secrets.
4. Restart the server and verify token exchange works end-to-end.

Rollback: revert the two-line `storeClientSecret` block in `lib/auth.ts`. No schema migration involved.
