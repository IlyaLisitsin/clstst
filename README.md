# FreshCells Trial — React + Apollo Auth Boilerplate

Small React + TypeScript SPA against the FreshCells trial GraphQL API. Implements login, an authenticated profile screen, en/de localization, and a shared layout. Doubles as a boilerplate: opinionated folder structure, Apollo client with auth/retry/error links, in-memory `AuthProvider`, and Tailwind theming.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```sh
npm install
cp .env.example .env.local   # already provided in this repo for convenience
npm run dev
```

App boots at http://localhost:5173.

### Smoke-test credentials

```
identifier: test@freshcells.de
password:   KTKwXm2grV4wHzW
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check + production build. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint over the project. |
| `npm run format` | Prettier write. |
| `npm run test` | Vitest in watch mode. |
| `npm run test:run` | Vitest one-shot run. |
| `npm run typecheck` | `tsc -b --noEmit`. |

## Environment

A single env var:

```
VITE_GRAPHQL_URL=https://cms.trial-task.k8s.ext.fcse.io/graphql
```

It is read **only** by `src/config/env.ts`; everything else imports `GRAPHQL_URL` from there.

## Folder layout

```
src/
├── apollo/                 # Apollo client + link chain + token store
│   ├── client.ts
│   ├── tokenStore.ts
│   ├── links/              # authLink, retryLink, errorLink
│   └── operations/         # gql documents (login, user)
├── auth/                   # AuthProvider, useAuth, ProtectedRoute
├── components/             # Shared UI: Header, Footer, LanguageSwitcher, Layout
├── pages/                  # Route-level screens, one folder per page
│   ├── LoginPage/
│   └── ProfilePage/
├── i18n/                   # i18next init + locales/{en,de}/{common,auth,profile}.json
├── config/env.ts           # Single source of truth for GRAPHQL_URL
├── test/setup.ts           # Vitest setup (jest-dom matchers)
├── App.tsx                 # Provider stack + router
└── main.tsx                # Entry point
```

### Conventions

- Pages live in `src/pages/<PageName>/`, colocating component, schema (if any), and tests.
- Shared components read cross-cutting hooks (`useAuth`, `useTranslation`) directly rather than via props.
- All visible strings flow through `useTranslation` with namespaces `common` / `auth` / `profile`.
- `import.meta.env` is read only by `src/config/env.ts`.

## Auth model — explicit trade-off

The JWT is held **only in memory** (React state + a small module-scoped holder consumed by Apollo middleware). It is **not** persisted to `localStorage`, `sessionStorage`, or cookies. Consequences:

- A page reload clears the session and returns the user to `/login`.
- XSS cannot read the token from local storage because nothing is stored there.

This is a deliberate choice favoring security over reload UX. The schema also has no `logout` mutation (verified via introspection) — logout is purely client-side state clearing.

## Apollo link chain

`errorLink → retryLink → authLink → httpLink`

- `authLink` adds `Authorization: Bearer <token>` only when a token is present (login is unauthenticated and works through the same chain).
- `retryLink` retries **only** on HTTP `502 / 503 / 429`, max 3 retries, with exponential backoff and jitter. Other failures (including GraphQL-level errors and 4xx) do not retry.
- `authLink` is *inside* `retryLink` so retried attempts re-read the current token.

## i18n

`i18next` + `react-i18next`, languages `en` / `de`, namespaces `common` / `auth` / `profile`. Language preference persists to `localStorage` via `i18next-browser-languagedetector` (preference is not a security secret).
