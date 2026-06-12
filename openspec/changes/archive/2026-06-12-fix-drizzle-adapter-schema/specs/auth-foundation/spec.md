## MODIFIED Requirements

### Requirement: better-auth is connected to the Drizzle database adapter
The better-auth instance SHALL use the Drizzle adapter (`better-auth/adapters/drizzle`) to persist session and user data, using the `db` client from `@/db`. The database provider SHALL be set to `"pg"`. The full Drizzle schema object (all table exports from `@/db/schema`) SHALL be passed as the `schema` option so better-auth can resolve its internal model names to table definitions.

#### Scenario: Auth data persistence is routed through Drizzle
- **WHEN** better-auth needs to read or write user/session data
- **THEN** it uses the Drizzle adapter connected to the PostgreSQL database

#### Scenario: Schema is passed to the Drizzle adapter
- **WHEN** the better-auth instance is initialized
- **THEN** the `drizzleAdapter` receives the full schema object (via `* as schema` import from `@/db/schema`) so that models like `user`, `session`, `account`, and `verification` can be resolved at runtime
