# Varuna Netra Frontend

React dashboard for the Varuna Netra maritime oil-spill intelligence platform.

## What the UI provides

- public judge landing and read-only guest exploration;
- signup/login/account and role-request flows;
- operational dashboard and system-health views;
- map-based spill/case exploration;
- Sentinel-1 scene and AIS context;
- candidate-vessel ranking with explainable factor breakdowns;
- evidence timeline and provenance views;
- jurisdiction/reference context;
- detector feedback/precision views;
- dedicated SIH judge walkthrough.

## Requirements

- Node.js 20 recommended
- Yarn 1.22.x
- running Varuna Netra backend

## Setup

```bash
cp .env.example .env
yarn install
yarn start
```

`frontend/.env` should contain:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Do not put API keys or server secrets in frontend environment variables. Browser-delivered variables are not secret.

## Useful commands

```bash
yarn start   # development server
yarn lint    # ESLint
yarn build   # production build
yarn test    # test runner
```

## Judge/demo design principles

The frontend intentionally distinguishes:

- **live/current status** from **historical case evidence**;
- **real/reference/demo** provenance;
- experimental detector output from confirmed analyst findings;
- candidate-vessel ranking from legal responsibility;
- reference jurisdiction boundaries from authoritative legal determinations.

The SIH walkthrough is designed to make those distinctions visible rather than hide uncertainty.

## Main libraries

- React
- React Router
- Leaflet / React-Leaflet
- Recharts
- Tailwind CSS
- Axios
- Lucide icons

For the full system architecture, security notes and validation plan, see the repository root `README.md`, `SECURITY.md` and `docs/VALIDATION.md`.
