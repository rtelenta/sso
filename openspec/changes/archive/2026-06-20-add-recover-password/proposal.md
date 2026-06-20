## Why

Users who forget their password currently have no self-service recovery path — they are locked out permanently. Adding password recovery reduces support burden and improves user retention across all downstream apps.

## What Changes

- New "Forgot password?" link on the sign-in page
- Password recovery request page (user enters email, receives a reset link)
- Password reset page (user clicks link from email, sets new password)
- API endpoint to request a password reset token
- API endpoint to consume the token and update the password
- Integration with the external email service (POST `/api/v1/send`) using a "Password Reset" template
- better-auth `emailVerification` or custom token flow for secure, expiring reset tokens

## Capabilities

### New Capabilities
- `password-recovery`: End-to-end flow for requesting and completing a password reset via email link

### Modified Capabilities
- `sign-in`: Add "Forgot password?" link pointing to the recovery request page

## Impact

- **UI**: Two new pages (`/recover-password`, `/reset-password`); minor change to sign-in page
- **API**: Two new Hono endpoints (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`)
- **DB schema**: Reset token storage (likely handled by better-auth plugin or a custom `password_reset_tokens` table)
- **Dependencies**: No new packages — uses existing better-auth, Hono, TanStack Query, react-hook-form, zod
- **Environment variables**: `EMAIL_API_URL`, `EMAIL_API_TOKEN` for the external email service

## Non-goals

- Changing the magic-link or Google OAuth flows
- Admin-initiated password resets
- Rate limiting on the recovery endpoint (can be addressed separately)
