# Free Day Finder

> Find the days when **everyone** on a rota is off.

A small, fast, no-backend web app for households and teams that work
non-standard shift patterns. Add each person, configure their rota using a
preset or by hand, and the app calculates every date you all share off.

[![CI](https://github.com/REPLACE_WITH_YOUR_USERNAME/free-day-finder/actions/workflows/ci.yml/badge.svg)](https://github.com/REPLACE_WITH_YOUR_USERNAME/free-day-finder/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/REPLACE_WITH_YOUR_USERNAME/free-day-finder/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/REPLACE_WITH_YOUR_USERNAME/free-day-finder/actions/workflows/deploy-pages.yml)

## Demo

After enabling GitHub Pages (see below), the live app is served at:

```
https://REPLACE_WITH_YOUR_USERNAME.github.io/free-day-finder/
```

## Features

- **Three rota modes** — fixed weekly, rotating multi-week, and rolling
  N-on / M-off blocks.
- **12 presets** covering 9–5, 4-on/4-off, Panama 2-2-3, DuPont and more.
- **Calendar view** — see every "everyone free" day at a glance.
- **Date-range list** — pick a window and export shared free dates as CSV.
- **Light & dark themes** with system preference detection.
- **Zero dependencies at runtime** — pure vanilla JS, served as static files.

## Why I built it

I work shift patterns at JLR while the rest of my family work different rotas
of their own. Lining up days everyone is free required mental gymnastics every
month — this app does it once and for all.

The project also doubles as a portfolio piece showcasing modular vanilla
JavaScript, testable pure-function design, and a modern CI / GitHub Pages
deployment pipeline.

## Tech stack

| Concern      | Choice                                     |
| ------------ | ------------------------------------------ |
| Build tool   | [Vite](https://vitejs.dev/)                |
| Test runner  | [Vitest](https://vitest.dev/) + jsdom      |
| Linting      | ESLint 9 (flat config)                     |
| Formatting   | Prettier                                   |
| CI / hosting | GitHub Actions → GitHub Pages              |
| Runtime deps | _None_ — vanilla JS, CSS custom properties |

## Project structure

```
free-day-finder/
├── src/
│   ├── index.html            # Single-page entry
│   ├── main.js               # DOM wiring & application bootstrap
│   ├── styles/main.css       # Design tokens + component styles
│   └── modules/
│       ├── dates.js          # Pure date helpers
│       ├── schedule.js       # worksOn / isFree / findFreeDates
│       ├── presets.js        # Canonical shift patterns
│       ├── people.js         # Person factory & escaping helpers
│       └── views.js          # HTML renderers (read state → write DOM)
├── tests/                    # Vitest unit tests
├── .github/
│   ├── workflows/
│   │   ├── ci.yml            # Lint, format, test, build on every PR/push
│   │   └── deploy-pages.yml  # Deploy to Pages on push to main
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── vite.config.js
├── eslint.config.js
└── package.json
```

The split between `modules/` and `views.js` is deliberate. Anything in
`modules/dates.js`, `schedule.js` and `presets.js` is a pure function with no
DOM access — these are the bits with unit tests. `views.js` and `main.js`
own all DOM interaction.

## Getting started

Requirements: **Node 20+** (use `nvm use` to match `.nvmrc`).

```bash
git clone https://github.com/REPLACE_WITH_YOUR_USERNAME/free-day-finder.git
cd free-day-finder
npm ci

npm run dev       # Vite dev server with HMR — http://localhost:5173
npm test          # Run Vitest once
npm run test:watch
npm run lint
npm run build     # Production build → dist/
npm run preview   # Preview the production build
```

## Deploying to GitHub Pages

The repo ships with a [Pages workflow](.github/workflows/deploy-pages.yml) that
builds the site and deploys it on every push to `main`.

One-time setup on a new fork/repo:

1. Push the repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push a commit to `main` (or trigger the workflow manually via
   **Actions → Deploy to GitHub Pages → Run workflow**).

The workflow sets `VITE_BASE` to `/<repository-name>/` automatically so asset
URLs resolve at the project-scoped Pages URL. If you deploy to a custom
domain or to a user-/organisation-scoped repo (`username.github.io`), override
`VITE_BASE` to `/`.

## Testing strategy

All scheduling logic is decoupled from the DOM and covered by unit tests:

- `dates.test.js` — date parsing, formatting and arithmetic edge cases.
- `schedule.test.js` — `worksOn` across all three rota modes, plus
  `isFree` and `findFreeDates` aggregate logic.
- `presets.test.js` — preset id uniqueness and a handful of structural checks.

Tests run under jsdom via Vitest. See `vite.config.js` for the configuration.

## Roadmap

- iCalendar (`.ics`) export so free days can be subscribed to in any calendar.
- Persistence in `localStorage` so people / rotas survive a page refresh.
- Shareable URLs that encode the rota in the query string.
- Optional bank-holiday overlay.

## Licence

[MIT](./LICENSE) © 2026 Raul
