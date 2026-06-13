## 1. README Rewrite

- [x] 1.1 Replace `README.md` with project-specific content: title, one-paragraph description, and overview of the OAuth2 Authorization Code flow
- [x] 1.2 Add "Getting Started" section with prerequisites (Bun, PostgreSQL)
- [x] 1.3 Add quick-start setup steps: clone → install → copy `.env.example` → migrate → seed → dev server
- [x] 1.4 Add "Scripts" section listing all `package.json` scripts with one-line descriptions
- [x] 1.5 Add "Documentation" section linking to `docs/integration-guide.md`, `docs/local-setup.md`, and noting the Bruno collection at `bruno/sso-api/`
- [x] 1.6 Add "Built With" section listing the main stack (Bun, Next.js 16, better-auth, Drizzle ORM, PostgreSQL, Tailwind CSS v4, shadcn/ui)

## 2. Local Setup Guide

- [x] 2.1 Create `docs/local-setup.md` with a section explaining each `.env.example` variable and how to obtain a value
- [x] 2.2 Add a DB setup section covering local PostgreSQL and Neon options, running `bun run db:migrate`, and verifying the migration
- [x] 2.3 Add a seed section explaining `bun run db:seed`, what `DEV_CLIENT_SECRET` controls, and confirming the `dev-client` row is inserted
- [x] 2.4 Add a Bruno section explaining how to open `bruno/sso-api/`, select the `local` environment, and run the four requests in order
