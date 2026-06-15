## 1. Fix useContinueAs hook

- [x] 1.1 Change `useContinueAs` to POST to `/oauth2/consent` with `{ accept: true }` instead of `/oauth2/continue` with `{ selected: true }`

## 2. Update spec

- [x] 2.1 Update `openspec/specs/sign-in-account-picker/spec.md` to reflect the new endpoint and body in the "Continue as" requirement (sync delta spec)
