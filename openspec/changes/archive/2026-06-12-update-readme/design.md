## Context

The repository currently has a default `create-next-app` README with no project-specific content. There is already a detailed `docs/integration-guide.md` for downstream apps and a Bruno collection at `bruno/sso-api/` for API exploration. The setup steps (env vars, DB migrations, seed) are not documented anywhere. The goal is to surface this information without duplicating it.

## Goals / Non-Goals

**Goals:**
- Rewrite `README.md` to describe the project, prerequisites, local setup, available scripts, and links to further docs
- Add `docs/local-setup.md` as a dedicated, step-by-step local environment guide (DB, `.env`, migrations, seed)
- Reference the Bruno collection and `docs/integration-guide.md` from the README

**Non-Goals:**
- Documenting deployment to production (no Vercel/hosting details yet)
- Adding a CONTRIBUTING.md or code style guide
- Adding API reference docs (Bruno collection + integration guide already cover this)

## Decisions

**Two-file split (README + docs/local-setup.md) over a single long README**
README stays short and scannable (what it is, quick start, links). Local setup detail lives in `docs/local-setup.md` so it can grow independently without bloating the root file. Anyone who just wants to understand the project reads README; anyone setting up locally follows the guide.

**Keep all new docs files under `docs/`**
Consistent with the existing `docs/integration-guide.md`. Avoids root-level clutter.

**Reference Bruno collection, not reproduce it**
The `.bru` files are already self-documented inline. README just needs to tell readers where to find the collection (`bruno/sso-api/`) and what tool to open it with.

## Risks / Trade-offs

- `docs/local-setup.md` will need to be kept in sync with `.env.example` and any future env var additions → Mitigation: the setup guide references `.env.example` directly so the source of truth stays in one place
- README template style (with emojis) may feel informal → acceptable for an internal tool
