## Context

The project currently has two separate token blocks in `app/globals.css`: a light `:root` block (the active default) and a `.dark {}` block that's never applied — no `class="dark"` is added to `<html>` anywhere. As a result the app renders in the light theme despite having dark tokens sitting unused. The font situation is similar: `next/font/google` loads Geist Sans and exposes it as `--font-geist-sans`, but the `@theme inline` block maps `--font-sans` to `var(--font-sans)` — a circular self-reference that resolves to nothing useful.

## Goals / Non-Goals

**Goals:**
- Single dark palette, always on — no class toggling, no media query, no `next-themes`
- Fix font wiring so Geist Sans is actually used globally
- Submit buttons show a loading state while mutations are in flight
- All changes are purely visual; no auth logic, API, or DB changes

**Non-Goals:**
- Light mode, `prefers-color-scheme`, system-preference detection, or a theme toggle
- Any new shadcn or Radix primitives — use what's already installed
- Magic link, Google OAuth, or password reset form polish (out of scope for this change)

## Decisions

### Decision 1: Dark values go directly on `:root` — no `.dark` class

**Choice**: Replace the light-mode `:root` block with the existing `.dark {}` values, then delete the `.dark {}` block entirely. Remove the `@custom-variant dark (&:is(.dark *))` directive.

**Why**: The intent is dark-only. Keeping a two-block structure with a class toggle would leave infrastructure for a light mode that will never be added (per the proposal). Collapsing everything into `:root` is the simplest expression of "this is the only theme." It also means no JavaScript is needed to apply a class on `<html>`, eliminating a flash-of-wrong-theme risk entirely.

**`color-scheme: dark`** is added to `:root` so browser-native UI (scrollbars, `<select>`, autofill background) matches.

**Alternative considered**: Keep `.dark {}` and add `class="dark"` to `<html>` in the layout. Rejected — it leaves the light-mode infrastructure in the codebase and introduces a hydration edge-case where SSR renders without the class until JS runs.

### Decision 2: Fix `--font-sans` by pointing it at `--font-geist-sans`

**Current state** in `@theme inline`:
```css
--font-sans: var(--font-sans);  /* circular — resolves to nothing */
```

**Fix**: Change to:
```css
--font-sans: var(--font-geist-sans);
```

`--font-geist-sans` is already set by `next/font/google` via the `variable: "--font-geist-sans"` option in `app/layout.tsx`. No new imports or font loads are needed — just correct the pointer.

**Why**: The layout already loads Geist Sans. The only missing piece is the CSS variable indirection being wired correctly.

### Decision 3: Form loading state — swap button label, keep disabled

**Choice**: In `SignInPage` and `SignUpPage`, the submit `<Button>` already receives `disabled={signIn.isPending}`. Add a conditional label that shows a different string from `locales/en.json` while `isPending` is true.

```tsx
<Button disabled={signIn.isPending}>
  {signIn.isPending ? t("auth.sign_in.submitting") : t("auth.sign_in.submit")}
</Button>
```

**Why**: The disabled state prevents double-submit, but gives no visual feedback that work is happening. A label swap is the lightest-weight loading indicator that works with the existing shadcn Button and doesn't require adding a spinner component.

**Alternative considered**: Lucide `Loader2` spinning icon inside the button. Not chosen — adds component complexity for marginal gain on a form that's typically in-flight for <500ms.

### Decision 4: Focus rings — no component changes needed

shadcn's default Input component already applies `focus-visible:ring-ring` with `outline-ring/50` in `globals.css`. The light theme's `--ring` value (`oklch(0.708 0 0)`) is low-contrast on white; the dark theme's `--ring` (`oklch(0.556 0 0)`) is slightly better but still subtle.

**Choice**: Accept the shadcn default ring once the dark palette is active. The `oklch(0.556 0 0)` ring on a dark background (`oklch(0.145 0 0)`) is visible. No custom ring override is needed for this change.

## Risks / Trade-offs

- **Sidebar tokens become irrelevant** → The `.dark {}` block contains sidebar-specific tokens (`--sidebar-*`). These are moved to `:root` as-is. They're wired to sidebar components that don't exist yet; keeping them doesn't hurt anything.
- **Autofill background on Chrome** → `color-scheme: dark` tells Chrome to use a dark autofill background, which matches. Without it, autofill would flash white.
- **SSR flash** → Eliminated entirely by the dark-on-`:root` approach. No `suppressHydrationWarning` needed.

## Migration Plan

1. Edit `app/globals.css`: move `.dark {}` values to `:root`, delete the old light `:root` block and `.dark {}` block, remove `@custom-variant dark` directive, add `color-scheme: dark` to `:root`, fix `--font-sans` pointer
2. No layout changes needed (Geist is already loaded; `<html>` no longer needs a `class`)
3. Edit `app/layout.tsx`: remove the now-unnecessary `geistMono` font variable from `className` if desired (keep for mono font token)
4. Add `auth.sign_in.submitting` and `auth.sign_up.submitting` keys to `locales/en.json`
5. Update `SignInPage.tsx` and `SignUpPage.tsx` button labels

Rollback: revert `globals.css` to the two-block structure. No DB or API changes to undo.

## Open Questions

- Should the sidebar tokens be cleaned up (they're wired to nothing)? Deferred — out of scope for this change.
