## Purpose

Defines the foundation for authentication using better-auth, including the singleton auth instance, database adapter wiring, configuration sourcing, and HTTP handler mounting in Hono.

## Requirements

### Requirement: better-auth instance is exported from `lib/auth.ts`
A single better-auth instance SHALL be created and exported from `lib/auth.ts`. All auth plugin configuration and option tuning SHALL be done in this file. No other file SHALL instantiate a better-auth instance.

#### Scenario: Auth instance is importable
- **WHEN** any server-side code needs to interact with better-auth
- **THEN** it imports the named export `auth` from `@/lib/auth`

### Requirement: better-auth is connected to the Drizzle database adapter
The better-auth instance SHALL use the Drizzle adapter (`better-auth/adapters/drizzle`) to persist session and user data, using the `db` client from `@/db`. The database provider SHALL be set to `"pg"`. The full Drizzle schema object (all table exports from `@/db/schema`) SHALL be passed as the `schema` option so better-auth can resolve its internal model names to table definitions.

#### Scenario: Auth data persistence is routed through Drizzle
- **WHEN** better-auth needs to read or write user/session data
- **THEN** it uses the Drizzle adapter connected to the PostgreSQL database

#### Scenario: Schema is passed to the Drizzle adapter
- **WHEN** the better-auth instance is initialized
- **THEN** the `drizzleAdapter` receives the full schema object (via `* as schema` import from `@/db/schema`) so that models like `user`, `session`, `account`, and `verification` can be resolved at runtime

### Requirement: better-auth secret and base URL are sourced from constants
The `secret` option SHALL be sourced from `BETTER_AUTH_SECRET` in `lib/constants.ts`. The `baseURL` option SHALL be sourced from `NEXT_PUBLIC_APP_URL` in `lib/constants.ts`. Neither value SHALL be hardcoded or accessed via `process.env` directly in `lib/auth.ts`.

#### Scenario: Auth configuration uses constants
- **WHEN** `lib/auth.ts` is initialized
- **THEN** `BETTER_AUTH_SECRET` and `NEXT_PUBLIC_APP_URL` are imported from `@/lib/constants`

### Requirement: better-auth route handler is mounted in Hono
All better-auth HTTP handlers SHALL be mounted in the Hono app under the better-auth base path (typically `/api/auth/*`). The Hono app SHALL delegate to better-auth for these routes.

#### Scenario: better-auth handles its own routes
- **WHEN** a client sends a request to `/api/auth/*`
- **THEN** the Hono app delegates the request to the better-auth handler
