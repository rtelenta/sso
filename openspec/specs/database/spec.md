## Purpose

Defines the database access layer using Drizzle ORM with PostgreSQL, including the singleton client, schema organization, migration management, and configuration.

## Requirements

### Requirement: Drizzle ORM client is a singleton exported from `db/index.ts`
The application SHALL have a single Drizzle ORM database client exported from `db/index.ts`. All database access throughout the application SHALL import `db` from `@/db`. No file other than `db/index.ts` SHALL instantiate a database connection.

#### Scenario: Database access from any module
- **WHEN** any module needs to run a database query
- **THEN** it imports the `db` client from `@/db` and uses Drizzle query builders

#### Scenario: Single connection pool
- **WHEN** the application starts
- **THEN** only one `postgres` client instance is created, reused across all requests

### Requirement: Drizzle schema is defined in `db/schema/index.ts`
All Drizzle table definitions SHALL be placed in `db/schema/index.ts` (or files imported and re-exported by it). The schema file is the single source of truth for the database model.

#### Scenario: Schema is importable
- **WHEN** `drizzle.config.ts` references the schema
- **THEN** it points to `./db/schema/index.ts`

### Requirement: Migrations are managed by Drizzle Kit
All database schema changes SHALL be managed through Drizzle Kit migrations stored in `db/migrations/`. Developers SHALL NOT write raw SQL migrations by hand. `drizzle-kit generate` creates migration files; `drizzle-kit migrate` applies them.

#### Scenario: Generating a migration
- **WHEN** a developer changes `db/schema/index.ts` and runs `bunx drizzle-kit generate`
- **THEN** a new SQL migration file is created in `db/migrations/`

#### Scenario: Applying migrations
- **WHEN** a developer runs `bunx drizzle-kit migrate`
- **THEN** all pending migrations in `db/migrations/` are applied to the database

### Requirement: `drizzle.config.ts` is at the project root
A `drizzle.config.ts` file SHALL exist at the project root, referencing `db/schema/index.ts` as the schema source and `db/migrations/` as the output directory. The database URL SHALL be read from `lib/constants.ts`, not directly from `process.env`.

#### Scenario: Drizzle Kit commands work from project root
- **WHEN** a developer runs any `drizzle-kit` command from the project root
- **THEN** it reads the config from `drizzle.config.ts` without additional flags
