## Why

The project was bootstrapped with `create-next-app` but none of the required dependencies are installed — better-auth, Hono, Drizzle ORM, TanStack Query, shadcn/ui, zod, and more are all absent. No feature work can start until the stack is wired up.

## What Changes

- Install all runtime dependencies: `better-auth`, `hono`, `drizzle-orm`, `@tanstack/react-query`, `react-hook-form`, `zod`, `uuid-v7`, PostgreSQL driver (`postgres`)
- Install dev dependencies: `drizzle-kit`, shadcn/ui CLI
- Initialize shadcn/ui (components.json, base component primitives)
- Create `lib/constants.ts` as the single `process.env` access point
- Create `lib/auth.ts` with base better-auth configuration (no plugins yet)
- Create `lib/api/index.ts` with a base Hono app
- Wire Hono into Next.js at `app/api/[...route]/route.ts`
- Create `db/schema/index.ts` and `db/migrations/` with Drizzle config
- Establish folder structure: `components/`, `hooks/`, `features/`, `types/`
- Update `app/layout.tsx` with TanStack Query provider and corrected metadata
- Create `.env.example` with all required environment variables

## Capabilities

### New Capabilities

- `project-infrastructure`: Package installation, folder scaffolding, env config, `lib/constants.ts`, and app layout/provider setup
- `api-routing`: Hono app mounted at `/api/*` inside Next.js route handlers
- `database`: Drizzle ORM + PostgreSQL client setup, schema directory, migrations directory, and `drizzle.config.ts`
- `auth-foundation`: better-auth base configuration in `lib/auth.ts` (no auth plugins — those come in feature changes)

### Modified Capabilities

*(none — no existing specs)*

## Impact

- **Dependencies**: All major runtime + dev packages added; `bun.lock` will change significantly
- **UI**: `app/layout.tsx` updated (metadata, TanStack Query provider); shadcn/ui primitives added to `components/ui/`
- **API**: New catch-all route handler at `app/api/[...route]/route.ts`
- **DB schema**: `db/schema/` and `drizzle.config.ts` created; first migration may be empty or schema-only
- **Env vars required**: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`

## Non-goals

- No auth methods configured (email/password, magic link, Google — those are feature changes)
- No database tables created for auth (better-auth schema migration is a feature-change concern)
- No UI pages or forms — purely infrastructure
- No deployment configuration
