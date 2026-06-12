## 1. Fix Drizzle Adapter Schema Option

- [x] 1.1 In `lib/auth.ts`, add `import * as schema from "@/db/schema"` and pass `schema` to `drizzleAdapter`: `drizzleAdapter(db, { provider: "pg", schema })`

## 2. Verification

- [x] 2.1 Run `bun run build` — confirm no TypeScript errors
- [x] 2.2 Start the dev server and attempt sign-up with a new email — confirm the request returns 2xx and no `BetterAuthError` appears in server logs
