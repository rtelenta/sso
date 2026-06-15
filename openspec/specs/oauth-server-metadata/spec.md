## Purpose

Defines the OAuth 2.0 Authorization Server Metadata endpoint exposed by the SSO service, enabling clients to discover authorization server capabilities via RFC 8414.

## Requirements

### Requirement: OAuth Authorization Server Metadata endpoint
The SSO SHALL expose an RFC 8414-compliant Authorization Server Metadata document at `/.well-known/oauth-authorization-server/api/auth`. The endpoint MUST respond to GET requests and return the metadata JSON produced by the `oauthProvider` plugin.

#### Scenario: Discovery request succeeds
- **WHEN** an HTTP GET is made to `/.well-known/oauth-authorization-server/api/auth`
- **THEN** the server responds with HTTP 200 and a JSON body containing the OAuth 2.0 Authorization Server Metadata

#### Scenario: No warning at startup
- **WHEN** the application starts (dev or production)
- **THEN** the Better Auth `oauthAuthServerConfig` warning is NOT emitted in the logs
