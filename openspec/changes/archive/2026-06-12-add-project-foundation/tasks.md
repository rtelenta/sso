## 1. Install Dependencies

- [x] 1.1 Install runtime dependencies: `better-auth`, `hono`, `@hono/node-server`, `drizzle-orm`, `postgres`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `uuid-v7`
- [x] 1.2 Install dev dependencies: `drizzle-kit`, `@types/better-auth` (if available)
- [x] 1.3 Initialize shadcn/ui by running `bunx shadcn@latest init` (creates `components.json` and `components/ui/`)

## 2. Environment & Constants

- [x] 2.1 Create `.env.example` with `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` entries (each with a placeholder value and comment)
- [x] 2.2 Create `lib/constants.ts` exporting `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` from `process.env`

## 3. Database Layer

- [x] 3.1 Create `db/schema/index.ts` as an empty schema file (no tables yet)
- [x] 3.2 Create `db/index.ts` with a `postgres` client and Drizzle instance exported as `db`
- [x] 3.3 Create `drizzle.config.ts` at the project root pointing to `db/schema/index.ts` and `db/migrations/`

## 4. API Layer

- [x] 4.1 Create `lib/api/index.ts` with a Hono app base-pathed at `/api` and exported as `app`
- [x] 4.2 Add `GET /api/health` route to `lib/api/index.ts` returning `{ "status": "ok" }`
- [x] 4.3 Create `app/api/[...route]/route.ts` as the Next.js catch-all handler wiring all HTTP methods to the Hono app

## 5. Auth Foundation

- [x] 5.1 Create `lib/auth.ts` with a base better-auth instance using the Drizzle adapter, `BETTER_AUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` (no plugins)
- [x] 5.2 Mount the better-auth handler inside the Hono app in `lib/api/index.ts` at `/api/auth/*`

## 6. UI Infrastructure

- [x] 6.1 Create `components/providers.tsx` as a `"use client"` component wrapping children in `QueryClientProvider` with a stable `QueryClient` instance
- [x] 6.2 Update `app/layout.tsx` to wrap `{children}` with `<Providers>` and update metadata title/description to reflect the SSO project
