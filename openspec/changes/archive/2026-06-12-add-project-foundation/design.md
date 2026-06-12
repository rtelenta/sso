## Context

The project was created with `create-next-app` and has no runtime dependencies beyond Next.js and React. Before any feature work, the full stack needs to be installed and wired together: Hono for API routing, better-auth for authentication, Drizzle ORM for database access, TanStack Query for client-side data fetching, and shadcn/ui for the component library.

This is a cross-cutting infrastructure change that touches every layer of the stack.

## Goals / Non-Goals

**Goals:**
- Install and configure all required runtime and dev dependencies
- Wire Hono into Next.js at `app/api/[...route]/route.ts`
- Create `lib/auth.ts` with a base better-auth instance (no plugins)
- Set up Drizzle ORM with a PostgreSQL client and empty schema + migrations directories
- Initialize shadcn/ui with `components.json`
- Establish the canonical folder structure (`lib/`, `features/`, `components/`, `hooks/`, `types/`, `db/`)
- Create `lib/constants.ts` as the sole `process.env` access point
- Wrap the app in a TanStack Query provider
- Create `.env.example` with all required vars

**Non-Goals:**
- No auth plugins (magic link, Google, email/password) — those are feature changes
- No database tables (no Drizzle migrations with content) — schema comes with auth features
- No UI pages or forms

## Decisions

### Hono mounted as Next.js catch-all route handler

Hono handles all `/api/*` traffic via a catch-all handler at `app/api/[...route]/route.ts`. This is the standard Hono + Next.js App Router integration pattern. Alternatives like a standalone Express server would require a separate process and more complex deployment.

```ts
// app/api/[...route]/route.ts
import { handle } from "hono/vercel";
import { app } from "@/lib/api";

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
```

The Hono app base:
```ts
// lib/api/index.ts
import { Hono } from "hono";
export const app = new Hono().basePath("/api");
```

### better-auth configuration

better-auth is initialized once in `lib/auth.ts` and exported. No plugins are added here; the base instance establishes the DB connection and secret. Auth plugins (social, magic-link) get added in feature changes.

```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { BETTER_AUTH_SECRET, NEXT_PUBLIC_APP_URL } from "@/lib/constants";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: BETTER_AUTH_SECRET,
  baseURL: NEXT_PUBLIC_APP_URL,
});
```

### Drizzle ORM with `postgres` driver

`postgres` (the `postgres` npm package, not `pg`) is the recommended driver for Bun + Drizzle. The DB client is a singleton in `db/index.ts`. Drizzle config lives at `drizzle.config.ts` in the project root.

```ts
// db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DATABASE_URL } from "@/lib/constants";

const client = postgres(DATABASE_URL);
export const db = drizzle(client);
```

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./lib/constants";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: DATABASE_URL },
});
```

### TanStack Query provider in layout

The `QueryClientProvider` wraps children in `app/layout.tsx`. Because the layout is a Server Component, the provider must be extracted into a `"use client"` wrapper component.

```ts
// components/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

### shadcn/ui initialization

shadcn/ui is initialized with `bunx shadcn@latest init`, creating `components.json` and `components/ui/`. The CSS variables approach is used (not inline styles), compatible with Tailwind CSS v4.

### Environment variables

All `process.env` access is centralized in `lib/constants.ts`. This is the only file allowed to reference `process.env`.

```ts
// lib/constants.ts
export const DATABASE_URL = process.env.DATABASE_URL!;
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
```

## Risks / Trade-offs

- **`postgres` driver vs `pg`**: `postgres` is preferred for Bun but is less common in community examples. Drizzle docs support both; sticking with `postgres` for Bun compatibility. → Mitigation: documented in `drizzle.config.ts` and `db/index.ts`.
- **Empty initial migration**: Drizzle migrations directory will exist but be empty until auth tables are added. `drizzle-kit push` may be needed for local dev until the first real migration is created. → Mitigation: noted in `.env.example`.
- **`DATABASE_URL!` non-null assertion**: Env vars are asserted non-null at import time. If a var is missing, the app crashes at startup. → Mitigation: `.env.example` lists all required vars; startup failure is fast and explicit.
