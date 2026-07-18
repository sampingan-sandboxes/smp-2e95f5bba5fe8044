# Requirements — Frontend Auth Module

## Context

A React (Vite + React Router) single-page app. Users sign in with Google through Amazon
Cognito's Hosted UI using the **OAuth 2.0 Authorization Code flow with PKCE**. This module
owns the entire client-side auth experience:

- starting sign-in (PKCE challenge + redirect to Cognito),
- handling the `/auth/callback` redirect (state check + code→token exchange),
- persisting the session in `sessionStorage` and keeping it valid (silent refresh),
- signing out,
- reading the ID token's claims for display,
- calling the backend `GET /me`.

The backend, Cognito config reader (`src/components/auth/config.ts`), the design-system
`Button`, and `GoogleIcon` are **provided**. You implement everything else under
`src/components/auth/`.

## Functional requirements

### FR-1 — PKCE helpers (`pkce.ts`)
`generateCodeVerifier()` → base64url of 32 random bytes. `generateCodeChallenge(verifier)`
→ base64url of the SHA-256 digest of the verifier (S256). `generateState()` → base64url of
16 random bytes. base64url = base64 with `+`→`-`, `/`→`_`, no `=` padding.

### FR-2 — ID token helpers (`idToken.ts`)
`decodeIdToken(idToken)` decodes the JWT payload segment (base64url JSON) to
`{ name?, email?, picture? }` — no signature checking. `initials(claims)` returns up to two
uppercase initials from `name`, else `email`, else `?`.

### FR-3 — Token storage (`tokenStorage.ts`)
`sessionStorage`-backed. Keys `app.auth.tokens` and `app.auth.pkce`.
`getTokens`/`getAndClearPkceState` return `null` when absent; `getAndClearPkceState`
removes the value as it reads it.

### FR-4 — Auth flow (`auth.ts`)
- `signInWithGoogle()`: create verifier+challenge+state, `savePkceState`, then
  `window.location.assign` to `https://<domain>/oauth2/authorize?…` with params
  `client_id, response_type=code, scope=openid email profile, redirect_uri,
  identity_provider=Google, code_challenge_method=S256, code_challenge, state`.
- `handleAuthCallback(url)`:
  - `error` query param → throw `Cognito returned an error: <error>`.
  - missing `code` or missing stored PKCE → throw.
  - `state` mismatch → throw (CSRF).
  - POST the `authorization_code` grant to `/oauth2/token`
    (`application/x-www-form-urlencoded`, params `grant_type, client_id, code,
    redirect_uri, code_verifier`); non-OK → throw `Token exchange failed: <status> <text>`.
  - save + return `StoredTokens` with `expiresAt = Date.now() + expires_in*1000`.
- `getCurrentUser()`: stored tokens, or `null` if absent/expired.
- `REFRESH_BUFFER_MS = 60_000`.
- `ensureValidTokens()`: comfortably-valid → as-is; expiring-soon with refresh token →
  refresh via `refresh_token` grant (reuse the same refresh token — Cognito doesn't
  reissue it), and on failure keep a still-valid token else clear+null; expiring-soon with
  no refresh token → keep if still valid else clear+null; nothing stored → null.
- `signOut()`: clear the session, then `window.location.assign` to `https://<domain>/logout?
  client_id=…&logout_uri=…`.

### FR-5 — `getMe(idToken)` (`me.ts`)
`GET ${backendUrl}/me` with `authorization: Bearer <idToken>`; non-OK → throw
`Unauthorized: <status>`; success → the `user` from `{ user }`.

### FR-6 — Pages
- `LoginPage`: heading "Playbook" + a `type="button"` Button (GoogleIcon + "Continue with
  Google") that calls `signInWithGoogle()`.
- `AuthCallbackPage({ onSignedIn })`: run `handleAuthCallback(window.location.href)` once
  on mount (guard against StrictMode's double invoke — the PKCE state is single-use); on
  success call `onSignedIn(tokens)` then `<Navigate to="/" replace />`; on failure render
  `Sign-in failed: <message>`; otherwise render nothing.

## Non-functional requirements
- TypeScript strict; `npm run lint` (oxlint) + `npm run build` clean.
- Keep file paths and export signatures. Do not modify provided files.

See [specifications.md](specifications.md) and [features/](features/).
