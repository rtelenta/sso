# Spec: Email & Password Authentication

## Purpose

Defines the requirements for email and password-based authentication using better-auth, including sign-up, sign-in, the supporting pages, database schema, and client/server integration points.

## Requirements

### Requirement: User can sign up with email and password
The system SHALL allow a new user to create an account by providing their name, email address, and a password. The password SHALL be hashed by better-auth before storage. Registration SHALL fail if the email is already in use.

#### Scenario: Successful sign-up
- **WHEN** a user submits the sign-up form with a valid name, email, and password (minimum 8 characters)
- **THEN** a new user record is created, a session is established, and the user is redirected

#### Scenario: Duplicate email rejected
- **WHEN** a user submits the sign-up form with an email that already exists in the system
- **THEN** the form displays an error message and no new account is created

#### Scenario: Invalid form data rejected
- **WHEN** a user submits the sign-up form with an invalid email or a password shorter than 8 characters
- **THEN** the form shows inline validation errors before the request is sent

### Requirement: User can sign in with email and password
The system SHALL allow an existing user to authenticate by providing their email and password. A session SHALL be created on successful authentication. Authentication SHALL fail for unrecognized email or incorrect password without revealing which field is wrong.

#### Scenario: Successful sign-in
- **WHEN** a user submits the sign-in form with a valid email and correct password
- **THEN** a session is created and the user is considered authenticated

#### Scenario: Invalid credentials rejected
- **WHEN** a user submits the sign-in form with an unrecognized email or wrong password
- **THEN** the form displays an error and no session is created

#### Scenario: Invalid form data rejected
- **WHEN** a user submits the sign-in form with a malformed email or empty password
- **THEN** the form shows inline validation errors before the request is sent

### Requirement: Sign-in and sign-up pages exist at canonical URLs
The system SHALL serve a sign-in page at `/sign-in` and a sign-up page at `/sign-up`. Both pages SHALL use the centered auth layout. All page copy SHALL be sourced from `locales/en.json`.

#### Scenario: Sign-in page is accessible
- **WHEN** a user navigates to `/sign-in`
- **THEN** a page with an email + password form is rendered

#### Scenario: Sign-up page is accessible
- **WHEN** a user navigates to `/sign-up`
- **THEN** a page with a name, email, and password form is rendered

### Requirement: Auth DB tables exist for user, session, account, and verification
The database SHALL contain the four tables required by better-auth: `user`, `session`, `account`, and `verification`. These tables SHALL be defined in `db/schema/index.ts` and applied via a Drizzle migration.

#### Scenario: Tables are present after migration
- **WHEN** the Drizzle migration has been applied to the database
- **THEN** the `user`, `session`, `account`, and `verification` tables exist with all required columns

### Requirement: Client-side auth client is exported from `lib/auth-client.ts`
The system SHALL provide a client-side better-auth instance exported as `authClient` from `lib/auth-client.ts`. This file SHALL be the only place `createAuthClient` is called. Server-side code SHALL NOT import from `lib/auth-client.ts`.

#### Scenario: Auth client is importable in React components
- **WHEN** a `"use client"` component needs to call a better-auth client method (e.g., sign in, sign up)
- **THEN** it imports `authClient` from `@/lib/auth-client`

### Requirement: Sign-in and sign-up are exposed as TanStack Query mutation hooks
The system SHALL provide `useSignIn` and `useSignUp` hooks under `features/auth/hooks/`. Each hook SHALL wrap the corresponding `authClient` call in `useMutation`. Error responses from better-auth SHALL be surfaced as thrown errors so TanStack Query captures them as mutation errors.

#### Scenario: Sign-in hook surfaces errors
- **WHEN** `useSignIn` mutates with invalid credentials
- **THEN** `mutation.error` is set with a descriptive message and `mutation.isError` is `true`

#### Scenario: Sign-up hook surfaces errors
- **WHEN** `useSignUp` mutates with a duplicate email
- **THEN** `mutation.error` is set with a descriptive message and `mutation.isError` is `true`
