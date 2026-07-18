# Project Brief — Frontend Auth Module

This project is a self-contained slice of a production React SPA. The goal of this
engagement is to build its **authentication** module: PKCE sign-in, the OAuth callback,
session handling, sign-out, ID-token helpers, and `GET /me`.

## Scope of work

The skeleton files under `src/components/auth/` (currently throwing `NotImplemented`):
`pkce.ts`, `idToken.ts`, `tokenStorage.ts`, `auth.ts`, `me.ts`, `pages/LoginPage.tsx`,
`pages/AuthCallbackPage.tsx`. The contract is documented in:

- [docs/requirements.md](docs/requirements.md) — context + functional requirements
- [docs/specifications.md](docs/specifications.md) — file map, endpoints, storage keys
- [docs/swimlane-diagram.md](docs/swimlane-diagram.md) — PKCE / callback / session flows
- [docs/features/](docs/features/) — the executable acceptance scenarios (Gherkin)

`config.ts`, `GoogleIcon`, `Button`, `base/config.ts`, and the dev harness (`App.tsx`,
`main.tsx`) are **provided** — you import them but do not modify them.

## Getting started

```bash
npm install
npm test               # runs the acceptance suites (they fail until you implement)
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | Boots the SPA (Vite) with the login + callback routes |
| `npm test` | Runs all tests, including the jest-cucumber acceptance suites (Vitest + jsdom) |
| `npm run test:coverage` | Runs tests with coverage |
| `npm run lint` | oxlint — must pass |
| `npm run build` | `tsc -b && vite build` — must pass |

`.env.test` already provides safe Cognito/backend values for the test run.

## Definition of done

1. **All acceptance scenarios pass.** The suites under
   `tests/` execute the Gherkin features in `docs/features/`.
   Please leave the feature files and the step definitions alone.
2. **Ship the module with its own tests.** Add your unit tests (`*.test.ts[x]`) alongside
   the acceptance suite and aim for solid coverage of the code you write —
   `npm run test:coverage` reports where you stand.
3. **Keep the public surface and file paths exactly as given** — so the module plugs
   straight into the wider codebase.
4. **Please leave the provided files alone** — configs, docs, acceptance suites,
   `src/base/**`, `src/interfaces/**`, `config.ts`, `GoogleIcon.tsx`, and the dev harness.
5. **No new runtime dependencies** unless there's a clear reason (note it in your
   handover). Test dev-dependencies are fine.
6. `npm run lint` and `npm run build` should pass with zero errors.

## Delivery

Push to a repository and share access, or send the sandbox as a zip (without
`node_modules/`), including a short note on any decisions or trade-offs you made.
