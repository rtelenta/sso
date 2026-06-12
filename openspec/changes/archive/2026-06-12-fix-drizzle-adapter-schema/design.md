## Context

`lib/auth.ts` calls `drizzleAdapter(db, { provider: "pg" })` without passing the `schema` option. better-auth's Drizzle adapter requires the full schema object to map its internal model names (`user`, `session`, `account`, `verification`) to the actual Drizzle table definitions. Without it, every auth operation (sign-up, sign-in, session reads) throws at runtime.

## Goals / Non-Goals

**Goals:**
- Pass the schema to `drizzleAdapter` so better-auth can locate its tables

**Non-Goals:**
- No other changes to `lib/auth.ts`
- No schema changes

## Decisions

### Import schema as a namespace

```ts
import * as schema from "@/db/schema";

drizzleAdapter(db, { provider: "pg", schema })
```

The adapter expects a plain object where keys are table names and values are Drizzle table definitions. A namespace import (`* as schema`) of `db/schema/index.ts` produces exactly that shape — all named exports become properties of the object.

## Risks / Trade-offs

None. This is a missing required argument; there is no alternative approach.
