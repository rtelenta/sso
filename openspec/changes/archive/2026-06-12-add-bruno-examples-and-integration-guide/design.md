## Context

Downstream app developers have no runnable reference for the SSO API. The OAuth2 Authorization Code flow involves multiple steps across browser redirects and back-channel requests — without a working example collection, teams wire it up incorrectly (wrong grant_type, missing Origin header, token not stored correctly). The integration guide fills the companion gap: a written, linkable document explaining the whole lifecycle.

Bruno was chosen over Postman/Insomnia because it stores collections as plain `.bru` text files in git, requires no account or cloud sync, and is free/open source.

## Goals / Non-Goals

**Goals:**
- Bruno collection at `bruno/sso-api/` covering all SSO API endpoints with correct request bodies and environment variables
- `docs/integration-guide.md` covering the full auth code flow, JWT validation, refresh, logout, and troubleshooting
- Both artifacts are self-contained and runnable against a local dev instance immediately after cloning

**Non-Goals:**
- Testing the Bruno requests in CI
- SDK or client library code generation
- Guides for specific frameworks (Next.js, Express, etc.) — language-agnostic only
- Coverage of better-auth internal endpoints (`/api/auth/*`)

## Decisions

### Bruno collection structure

```
bruno/
  sso-api/
    bruno.json              ← collection metadata
    environments/
      local.bru             ← local dev environment vars
    01_oauth-start.bru
    02_token-exchange.bru
    03_token-refresh.bru
    04_logout.bru
```

Each `.bru` file follows Bruno's native format (not Postman JSON). Requests are numbered to communicate the intended execution order. Environment variables (`{{sso_base_url}}`, `{{client_id}}`, `{{client_secret}}`, `{{code}}`, `{{refresh_token}}`) are declared in `local.bru` with local dev defaults so the collection works immediately after git clone.

**Alternative considered:** Postman collection JSON — rejected because it's a single large file with binary-unfriendly diffs and requires Postman account for team features.

### Integration guide structure

Single markdown file at `docs/integration-guide.md`. Sections:
1. Overview (what SSO does, what the app gets)
2. Prerequisites (getting `client_id`/`client_secret`, configuring `redirect_uri`)
3. Step-by-step auth code flow (with URLs, query params, exact request/response shapes)
4. JWT validation (algorithm, claims, expiry)
5. Token refresh strategy (when and how to refresh)
6. Logout (revocation call + clearing local tokens)
7. Error reference
8. Troubleshooting FAQ

**Alternative considered:** Splitting into multiple files per section — rejected because a single file is easier to share as a link and simpler to maintain.

## Risks / Trade-offs

- [Risk] Bruno `.bru` format may change between versions → Mitigation: pin Bruno version in the collection's `bruno.json` meta block; format is stable for v1 collections
- [Risk] Hardcoded `client_id`/`client_secret` examples in the guide could be mistaken for real credentials → Mitigation: use obvious placeholder values (`app1` / `secret1`) and add a callout box warning
- [Risk] Integration guide goes stale as the API evolves → Mitigation: the guide references the Bruno collection for exact request shapes; only high-level prose needs updating

## Open Questions

*(none)*
