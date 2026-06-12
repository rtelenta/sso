## ADDED Requirements

### Requirement: Hono handles all `/api/*` routes
All HTTP requests under the `/api/*` path prefix SHALL be handled by a Hono application instance. Next.js App Router SHALL NOT define individual route handlers for API endpoints — all API logic goes through Hono.

#### Scenario: API request is routed to Hono
- **WHEN** a client sends any HTTP request to a path starting with `/api/`
- **THEN** the request is handled by the Hono app mounted at `app/api/[...route]/route.ts`

#### Scenario: All HTTP methods are supported
- **WHEN** a client sends GET, POST, PUT, PATCH, or DELETE requests to `/api/*`
- **THEN** Hono receives and can handle each method

### Requirement: Hono app is defined in `lib/api/index.ts`
The Hono application instance SHALL be defined and exported from `lib/api/index.ts`. Route registrations SHALL be added to this file (or sub-files imported by it). The catch-all Next.js route handler SHALL import from `lib/api/index.ts`.

#### Scenario: App instance is importable
- **WHEN** `app/api/[...route]/route.ts` imports the Hono app
- **THEN** it imports the named export `app` from `@/lib/api`

#### Scenario: Base path is set to `/api`
- **WHEN** the Hono app is initialized
- **THEN** its base path is set to `/api` so route definitions don't repeat the prefix

### Requirement: Health check endpoint exists
The Hono app SHALL expose a `GET /api/health` endpoint that returns HTTP 200 with a JSON body `{ "status": "ok" }`. This confirms the API layer is wired correctly.

#### Scenario: Health check returns 200
- **WHEN** a client sends `GET /api/health`
- **THEN** the response is HTTP 200 with body `{ "status": "ok" }`
