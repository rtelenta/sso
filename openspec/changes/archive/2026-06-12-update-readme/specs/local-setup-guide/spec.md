## ADDED Requirements

### Requirement: Local setup guide covers environment configuration
`docs/local-setup.md` SHALL explain every variable in `.env.example`, what it is for, and how to obtain a value for it.

#### Scenario: Developer sets up their .env for the first time
- **WHEN** a developer reads the env configuration section
- **THEN** they know what value to set for each variable and how to generate secrets

### Requirement: Local setup guide covers database setup
`docs/local-setup.md` SHALL provide instructions for provisioning a PostgreSQL database (local or Neon), running `bun run db:migrate`, and verifying the migration succeeded.

#### Scenario: Developer runs migrations
- **WHEN** a developer follows the DB setup section
- **THEN** they can run `bun run db:migrate` and have a fully migrated schema

### Requirement: Local setup guide covers seeding the dev OAuth client
`docs/local-setup.md` SHALL explain that `bun run db:seed` inserts the `dev-client` OAuth client and what `DEV_CLIENT_SECRET` controls.

#### Scenario: Developer seeds the database
- **WHEN** a developer runs `bun run db:seed`
- **THEN** a `dev-client` entry exists in `oauth_client` and the Bruno collection can be used immediately

### Requirement: Local setup guide references the Bruno collection
`docs/local-setup.md` SHALL mention the Bruno API collection at `bruno/sso-api/` and instruct the developer to open it in Bruno with the `local` environment selected.

#### Scenario: Developer wants to test the OAuth flow manually
- **WHEN** a developer reads the Bruno section
- **THEN** they know where to find the collection, how to open it, and which environment to select
