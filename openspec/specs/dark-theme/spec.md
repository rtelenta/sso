# Spec: Dark Theme

## Purpose

Defines the global visual identity of the SSO: a single, permanent dark color palette applied to all pages, dark-native browser rendering, and Geist Sans as the global typeface. There is no light mode and no theme toggle.

## Requirements

### Requirement: The application renders in a dark palette at all times
All color design tokens SHALL be defined with dark values directly on the CSS `:root` selector in `app/globals.css`. There SHALL be no `.dark` CSS class block and no `@custom-variant dark` directive. The dark palette SHALL be active unconditionally — no JavaScript class toggle, no `prefers-color-scheme` media query, and no theme-switching infrastructure.

#### Scenario: Page renders dark on first load without JavaScript
- **WHEN** a browser loads any page with JavaScript disabled
- **THEN** the page background, text, cards, and borders all use the dark palette

#### Scenario: No .dark class is required on html element
- **WHEN** the root `<html>` element is inspected in the browser
- **THEN** it does not have a `dark` CSS class and the dark palette is still active

#### Scenario: Light palette tokens are absent
- **WHEN** `app/globals.css` is read
- **THEN** there is no `:root` block containing light (`oklch(1 0 0)` background) values and no `.dark {}` class block

### Requirement: color-scheme is set to dark
The `:root` selector in `app/globals.css` SHALL include `color-scheme: dark`. This ensures that browser-native UI elements (scrollbars, form controls, autofill overlays) render in their dark variants.

#### Scenario: Autofill background is dark
- **WHEN** a user focuses an email or password input and the browser offers autofill
- **THEN** the autofill overlay background is dark, not white

#### Scenario: Scrollbar is dark
- **WHEN** a page has scrollable content
- **THEN** the native scrollbar renders in a dark style consistent with the page background

### Requirement: Geist Sans is the global sans-serif font
The `--font-sans` CSS custom property in the `@theme inline` block SHALL resolve to `var(--font-geist-sans)`. `var(--font-geist-sans)` SHALL be provided by the `next/font/google` Geist font loaded in `app/layout.tsx`. The `html` element SHALL apply `font-sans` as its default font family via Tailwind.

#### Scenario: Body text uses Geist Sans
- **WHEN** any page is rendered
- **THEN** the computed font family for body text is Geist Sans (not the system default sans-serif)

#### Scenario: Font token is not circular
- **WHEN** the `@theme inline` block in `app/globals.css` is read
- **THEN** `--font-sans` resolves to `var(--font-geist-sans)`, not to `var(--font-sans)`
