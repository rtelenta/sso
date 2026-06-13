## Why

The current README is the default `create-next-app` template — it gives no information about what this project does, how to run it locally, or how downstream apps integrate with it. Any new developer or consumer of this SSO has no starting point.

## What Changes

- Replace `README.md` with a project-specific document covering what the SSO is, prerequisites, local setup (env, DB, seed), available scripts, and links to deeper resources
- Add a `docs/local-setup.md` with detailed step-by-step environment setup (DB provisioning, env vars, migrations, seed)
- Reference the Bruno API collection (`bruno/sso-api/`) as the interactive API explorer
- Link to `docs/integration-guide.md` for downstream app integration

## Capabilities

### New Capabilities

- `readme`: Project README — overview, getting started, scripts, links to docs
- `local-setup-guide`: Step-by-step guide for running the project locally (DB, env, migrations, seed)

### Modified Capabilities

_(none — no existing spec-level requirements change)_

## Impact

- `README.md` — full rewrite
- `docs/local-setup.md` — new file
- No code, API, DB schema, or dependency changes
