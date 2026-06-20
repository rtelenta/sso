# SSO Platform 🔐

_Internal Single Sign-On platform. Downstream internal apps delegate all authentication here — users never enter a password in your app, only on the SSO._

The SSO implements the **OAuth2 Authorization Code flow** via [`@better-auth/oauth-provider`](https://www.better-auth.com/). It issues short-lived access JWTs (EdDSA, 15-minute TTL) and long-lived refresh tokens. Tokens are exchanged server-side only — they never appear in the browser URL.

Supported auth methods: email/password, magic link, Google OAuth, and password recovery.

## Getting Started 🚀

See [docs/local-setup.md](docs/local-setup.md) for a detailed step-by-step guide.

### Prerequisites 📋

- [Bun](https://bun.sh) ≥ 1.0
- PostgreSQL database (local or [Neon](https://neon.tech))

### Installation 🔧

1. Clone and install dependencies

```bash
git clone https://github.com/rtelenta/sso
cd sso
bun install
```

2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your values — see docs/local-setup.md for details
```

3. Run database migrations

```bash
bun run db:migrate
```

4. Seed the dev OAuth client

```bash
bun run db:seed
```

5. Start the development server

```bash
bun run dev
```

Open [http://sso.localhost:3005](http://sso.localhost:3005) to see the SSO sign-in page.

## Scripts ⚙️

| Script                | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `bun run dev`         | Start the Next.js development server                           |
| `bun run build`       | Build for production                                           |
| `bun run start`       | Start the production server                                    |
| `bun run lint`        | Run ESLint                                                     |
| `bun run db:generate` | Generate Drizzle migration files from schema changes           |
| `bun run db:migrate`  | Apply pending migrations to the database                       |
| `bun run db:push`     | Push schema directly to DB without a migration file (dev only) |
| `bun run db:seed`     | Seed the `dev-client` OAuth client into the database           |

## Documentation 📖

| Resource                                               | Description                                                                                                                                              |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [docs/integration-guide.md](docs/integration-guide.md) | Full guide for integrating a downstream app with this SSO (OIDC discovery, token exchange, JWT validation, refresh, logout)                              |
| [docs/local-setup.md](docs/local-setup.md)             | Step-by-step local environment setup (env vars, DB, migrations, seed)                                                                                    |
| [bruno/sso-api/](bruno/sso-api/)                       | Bruno API collection — interactive examples for all four OAuth flow steps. Open in [Bruno](https://www.usebruno.com/) and select the `local` environment |

## Built with 🛠️

- [Bun](https://bun.sh) — runtime and package manager
- [Next.js 16](https://nextjs.org) — App Router + React 19
- [better-auth](https://www.better-auth.com/) + [@better-auth/oauth-provider](https://www.better-auth.com/) — authentication and OAuth2 provider
- [Drizzle ORM](https://orm.drizzle.team/) — type-safe ORM
- [PostgreSQL](https://www.postgresql.org/) — database
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) — styling and components
- [Hono](https://hono.dev/) — API layer
- [TanStack Query](https://tanstack.com/query) — client-side data fetching
- [Zod](https://zod.dev/) — schema validation

---

Made with ❤️ by [Renzo Telenta](https://github.com/rtelenta)
