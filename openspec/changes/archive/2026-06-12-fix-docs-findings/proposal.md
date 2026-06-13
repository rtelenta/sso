## Why

Verification of the `update-readme` change surfaced two fixable findings: a minor inconsistency in `.env.example` (missing `run` in a comment) and Spanish-language section headers in `README.md` that conflict with a strict English-only documentation standard.

## What Changes

- **`README.md`**: Replace all Spanish section headers and italic callouts with English equivalents (`Comenzando 🚀` → `Getting Started 🚀`, `Pre-requisitos 📋` → `Prerequisites 📋`, `Instalación 🔧` → `Installation 🔧`, `Documentación 📖` → `Documentation 📖`, `Construido con 🛠️` → `Built with 🛠️`; remove Spanish italic instruction lines)
- **`.env.example`**: Fix comment on `DEV_CLIENT_SECRET` line from `run: bun db:seed` → `run: bun run db:seed`

## Non-goals

- Changing the content or structure of the README or local-setup guide
- Translating `docs/local-setup.md` (already fully English)
- Any runtime or API changes

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `readme`: Section headers and italic callouts must be English-only
- `local-setup-guide`: No changes to requirements; existing spec remains valid

## Impact

- Docs only: `README.md`, `.env.example`
- No code, DB schema, or API changes
- No environment variable additions or removals
