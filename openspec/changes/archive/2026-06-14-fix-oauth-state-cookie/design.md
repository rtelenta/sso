## Context

The `@better-auth/oauth-provider` exposes three "continue" endpoints for different scenarios:

| Endpoint | Body | Purpose |
|---|---|---|
| `POST /oauth2/continue` | `{ selected: true }` | User selected an account from `select_account` prompt — re-enters `authorize()` without consent bypass |
| `POST /oauth2/continue` | `{ created: true }` | New account was just created — re-enters `authorize()` |
| `POST /oauth2/continue` | `{ postLogin: true }` | Post-login step completed (requires `ba_pl` session ID in signed params) |
| `POST /oauth2/consent` | `{ accept: true }` | User granted consent — creates `oauthConsent` record, then calls `authorize()` |

The previous `useContinueAs` implementation used `{ selected: true }`. This re-enters `authorize()` which checks for an `oauthConsent` record. If none exists (first-time OAuth2 for that user+client pair), `authorize()` redirects back to the consent page (`/sign-in`), creating a loop.

The `oauthProviderClient` fetch plugin adds `oauth_query: buildSignedOAuthQuery(window.location.search)` to all non-GET requests when `?sig=...` is in the URL. This wires the signed OAuth2 params into any fetch made via `authClient.$fetch`.

## Goals / Non-Goals

**Goals:**
- "Continue as" completes the OAuth2 flow on first use (creates consent if needed) and on subsequent uses (re-uses existing consent)
- No server-side changes required
- The fix applies regardless of whether `client.skipConsent` is true or false

**Non-Goals:**
- UI for explicit scope-by-scope consent review
- Changes to how the `oauthConsent` record is stored or structured
- Addressing the `better-auth.state` cookie root cause (separate investigation)

## Decisions

**Use `/oauth2/consent` with `{ accept: true }` instead of `/oauth2/continue` with `{ selected: true }`**

`consentEndpoint` (at `POST /api/auth/oauth2/consent`):
1. Reads `oAuthState.get()?.query` — populated by `oauthProviderClient`'s `before` hook from `oauth_query` in the request body
2. If `accept !== true` → returns `{ redirect: true, url: "...?error=access_denied..." }`
3. If `accept === true` → upserts an `oauthConsent` row for (clientId, userId, scopes)
4. Calls `authorize(ctx, { postLogin: ... })` → finds the just-created consent → issues auth code → returns `{ redirect: true, url: "https://app/callback?code=...&state=..." }`

The `redirectPlugin` in `authClient.$fetch` intercepts the `{ redirect: true, url }` response and sets `window.location.href`, completing the flow.

This works for `skipConsent = true` clients too: `authorize()` short-circuits at the `client.skipConsent` check before reaching the consent lookup.

**`onRedirecting` still called before the fetch**

`useContinueAs` already calls `onRedirecting?.()` before `await authClient.$fetch(...)`. This sets `isRedirecting = true` in `SignInPage` immediately, which renders `null` before the response arrives. No change needed here.

## Risks / Trade-offs

- **Consent record created silently**: Clicking "Continue as" implicitly grants consent without a traditional "do you allow X to access Y?" dialog. This is intentional for an internal SSO (single tenant, all apps are trusted), but would need revisiting for a public OAuth2 server.
  → Mitigation: acceptable given the project's single-tenant design; noted in the `sign-in-account-picker` spec.

- **`oauthConsent` table required**: The `better-auth` schema must have an `oauthConsent` model. If missing, `consentEndpoint` would throw on `adapter.create()`.
  → Mitigation: the `@better-auth/oauth-provider` plugin adds this model automatically via `mergeSchema`.

- **Signed params must still be valid**: The `oauthProviderClient` `before` hook verifies the `sig` and `exp` in `oauth_query`. If the user sits on the page for longer than `codeExpiresIn` (default 600s) without clicking, the signature will be expired and the request will return 400.
  → Acceptable: matches the expected 10-minute authorization window.
