## ADDED Requirements

### Requirement: Environment variables are centralized
All `process.env` access SHALL be confined to `lib/constants.ts`. No other file in the project SHALL reference `process.env` directly. All constants SHALL be exported by name from `lib/constants.ts` and imported from there everywhere else.

#### Scenario: Constants file is the only env access point
- **WHEN** any file other than `lib/constants.ts` needs an environment variable
- **THEN** it imports the exported constant from `lib/constants.ts`, never from `process.env` directly

#### Scenario: Missing environment variable causes startup failure
- **WHEN** a required environment variable is absent at startup
- **THEN** the application fails fast with an explicit error rather than silently returning undefined

### Requirement: `.env.example` documents all required variables
The project SHALL include a `.env.example` file at the root that lists every required environment variable with a placeholder value and a brief description comment.

#### Scenario: Developer onboarding
- **WHEN** a developer clones the repository
- **THEN** they can copy `.env.example` to `.env.local` and fill in real values without guessing what vars are needed

### Requirement: TanStack Query provider wraps the application
The application SHALL wrap all page content in a `QueryClientProvider` so that TanStack Query hooks are available throughout the component tree.

#### Scenario: Query client is available app-wide
- **WHEN** any React component uses a TanStack Query hook (e.g., `useQuery`, `useMutation`)
- **THEN** it can access the shared `QueryClient` without additional setup

#### Scenario: Provider is a client component
- **WHEN** the provider is included in `app/layout.tsx` (a Server Component)
- **THEN** the provider component is marked `"use client"` and wraps the children

### Requirement: shadcn/ui is initialized
The project SHALL include a `components.json` configuration file produced by `shadcn init`, and the `components/ui/` directory SHALL be the install target for all shadcn component primitives.

#### Scenario: Adding a shadcn component
- **WHEN** a developer runs `bunx shadcn@latest add <component>`
- **THEN** the component file is created in `components/ui/` and can be imported by feature code

### Requirement: Folder structure conventions are established
The project SHALL establish the canonical directory layout: `lib/`, `db/`, `components/`, `hooks/`, `features/`, `types/`. These directories SHALL exist (even if initially empty) to signal the intended structure to contributors.

#### Scenario: Feature code placement
- **WHEN** a developer adds a new domain feature
- **THEN** they place all domain-specific code under `features/<domain>/` and all generic shared code in `components/`, `hooks/`, or `utils/`
