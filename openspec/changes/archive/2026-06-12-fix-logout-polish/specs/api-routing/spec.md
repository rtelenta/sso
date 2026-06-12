## ADDED Requirements

### Requirement: Wrong-method requests to API endpoints return 405
Hono route handlers SHALL include a catch-all fallback using `router.all(path, ...)` registered after the specific method handler, returning HTTP 405 Method Not Allowed for any request that does not match the intended method. This prevents Hono's default 404 fallthrough from misrepresenting a method mismatch as a missing resource.

#### Scenario: Wrong method on POST-only endpoint returns 405
- **WHEN** a client sends a GET request to `POST /api/token` or `POST /api/logout`
- **THEN** the response is HTTP 405, not HTTP 404

#### Scenario: Wrong method on GET-only endpoint returns 405
- **WHEN** a client sends a POST request to `GET /api/oauth/start`
- **THEN** the response is HTTP 405, not HTTP 404
