## Context

Two findings from the `update-readme` verify pass need to be corrected:
1. `README.md` uses Spanish section headers and italic callouts inherited from the template reference. The project standard is English-only documentation.
2. `.env.example` has a typo in a comment (`bun db:seed` instead of `bun run db:seed`).

Both are textual edits with no code, schema, or API surface.

## Goals / Non-Goals

**Goals:**
- All section headers and body text in `README.md` are English
- The `DEV_CLIENT_SECRET` comment in `.env.example` references the correct command

**Non-Goals:**
- Restructuring `README.md` or changing its content
- Any changes to `docs/local-setup.md` (already English)
- Any runtime, API, or DB changes

## Decisions

**Replace Spanish text verbatim rather than rewrite surrounding prose.** The README structure and content were validated in the previous change. Only the language of headers and italic callouts changes — no restructuring.

Mapping:
| Spanish | English |
|---|---|
| `Comenzando 🚀` | `Getting Started 🚀` |
| `Pre-requisitos 📋` | `Prerequisites 📋` |
| `Instalación 🔧` | `Installation 🔧` |
| `Documentación 📖` | `Documentation 📖` |
| `Construido con 🛠️` | `Built with 🛠️` |

Spanish italic lines (e.g. `_Estas instrucciones te permitirán..._`, `_Dí cómo será ese paso_`) are removed or replaced with concise English equivalents where meaningful, dropped where they were template filler.

## Risks / Trade-offs

- **Risk:** Emoji in headers may render inconsistently across Markdown viewers → Acceptable; matches the template intent and is already present.
- **No migration plan needed** — docs-only change, no deploy step.
