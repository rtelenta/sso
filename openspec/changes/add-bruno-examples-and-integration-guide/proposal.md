## Why

Downstream app teams have no runnable examples of the SSO OAuth2 flow and no written guide explaining how to integrate. Without this, every new app has to reverse-engineer the flow from the source code, slowing adoption and introducing integration bugs.

## What Changes

- New `bruno/` folder at the repo root containing a Bruno collection with ready-to-run API requests covering the full OAuth2 Authorization Code flow, token refresh, and logout
- New `docs/integration-guide.md` markdown file with a step-by-step guide for app developers: environment setup, the full OAuth2 flow, token lifecycle, logout, and troubleshooting tips

## Capabilities

### New Capabilities

- `bruno-collection`: A Bruno API collection covering all SSO endpoints — OAuth start, token exchange, token refresh, and logout — with environment variables and example request bodies
- `integration-guide`: A developer-facing markdown guide explaining how a downstream app integrates with this SSO — prerequisites, the auth code flow, JWT validation, refresh strategy, and logout

### Modified Capabilities

*(none — no existing spec requirements change)*

## Impact

- New files only: `bruno/` directory and `docs/integration-guide.md`
- No changes to application code, DB schema, or API surface
- No new dependencies or environment variables
