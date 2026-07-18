# Module Specification — frontend auth

## Files you implement (`src/components/auth/`)

| File | Exports |
|------|---------|
| `pkce.ts` | `generateCodeVerifier()`, `generateCodeChallenge(verifier)`, `generateState()` |
| `idToken.ts` | `IdTokenClaims`, `decodeIdToken(idToken)`, `initials(claims)` |
| `tokenStorage.ts` | `StoredTokens`, `PkceState`, `saveTokens`, `getTokens`, `clearTokens`, `savePkceState`, `getAndClearPkceState` |
| `auth.ts` | `REFRESH_BUFFER_MS`, `signInWithGoogle`, `handleAuthCallback`, `getCurrentUser`, `ensureValidTokens`, `signOut` |
| `me.ts` | `getMe(idToken)` |
| `pages/LoginPage.tsx` | default `LoginPage` |
| `pages/AuthCallbackPage.tsx` | default `AuthCallbackPage({ onSignedIn })` |

## Provided — do not modify

| File | Role |
|------|------|
| `src/components/auth/config.ts` | `authConfig { cognitoDomain, clientId }`, `redirectUri`, `logoutUri` |
| `src/components/auth/components/GoogleIcon.tsx` | the Google logo SVG |
| `src/base/config.ts` | `backendUrl` |
| `src/base/components/ui/button.tsx` | `Button` |
| `src/base/lib/utils.ts` | `cn` |
| `src/interfaces/auth.ts` | `AuthenticatedUser` |
| `src/App.tsx`, `src/main.tsx` | dev harness (wires the two pages) |

## Endpoints & shapes

| Call | Request | Response |
|------|---------|----------|
| Authorize | `GET https://<domain>/oauth2/authorize?client_id&response_type=code&scope=openid email profile&redirect_uri&identity_provider=Google&code_challenge_method=S256&code_challenge&state` | browser redirect |
| Token (code) | `POST https://<domain>/oauth2/token` form: `grant_type=authorization_code, client_id, code, redirect_uri, code_verifier` | `{ id_token, access_token, refresh_token?, expires_in }` |
| Token (refresh) | `POST …/oauth2/token` form: `grant_type=refresh_token, client_id, refresh_token` | `{ id_token, access_token, expires_in }` |
| Logout | `GET https://<domain>/logout?client_id&logout_uri` | browser redirect |
| Me | `GET ${backendUrl}/me` header `authorization: Bearer <idToken>` | `{ user }` or non-OK |

`StoredTokens = { idToken, accessToken, refreshToken?, expiresAt }` where
`expiresAt = Date.now() + expires_in * 1000`.

## Storage keys

| Key | Value |
|-----|-------|
| `app.auth.tokens` | `StoredTokens` (JSON) |
| `app.auth.pkce` | `PkceState { codeVerifier, state }` (JSON), single-use |

## Env (from `.env.test`)

`VITE_COGNITO_DOMAIN=test.auth.example.com`, `VITE_COGNITO_CLIENT_ID=test-client-id`,
`VITE_BACKEND_URL=http://backend.test`.

## Acceptance

The features in [features/](features/) run via jest-cucumber suites under
`tests/` (Vitest + jsdom, `globals: true`). They stub
`window.location.assign`, `fetch`, and use real `sessionStorage`/`crypto`. Your own unit
tests must bring total coverage of the files you write to 100%.
