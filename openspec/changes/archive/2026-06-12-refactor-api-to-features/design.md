## Context

`lib/api/routes/oauth.ts` and `lib/api/routes/token.ts` contain Hono route handlers with OAuth2 business logic: HMAC-cookie validation, auth code DB lookups, JWT signing via `jose`, and refresh token management. The project convention is that `lib/` holds generic, domain-free infrastructure, while domain logic lives in `features/<domain>/`. The route files violate this boundary — they belong in `features/oauth2/`.

`lib/api/index.ts` itself has no business logic (Hono app instantiation, base path setup, better-auth delegation, health check). It stays.

## Goals / Non-Goals

**Goals:**
- Move `lib/api/routes/oauth.ts` → `features/oauth2/api/oauth.ts`
- Move `lib/api/routes/token.ts` → `features/oauth2/api/token.ts`
- Update import paths in `lib/api/index.ts`
- Delete `lib/api/routes/` directory
- Establish `features/<domain>/api/` as the canonical location for domain-specific Hono route files

**Non-Goals:**
- No changes to route paths, request/response shapes, or runtime behavior
- No changes to `lib/api/index.ts` beyond two import paths
- No refactoring of route internals
- No introduction of new route files

## Decisions

### Keep `lib/api/index.ts` as the Hono assembly point

**Decision:** `lib/api/index.ts` stays where it is; only the route implementation sub-files move.

**Rationale:** The file has no business logic — it wires up routes and delegates better-auth. It is the infrastructure entry point. Moving it would gain nothing and break the import in `app/api/[...route]/route.ts`.

**Alternative considered:** Move everything (including `index.ts`) into `features/`. Rejected because it would create an ambiguous home for cross-feature concerns (health check, better-auth handler) and require changes to the Next.js route handler.

### Introduce `features/<domain>/api/` as the route sub-directory

**Decision:** Route files land in `features/oauth2/api/`, not `features/oauth2/` root or `features/oauth2/routes/`.

**Rationale:** Mirrors the existing sub-directory pattern (`hooks/`, `utils/`, `pages/`, `actions/`). `api/` clearly communicates "Hono route handlers for this domain." `routes/` would also work but `api/` is more consistent with how the project refers to the HTTP API layer.

## Risks / Trade-offs

- **Risk:** Future developers add new routes back in `lib/api/routes/` out of habit.
  **Mitigation:** The updated `api-routing` spec documents the new convention; `lib/api/routes/` no longer exists to fall back on.

- **Trade-off:** `lib/api/index.ts` now imports across the `lib/` → `features/` boundary, which is slightly asymmetric. This is intentional — `index.ts` is the assembly point and explicitly needs to know about feature route files. The direction of the dependency (infra imports features) is correct; features never import `lib/api/index.ts`.
