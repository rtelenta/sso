## Why

The SSO currently renders in a light shadcn default theme with the system font — a generic look that doesn't convey a deliberate visual identity. Since auth forms are the only thing users interact with on an SSO, getting the visual baseline right now prevents rework as more auth methods are added.

## What Changes

- Remove all light-theme tokens from `app/globals.css`; redefine the shadcn/Tailwind v4 CSS custom properties directly on `:root` with dark values. Set `color-scheme: dark`. No `.dark` class, no `next-themes`, no toggle.
- Add `next/font` (Geist) to the root layout; wire it to the Tailwind `--font-sans` token.
- Polish the sign-in and sign-up form components: consistent centered Card layout, visible focus rings, inline validation errors already wired (zod via react-hook-form), explicit loading state on submit buttons.
- Add any new UI copy (e.g. button loading labels) to `locales/en.json` and access via `t()`.

## Capabilities

### New Capabilities
- `dark-theme`: Global dark visual identity — dark palette on `:root`, `color-scheme: dark`, Geist font wired to `--font-sans`. No light mode.

### Modified Capabilities
- `email-password-auth`: Add explicit requirements for form UX quality: visible focus rings on inputs, submit button disabled + shows loading label while request is in flight.

## Impact

- **UI**: `app/globals.css`, `app/layout.tsx`, `features/auth/pages/SignInPage.tsx`, `features/auth/pages/SignUpPage.tsx`
- **API**: none
- **DB schema**: none
- **better-auth plugins**: none
- **Env vars**: none
- **Dependencies**: `next/font` (already bundled with Next.js — no new package install needed)

## Non-goals

- No light theme, no `prefers-color-scheme` media query, no theme toggle — dark is the only mode
- No custom component primitives — shadcn Card, Input, Button, Label only
- No changes to auth logic, validation rules, or redirect behavior
- No changes to any API or database layer
