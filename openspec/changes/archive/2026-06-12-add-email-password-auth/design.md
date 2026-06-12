## Context

better-auth is wired up but has no auth methods enabled. The `emailAndPassword` option is a first-class built-in (not a plugin) that activates sign-in/sign-up endpoints and password hashing. The 4 core DB tables (user, session, account, verification) must be created via a Drizzle migration before the endpoints will work.

## Goals / Non-Goals

**Goals:**
- Enable `emailAndPassword` in `lib/auth.ts`
- Write the Drizzle schema for all 4 better-auth core tables
- Generate and apply the migration
- Create the client-side auth client at `lib/auth-client.ts`
- Build `/sign-in` and `/sign-up` pages with react-hook-form + zod + shadcn/ui
- Add `useSignIn` and `useSignUp` mutation hooks under `features/auth/hooks/`

**Non-Goals:**
- Email verification on sign-up
- Password reset flow
- OAuth2 code exchange / JWT issuing for downstream apps

## Decisions

### `emailAndPassword` as a config option, not a plugin

better-auth ships email/password as a built-in via `emailAndPassword: { enabled: true }` in the top-level config, not as a separate plugin import. This keeps `lib/auth.ts` minimal:

```ts
// lib/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: BETTER_AUTH_SECRET,
  baseURL: NEXT_PUBLIC_APP_URL,
  emailAndPassword: { enabled: true },
});
```

### Drizzle schema for better-auth tables

The 4 core tables are written manually in `db/schema/index.ts` rather than generated, because better-auth ships no Drizzle schema generator CLI. All PKs are `text` (UUID v7 generated at application level). Foreign keys use `text` references to match.

```ts
// db/schema/index.ts
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### IDs are text columns, not UUID columns

better-auth generates its own IDs (nanoid-based strings by default) — they are not UUID v7. The `id` columns are `text("id")`, not `uuid`. The UUID v7 convention applies to domain tables we create ourselves, not to better-auth's managed tables.

### Auth client lives in `lib/auth-client.ts`

The client-side better-auth instance is a separate file that imports `createAuthClient` from `better-auth/client`. It is only imported by React client components — never by server-side code:

```ts
// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { NEXT_PUBLIC_APP_URL } from "@/lib/constants";

export const authClient = createAuthClient({
  baseURL: NEXT_PUBLIC_APP_URL,
});
```

### Hooks wrap `authClient` mutations with TanStack Query

Sign-in and sign-up are mutations. The `useMutation` hook wraps the `authClient.signIn.email` and `authClient.signUp.email` calls:

```ts
// features/auth/hooks/useSignIn.ts
export function useSignIn() {
  return useMutation({
    mutationFn: async (data: SignInInput) => {
      const res = await authClient.signIn.email(data);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });
}
```

### Pages use a route group `(auth)` for layout isolation

Sign-in and sign-up pages live under `app/(auth)/` so a shared centered layout can be applied without affecting other routes:

```
app/
  (auth)/
    layout.tsx        ← centered card layout
    sign-in/
      page.tsx        ← thin shell → <SignInPage />
    sign-up/
      page.tsx        ← thin shell → <SignUpPage />
```

Feature page components live at:
```
features/auth/pages/SignInPage.tsx
features/auth/pages/SignUpPage.tsx
```

### Form validation with zod + react-hook-form

Zod schema is defined first and the form type is derived from it. shadcn `Form`, `Input`, and `Button` components are used:

```ts
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type SignInInput = z.infer<typeof signInSchema>;
```

## Risks / Trade-offs

- **No email verification**: `emailAndPassword.requireEmailVerification` is `false`. Any email can register without confirmation. Acceptable for internal SSO where user management is controlled. → Mitigation: email verification can be added in a later change without breaking existing users.
- **IDs not UUID v7**: better-auth manages session/user IDs with its own ID generation. Downstream queries can't rely on UUID v7 time-ordering for these tables. → Acceptable: these tables are accessed via better-auth's API, not raw queries.
- **`NEXT_PUBLIC_APP_URL` in client bundle**: The `authClient` references `NEXT_PUBLIC_APP_URL` which is already public. No secret is exposed. → No mitigation needed.

## Migration Plan

1. Enable `emailAndPassword` and write the Drizzle schema
2. Run `bunx drizzle-kit generate` to create the migration file
3. Run `bunx drizzle-kit migrate` to apply it (requires a running database)
4. Build and wire UI pages
