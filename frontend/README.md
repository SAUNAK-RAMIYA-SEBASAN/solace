# Solace — Frontend

React frontend for the Solace mental health assessment system.

## Stack

- **React 18** with hooks
- **Vite** for dev server and bundling
- **Vanilla CSS** design system (no Tailwind or UI library dependency)
- **Lora** (serif display) + **DM Sans** (body) from Google Fonts

## Project structure

```
src/
  context/
    ThemeContext.jsx   — Light / Dark / System theme with localStorage persistence
    AuthContext.jsx    — JWT auth state, /me verification on load
  components/
    Nav.jsx            — Sticky top nav with logo + theme toggle + auth button
    ThemeToggle.jsx    — Three-way pill: Light / System / Dark
  lib/
    api.js             — Typed wrappers for all backend API calls
  pages/
    Landing.jsx        — Hero page with animated background orbs
    Auth.jsx           — Login + signup with shared tab switcher
    Home.jsx           — PHQ-9 and GAD-7 test selection cards
    Assessment.jsx     — One question at a time, progress tracking, difficulty final step
    Result.jsx         — Score reveal, severity badge, response breakdown, crisis banner
  App.jsx              — State-machine router (no react-router needed)
  index.css            — Full design system: theme tokens, components, animations
  main.jsx             — Entry point
```

## Getting started

```bash
# Install
bun install

# Dev server (proxies /api → localhost:8000)
bun run dev

# Production build
bun run build

# Preview production build locally
bun run preview
```

## Theme system

Themes are driven by `data-theme` attribute on `<html>`:

- `light` — warm off-whites, soft lavender accent
- `dark`  — deep indigo background, brighter lavender accent
- `system` — follows OS preference, re-syncs on change

User choice is saved to `localStorage` under key `solace-theme`.

## API integration

All calls are in `src/lib/api.js`. In dev mode Vite proxies:

```
/auth/signup    → POST http://localhost:8000/auth/signup
/auth/login     → POST http://localhost:8000/auth/login
/assessment/... → http://localhost:8000/assessment/...
/me             → GET  http://localhost:8000/me
```

In production, Nginx routes `/api/` to the backend container (see root `nginx/nginx.conf`).

## Docker

```bash
# Build image
docker build -t solace-frontend .

# Run standalone (for testing)
docker run -p 3000:80 solace-frontend
```

The Dockerfile uses a two-stage build: Node for `npm run build`, then Nginx alpine to serve the static output. The `nginx-spa.conf` ensures all routes fall back to `index.html` for client-side routing.

## Design tokens

All design values live in `index.css` as CSS custom properties on `[data-theme]`.
Key tokens:

| Token | Light | Dark |
|---|---|---|
| `--bg-base` | `#faf8f5` | `#16121e` |
| `--bg-card` | `#ffffff` | `#1f1a2e` |
| `--accent`  | `#7c5cbf` | `#9b7de0` |
| `--accent-soft` | `#ede6f8` | `#2d2445` |

## Crisis detection

The Result page automatically shows Indian helpline numbers when PHQ-9 score is 20 or above:

- **iCall** — 9152987821
- **Vandrevala Foundation** — 1860-2662-345 (24/7)

## Notes

- No router library — navigation is a simple state machine in `App.jsx`, which is sufficient for this linear flow and avoids bundle weight.
- The assessment question API response is normalised in `Assessment.jsx` to handle `string[]`, `{text}[]`, and `{question}[]` shapes. Fallback questions are hardcoded for offline use.
- Severity scoring follows validated PHQ-9 and GAD-7 cutoffs (0–4 minimal, 5–9 mild, 10–14 moderate, 15+ severe for GAD-7; same bands with 15–19 moderately severe and 20–27 severe for PHQ-9).
