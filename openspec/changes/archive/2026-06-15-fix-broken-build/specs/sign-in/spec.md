## ADDED Requirements

### Requirement: Sign-in page builds successfully
The `/sign-in` route SHALL be statically prerenderable by Next.js. Any component that reads `useSearchParams()` MUST be wrapped in a `<Suspense>` boundary so the build can generate a static shell.

#### Scenario: Production build succeeds
- **WHEN** `npm run build` is executed
- **THEN** the `/sign-in` route prerendering completes without error

#### Scenario: Search params forwarded to sign-up link
- **WHEN** the sign-in page is visited with query parameters (e.g. `?redirect_uri=...&state=...`)
- **THEN** the "Sign up" link includes those same query parameters in its `href`
