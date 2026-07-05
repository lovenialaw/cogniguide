# COGNIGUIDE — Caregiver Dashboard

A modern healthcare web dashboard for an AI-powered Alzheimer's smartwatch. Built for family caregivers to monitor patients in real time: location, motion, fall detection, vitals, and AI-driven risk analytics — all with realistic, live-updating mock data.

## Features

- **Dashboard Home** — patient status, indoor location, heart rate sparkline, activity summary, and an AI overall risk card.
- **Live Monitoring** — animated motion status, live accelerometer/gyroscope charts, and an AI fall-detection panel with a simulated emergency flow.
- **Location Monitoring** — a Wi-Fi RSSI–based home floor plan with a live patient marker, signal strength, geofence status, and wandering alerts.
- **AI Analytics** — fall frequency (daily/weekly/monthly), trend analysis, activity recognition breakdown, and model confidence gauges.
- **Vital Signs** — heart rate, SpO2, temperature, and stress with 24h/7d/30d history and AI-generated insights.
- **Alert History** — a searchable, filterable event log with PDF export (print).
- **Emergency** — a dedicated response center with one-tap calling and map actions, automatically activated by fall detection.
- **Settings** — patient profile, device status, and notification preferences.
- **AI Assistant Chatbot** — floating chat widget on every page; answers questions about vitals, falls, location, and trends using live patient data.

All data is simulated client-side (see `src/context/PatientDataContext.tsx`) so the dashboard feels alive without a backend. Use the **Simulate Fall** and **Simulate Wandering** buttons (Live Monitoring / Location pages) to preview the alert flows.

**Fall analytics** on the AI Analytics page are derived from the live alert log — each detected fall is counted in the frequency charts, and the trend analysis compares the last 4 weeks against the prior 4 weeks to flag accelerating decline.

### AI Assistant

Click the chat bubble (bottom-right) to open **COGNIGUIDE Assistant**. It reads live dashboard data to answer caregiver questions.

- **Default mode:** Built-in context-aware responses (no API key required)
- **Optional GPT mode:** Add `VITE_OPENAI_API_KEY` to a `.env` file (see `.env.example`) to use OpenAI GPT-4o mini

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (theme tokens in `src/index.css`)
- Framer Motion for animation
- Recharts for charts
- Lucide React for icons
- React Router (HashRouter)

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

### Build

```bash
npm run build
npm run preview
```

### Deploy to GitHub Pages

The site is published at **[https://lovenialaw.github.io/cogniguide/](https://lovenialaw.github.io/cogniguide/)**.

1. In the GitHub repo, go to **Settings → Pages**
2. Under **Build and deployment → Source**, choose **GitHub Actions** (NOT “Deploy from a branch”)
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds `dist/` and deploys automatically

**Dashboard URL:** `https://lovenialaw.github.io/cogniguide/#/`

Do not deploy the raw source folder. GitHub Pages must serve the built output from `npm run build`, not `/src/main.tsx`.

#### If deploy suddenly fails or the site goes blank

This usually means **Pages source was switched to “Deploy from a branch”**, which conflicts with the GitHub Actions workflow.

| Symptom | Cause |
|---------|--------|
| Red ❌ “pages build and deployment” failed | Branch deploy fighting with Actions deploy |
| Blank page / `main.tsx` 404 | Raw source deployed instead of `dist/` |
| Site returns 404 | Last deploy failed; nothing live |

**Fix:**

1. **Settings → Pages → Source → GitHub Actions**
2. Open **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**
3. Wait ~1 minute, then open `https://lovenialaw.github.io/cogniguide/#/`

Use only **“Deploy to GitHub Pages”** (our workflow). Ignore or disable branch-based Pages deploy.

## Project Structure

```
src/
  components/
    layout/       # Sidebar, TopBar, DashboardLayout
    ui/           # GlassCard, StatusBadge, SignalBars, etc.
    dashboard/    # Dashboard Home cards
    live/         # Live Monitoring widgets
    location/     # Location Monitoring widgets
    analytics/    # AI Analytics charts
    vitals/       # Vital Signs widgets
  context/        # PatientDataProvider — simulated live data & actions
  lib/            # mock data generators & utilities
  pages/          # one file per route
  types/          # shared TypeScript types
```

## Disclaimer

This is a UI/UX demo. All patient data, sensor readings, and AI outputs are randomly generated for demonstration purposes and are not connected to a real device or medical system.
