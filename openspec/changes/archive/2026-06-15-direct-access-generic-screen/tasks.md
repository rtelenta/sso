## 1. Locale Strings

- [x] 1.1 Add direct-access screen copy keys to `locales/en.json` (title, description explaining this is an internal SSO)

## 2. DirectAccessPage Feature

- [x] 2.1 Create `features/direct-access/pages/DirectAccessPage.tsx` as a Server Component using shadcn/ui primitives and `t()` for all copy
- [x] 2.2 Replace `app/page.tsx` to render `<DirectAccessPage />` (remove existing session-aware logic)

## 3. OAuth Flow Guards

- [x] 3.1 Add server-side `searchParams` guard to `app/(auth)/sign-in/page.tsx` — redirect to `/` if `client_id` or `redirect_uri` is missing
- [x] 3.2 Add the same guard to `app/(auth)/sign-up/page.tsx`

## 4. Verification

- [x] 4.1 Verify navigating to `/` shows the generic screen (no sign-in form, no session state)
- [x] 4.2 Verify navigating to `/sign-in` without OAuth params redirects to `/`
- [x] 4.3 Verify navigating to `/sign-up` without OAuth params redirects to `/`
- [x] 4.4 Verify the full OAuth2 sign-in flow still works end-to-end (with `client_id` + `redirect_uri` present)
