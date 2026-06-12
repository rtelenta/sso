## MODIFIED Requirements

### Requirement: Hono app is defined in `lib/api/index.ts`
The Hono application instance SHALL be defined and exported from `lib/api/index.ts`. `lib/api/index.ts` is the assembly point only — it SHALL NOT contain business logic. Domain-specific route implementations SHALL live in `features/<domain>/api/` and be imported by `lib/api/index.ts`. The catch-all Next.js route handler SHALL import from `lib/api/index.ts`.

#### Scenario: App instance is importable
- **WHEN** `app/api/[...route]/route.ts` imports the Hono app
- **THEN** it imports the named export `app` from `@/lib/api`

#### Scenario: Base path is set to `/api`
- **WHEN** the Hono app is initialized
- **THEN** its base path is set to `/api` so route definitions don't repeat the prefix

#### Scenario: Domain route files live in features
- **WHEN** a new domain-specific Hono route file is created
- **THEN** it is placed under `features/<domain>/api/` and imported into `lib/api/index.ts`, not placed in `lib/api/routes/`
