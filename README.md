# SplitLab

A personal running dashboard that pulls activity data from Strava and layers on
pace/effort analysis, run logging, and trend tracking. Built as a React SPA
backed by Vercel serverless functions, with Supabase for persistence.

## Features

- **Strava OAuth connect** — authorize once; tokens are refreshed and stored server-side.
- **Dashboard** — last run summary, personal records, recent activity, weekly volume, and pace/effort charts.
- **Runs** — browse logged runs and drill into a single run's splits and pacing verdict.
- **Trends** — weekly load and pace trend views over time.
- **Effort logging** — log perceived effort (RPE), soreness, and notes per run, protected by a shared app password.

## Research foundations

SplitLab's core product decisions — pacing-shape classification, RPE-based effort logging, the Volume × Pace Quadrant, and several deliberately deferred features (effort-adjusted pace, biomechanical fatigue detection) — are grounded in a review of five sports-science papers on pacing, fatigue, and injury risk in runners. The findings, what transfers to a phone-only GPS running app, and what doesn't, are written up in [docs/research-foundations.md](docs/research-foundations.md). Worth reading before proposing new "smart" features that imply prediction or prescription (e.g. injury risk, fatigue detection) the underlying research doesn't actually support.

## Tech stack

- **Client:** React 18 + Vite, React Router, Recharts, Storybook for component development.
- **API:** Vercel serverless functions (`api/`) — Strava OAuth, activities, personal records, run logs.
- **Data:** Supabase (Postgres) for Strava tokens and run logs (`db/schema.sql`).

## Project structure

```
api/            Vercel serverless functions (auth, activities, records, run-logs)
client/         React + Vite frontend
  src/components   Reusable UI pieces (charts, cards, sidebar, forms)
  src/views         Route-level pages (Dashboard, Runs, RunDetail, Trends)
  src/ui            Design-system primitives
  src/tokens.css/js Design tokens
db/             Supabase schema (run_logs, strava_tokens)
server/         Local Express server used for Strava OAuth during development
```

## Getting started

### Prerequisites

- Node.js 18+
- A [Strava API application](https://www.strava.com/settings/api)
- A [Supabase](https://supabase.com) project

### Setup

1. Install dependencies:

   ```bash
   npm run install:all
   ```

2. Copy `.env.example` to `.env.local` and fill in your Strava and Supabase credentials. Run the SQL in the comments (also in `db/schema.sql`) against your Supabase project to create the `strava_tokens` and `run_logs` tables.

3. Set `APP_PASSWORD` and `AUTH_SECRET` — these gate saving perceived effort/notes (reading stays public).

### Run locally

```bash
npm start
```

This runs `vercel dev` (API) and the Vite dev server (client) concurrently. Open the client URL Vite prints, connect to Strava, and the dashboard will populate with your activities.

To run just the client:

```bash
npm run dev:client
```

### Storybook

Component-level development and visual review live in Storybook:

```bash
npm --prefix client run storybook
```

## Deployment

Deployed on Vercel. `vercel.json` maps API routes to the functions in `api/` and serves the built client (`client/dist`) for everything else. Set the environment variables from `.env.example` in your Vercel project settings before deploying.

## License

See [LICENSE](LICENSE).
