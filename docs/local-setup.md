# Local Setup Guide

Step-by-step guide for running the SSO platform on your machine.

---

## 1. Environment Variables

Copy the example file and fill in each value:

```bash
cp .env.example .env
```

| Variable | Description | How to get it |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | See [Database Setup](#2-database-setup) below |
| `BETTER_AUTH_SECRET` | Secret used to sign sessions and tokens | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Public base URL of this SSO app (no trailing slash) | `http://localhost:3000` for local dev |
| `DEV_CLIENT_SECRET` | Secret for the seeded `dev-client` OAuth client | Any string, e.g. `dev-secret`. Must match what the Bruno collection uses |

---

## 2. Database Setup

### Option A — Local PostgreSQL

1. Install PostgreSQL and create a database:
   ```bash
   createdb sso
   ```
2. Set `DATABASE_URL` in your `.env`:
   ```
   DATABASE_URL=postgres://postgres:password@localhost:5432/sso
   ```

### Option B — Neon (hosted)

1. Create a free project at [neon.tech](https://neon.tech)
2. Copy the connection string from the Neon dashboard
3. Set it as `DATABASE_URL` in your `.env` (Neon strings include `sslmode=require`)

### Run Migrations

Apply all pending migrations:

```bash
bun run db:migrate
```

You should see each migration file applied without errors. To verify, connect to your DB and check that the `user`, `session`, `oauth_client`, and related tables exist.

---

## 3. Seeding the Dev OAuth Client

The seed script inserts a `dev-client` entry into `oauth_client` so you can run the OAuth flow locally without manual DB setup.

```bash
bun run db:seed
```

Expected output:
```
Seeded dev-client
```

If you see `dev-client already exists, skipping`, the client is already there — no action needed.

**What `DEV_CLIENT_SECRET` controls:** The seed script stores this value as the `clientSecret` for `dev-client`. The Bruno collection's `local` environment is pre-configured with `client_secret: dev-secret` — if you change `DEV_CLIENT_SECRET`, update the Bruno environment to match.

---

## 4. Start the Dev Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the SSO sign-in page.

---

## 5. Testing the OAuth Flow with Bruno

The repo includes a [Bruno](https://www.usebruno.com/) API collection at `bruno/sso-api/` with four pre-built requests covering the full OAuth2 Authorization Code flow.

### Setup

1. Install Bruno from [usebruno.com](https://www.usebruno.com/)
2. Open Bruno → **Open Collection** → select the `bruno/sso-api/` folder
3. In the top-right environment dropdown, select **local**

### Running the flow

| # | Request | How to run |
|---|---|---|
| 01 | OAuth Start | Click **Run** — expect a 302 redirect to `/sign-in`. Complete the full flow manually in a browser first to get a `code` |
| 02 | Token Exchange | Paste the `code` from the browser callback URL into the `code` env variable, then run |
| 03 | Token Refresh | Uses the `refresh_token` saved from step 02 — run directly |
| 04 | Token Revoke | Uses the `refresh_token` saved from step 02 — run to revoke |

> **Tip:** Each request has inline documentation in the "Docs" tab explaining what it does and what to expect.

For integrating a downstream app, see [integration-guide.md](integration-guide.md).
