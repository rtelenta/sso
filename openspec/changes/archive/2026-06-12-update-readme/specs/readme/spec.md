## ADDED Requirements

### Requirement: README describes the project
`README.md` SHALL clearly state that this is an internal SSO platform that implements the OAuth2 Authorization Code flow via `@better-auth/oauth-provider`, and list the core auth methods supported (email/password, magic link, Google OAuth).

#### Scenario: Developer reads README for the first time
- **WHEN** a developer opens `README.md`
- **THEN** they can understand what the project does and who uses it within the first two sections

### Requirement: README lists prerequisites
`README.md` SHALL list all tools and accounts required before setup: Bun, PostgreSQL, and a `.env` file based on `.env.example`.

#### Scenario: Developer checks prerequisites
- **WHEN** a developer reads the prerequisites section
- **THEN** they know exactly what must be installed or provisioned before running setup steps

### Requirement: README provides a quick-start setup sequence
`README.md` SHALL include a numbered setup sequence: clone, install, copy env, run migrations, seed DB, start dev server.

#### Scenario: Developer follows quick-start
- **WHEN** a developer follows the quick-start steps in order
- **THEN** the app is running locally at `http://localhost:3000`

### Requirement: README lists all available scripts
`README.md` SHALL list every script in `package.json` with a one-line description of what each does.

#### Scenario: Developer looks up what `db:seed` does
- **WHEN** a developer scans the scripts section
- **THEN** they find `bun run db:seed` with a description explaining it seeds the dev OAuth client

### Requirement: README links to further documentation
`README.md` SHALL include a "Documentation" section with links to `docs/integration-guide.md` and `docs/local-setup.md`, and a note about the Bruno API collection at `bruno/sso-api/`.

#### Scenario: Developer needs to integrate a downstream app
- **WHEN** a developer reads the documentation section
- **THEN** they find a direct link to `docs/integration-guide.md`
