## Quick orientation for AI assistants

This is a small React + Vite single-page app for restaurant reservations. The goal of this file is to give an AI coding agent the exact, actionable knowledge needed to be productive immediately.

### 1) Big picture (what matters)
- Frontend: React + Vite (see `vite.config.js`). No TypeScript. UI components live in `src/component/`.
- Auth & session: `src/context/AuthContext.jsx` is the single source of truth. Session is persisted to localStorage under the key `rtx_auth`.
- Networking: two fetch helpers exist and are intentionally different:
  - `src/lib/api.js` -> `apiFetch(path, options)` — reads `VITE_API_BASE_URL`, attaches `Authorization: Bearer <token>` from `rtx_auth` by default.
  - `src/services/apiClient.js` -> `api(path, {method, body, auth})` — similar wrapper but uses `credentials: "omit"` and different defaults.
  Important: `AuthContext.login` uses a direct `fetch(..., { credentials: 'include' })` for a cookie-based login flow. UI code (e.g. `src/component/LoginForm.jsx`) calls `useAuth().login()` — prefer this canonical flow for user login UX.

### 2) Critical developer workflows (commands)
- Install dependencies: `npm install`
- Dev server with HMR: `npm run dev` (Vite)
- Build: `npm run build`
- Preview a prod build: `npm run preview`
- Lint: `npm run lint` (ESLint configured via `eslint.config.js`)

There are no test scripts in package.json. If you add tests, update README and add scripts.

### 3) Environment variables and local dev aids
- Vite env vars (prefix `VITE_`):
  - `VITE_API_BASE_URL` — backend base (default fallbacks exist in code: e.g. `http://localhost:8080`).
  - `VITE_DEV_TOKEN` — optional JWT used for local development bootstrapping in `AuthContext` and helpers.

Example `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_DEV_TOKEN=<optional dev JWT>
```

### 4) Project-specific conventions and gotchas (do not skip these)
- Auth: Always prefer the `useAuth()` hook and `AuthContext.login()` from UI components — this preserves the cookie/token bootstrap behavior and local dev token logic.
- Two network wrappers: they are both used across the app. Do not swap them globally without asking maintainers. If you add a new API call, pick one wrapper and document why (headers, credentials, auth expectation).
- Local storage key: `rtx_auth` — tools or tests that read/write sessions should use this key.
- Redirect patterns: `LoginForm.jsx` redirects by `user.role` (example: `ROLE_ADMIN` -> `/cadastro-juridico`, otherwise `/mapa-restaurantes`). Follow that routing convention for new auth flows.

### 5) Key files to inspect (quick checklist)
- `src/context/AuthContext.jsx` — login/logout, dev token bootstrap, localStorage handling.
- `src/component/LoginForm.jsx` — canonical login flow and redirect example.
- `src/lib/api.js` — `apiFetch` wrapper (token attachment behavior).
- `src/services/apiClient.js` — alternative `api` wrapper (credentials/headers differ).
- `src/services/authService.js` — programmatic wrappers for login/me/logout.
- `src/controllers/mapController.js` — example of controller wiring to services and geolocation logic.

### 6) Concrete examples to copy/adapt
- When adding a UI login flow: copy `src/component/LoginForm.jsx` and call `useAuth().login(credentials)`.
- When adding a background API job that requires a token: prefer `apiFetch()` (from `src/lib/api.js`) and document the reason for choosing it.

### 7) Debugging tips (fast wins)
- If login fails locally: verify `VITE_API_BASE_URL` and whether the backend expects cookies (`credentials: include`) vs Bearer tokens. Check network tab for missing Authorization header or missing cookies.
- If requests return shaped errors: wrappers attach `.status` and `.data` to thrown Errors — inspect those in UI error handlers (`err.status`, `err.data`).

### 8) When to ask the maintainers
- Before consolidating or refactoring the two API wrappers.
- If you plan to switch from cookie-based login to token-only flows — this affects `AuthContext` and backend expectations.

### 9) What this file is for (short)
Keep edits here targeted: document only discoverable, repo-specific patterns that an AI or new contributor absolutely needs to avoid time-wasting mistakes.

---
If you'd like, I can also produce a short `AGENT.md` variant (1-page checklist), or add small code snippets showing the exact shape of `rtx_auth` in localStorage. Tell me which you'd prefer and I'll iterate.
## Quick orientation for AI assistants

This repo is a React + Vite single-page app for restaurant reservations. Use this file to get productive fast: it documents the project's structure, key conventions, examples, and exact commands.

### Big picture
- Frontend: React + Vite (see `vite.config.js`). No TypeScript used. UI components live under `src/component/`.
- State & auth: `src/context/AuthContext.jsx` provides the global auth flow used by UI components. The app stores session data in localStorage under the key `rtx_auth` and expects a backend API to provide `/auth/login` and `/users/me` endpoints.
- API wrappers: there are two fetch helpers:
  - `src/lib/api.js` exports `apiFetch(path, options)` — used by many components; it reads `VITE_API_BASE_URL` and attaches a Bearer token from `rtx_auth` when available.
  - `src/services/apiClient.js` exports `api(path, {method, body, auth})` — similar but with different defaults (note `credentials: "omit"` here).
  Be careful: `AuthContext.login` issues a direct `fetch` to `${API_BASE}/auth/login` with `credentials: "include"` (cookie flow). Prefer calling `AuthContext.login` from UI code (LoginForm does this) so the single canonical login flow is used.

### Environment variables & dev aids
- Vite env variables used (prefix `VITE_`):
  - `VITE_API_BASE_URL` — base URL for backend API (default fallbacks exist in code: e.g. `http://localhost:8080`).
  - `VITE_DEV_TOKEN` — optional development JWT used by `AuthContext` and API helpers to populate a user session during local development.

Example .env.local (create in project root):
```
VITE_API_BASE_URL=http://localhost:8080
VITE_DEV_TOKEN=eyJ... (only for dev)
```

### How to run / build / lint
- Install & run dev server:
  - npm install
  - npm run dev   # starts Vite with HMR
- Build for production: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint` (ESLint configured; see `eslint.config.js`)

Scripts are defined in `package.json` (`dev`, `build`, `preview`, `lint`). There are no test scripts currently.

### Auth & session patterns (important)
- Single source of truth: `AuthContext` stores { token, user } in localStorage under `rtx_auth`. UI components should prefer `useAuth()` and call `login(...)` and `logout()` from that context.
- `LoginForm.jsx` intentionally uses `login()` from `AuthContext` (preferred) and then redirects based on `user.role` (e.g. `ROLE_ADMIN` -> `/cadastro-juridico`, otherwise `/mapa-restaurantes`). Use that pattern when adding new auth-aware components.
- Back-end expectations: `/auth/login` returns an object with `{ token, user }` or similar fields. `authService.me()` calls `/users/me` to get the current user.

### Networking conventions & gotchas
- Use the wrappers (`apiFetch` in `src/lib/api.js` or `api` in `src/services/apiClient.js`) for most requests to get consistent token attachment and error shaping. Note the slight differences (headers/credentials) and pick one wrapper consistently for new code.
- Error handling: wrappers throw an Error with a message and attach `status`/`data` on the error (inspect `.status` and `.data`). UI code frequently surfaces `err.message`.

### Key files to reference (quick examples)
- `src/context/AuthContext.jsx` — canonical login flow and dev token bootstrap.
- `src/component/LoginForm.jsx` — example of form, using `useAuth()` and redirect by role.
- `src/lib/api.js` and `src/services/apiClient.js` — two fetch wrappers; compare headers/credentials before using.
- `src/services/authService.js` — programmatic helper for login/me/logout and localStorage normalization.
- `src/controllers/mapController.js` — shows how geolocation and restaurant listing is wired via `services/restaurantsService` and `geocodeService`.

### Conventions to follow when editing
- Keep UI components as functional components in `src/component/` with plain JSX (no TS).
- Prefer `AuthContext.login` for UI login flows. When adding background tasks that need tokens, use `apiFetch` or `api` wrappers and document which you used.
- Use localStorage key `rtx_auth` when mocking or reading sessions in tests or tools.

### Debugging tips
- If the app fails to authenticate locally, check `VITE_API_BASE_URL` and `VITE_DEV_TOKEN`.
- Watch for two different fetch behaviors: cookie-based login (`credentials: 'include'`) vs token-based APIs (`Authorization: Bearer ...`). Backend must match the chosen approach.

### When to ask the maintainers / missing info
- There are two network wrappers — prefer to ask which one should be canonical before large refactors.
- If you plan to add tests or CI, ask whether to standardize on `apiFetch` vs `api` and whether cookie auth or pure Bearer tokens are the expected production flow.

---
If anything above is unclear or you want a different format (short checklist, onboarding doc, or conversion to AGENT.md), tell me which sections to expand and I'll iterate.
