## 1. Fix `useContinueAs` — POST to `/api/auth/oauth2/continue`

- [x] 1.1 Replace the browser GET navigation in `useContinueAs` with a `fetch` POST to `/api/auth/oauth2/continue` with body `{ selected: true }` (include `credentials: "include"`). Read `{ redirect, url }` from the JSON response and navigate to `url` via `window.location.href`.
- [x] 1.2 Remove the `PLUGIN_PARAMS` filtering logic (no longer needed — the plugin attaches `oauth_query` from the full search string automatically). Keep the `client_id` check and the `window.location.href = "/"` fallback for non-OAuth flows.
- [x] 1.3 Add `isRedirecting` state management to `useContinueAs`: accept an `onRedirecting` callback and call it before the POST so `SignInPage` can hide the UI while the request is in flight.

## 2. Fix `useSignIn` — navigate to server-returned URL after OAuth2 sign-in

- [x] 2.1 In `useSignIn`'s `mutationFn`, after `authClient.signIn.email(data)` resolves, check if `res.data` has `redirect === true`. If so, set `window.location.href = res.data.url` and return without calling `onSuccess`.
- [x] 2.2 Remove the `onSuccess` parameter from `useSignIn` — it is no longer needed for the OAuth2 case. The hook handles the redirect internally. Non-OAuth sign-in still calls `router.push("/")`.

## 3. Update `SignInPage` — remove `onSuccess` coupling and add redirect guard

- [x] 3.1 Add `isRedirecting` state to `SignInPage` (alongside `forceForm`). Render `null` when `isRedirecting` is `true`.
- [x] 3.2 Remove the `isOAuthFlow` check and the `onSuccess: isOAuthFlow ? continueAs : undefined` prop from `useSignIn`. The hook no longer accepts `onSuccess`.
- [x] 3.3 Pass an `onRedirecting` callback to `useContinueAs` that sets `isRedirecting = true` so the account picker is hidden while "Continue as" is in-flight.
- [x] 3.4 Set `isRedirecting = true` in `useSignIn`'s `mutationFn` (or via `onMutate`) before `authClient.signIn.email` resolves, so the account picker cannot flash during the OAuth2 sign-in path. (Since `useSignIn` no longer accepts `onSuccess`, trigger this via a local `onMutate` callback or by passing a setter into the hook.)
