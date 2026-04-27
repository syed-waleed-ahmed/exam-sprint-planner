# Exam Sprint Planner

A local-first React app for exam preparation with adaptive sprint planning, AI-guided study flows, and progress analytics.

## Quickstart

### Prerequisites

- Node.js 20 LTS recommended (Node.js 18+ works)
- npm 9+

### Install and run

```bash
npm ci
npm run dev
```

Open:

- http://localhost:5173/

### Production build

```bash
npm run build
npm run preview
```

## Core Features

- Adaptive sprint generation using exam deadlines, missed days, free-time preferences, and topic confidence
- AI companion for chat, flashcards, quizzes, practice exams, mindmaps, and layered explanations
- Personalized recommendations using study history, streaks, and performance trends
- Analytics for readiness, activity trends, mood, and efficiency
- Collaboration tools for study groups, shared resources, and challenge-style motivation
- Local-first persistence with export/import backup flows

## AI Setup

1. Open Settings in the app.
2. Paste an OpenAI API key.
3. Press Save.

Current runtime defaults:

- Endpoint: https://api.openai.com/v1/chat/completions
- Model: gpt-4o

Implementation references:

- Direct client call path: src/hooks/useAI.js
- Optional dev proxy middleware: vite.config.js

Notes:

- The app works without a backend for the default direct-call path.
- The Vite dev proxy exists as an optional local integration path and is not required for normal app usage.

## Persistence Model

Primary localStorage keys:

- userProfile
- exams
- studyLog
- chatHistory
- sprint_plans
- socialStudyHub
- exam_sprint_cloud_snapshot
- exam_sprint_sync_meta
- openai_api_key

## Keyboard Shortcuts

- T: jump to Today's Focus
- A: open Add Exam modal
- /: focus topic search in AI Companion
- Esc: close open overlays

## Project Structure

- src/components: feature UI for dashboard, planner, AI companion, stats, settings, exams, and timer
- src/hooks: persistence hooks, AI wrapper, chat history, and social study state
- src/utils: sprint generation, readiness, prioritization, date helpers, and study insights

## Graphify Artifacts

Authoritative artifacts live in:

- src/graphify-out/GRAPH_REPORT.md
- src/graphify-out/graph.json
- src/graphify-out/graph.html

Regenerate from source:

```bash
graphify update src
```

Workspace note:

- Treat src/graphify-out as the canonical output for this app.

## Deployment (GitHub Pages)

This repo includes:

- .github/workflows/deploy-pages.yml

Deployment triggers on push to main.

One-time GitHub setup:

1. Open repository Settings -> Pages.
2. Set Source to GitHub Actions.

After setup, push to main to deploy.

Expected Pages URL format:

- https://<owner>.github.io/<repo>/

## Troubleshooting

- AI features unavailable: confirm API key is saved in Settings.
- Build warning about large chunks: app still works; consider route-level code splitting in Vite.
- Import fails: ensure selected file is a valid planner JSON backup.
- Pages not updating: check the Deploy to GitHub Pages workflow run logs.

## Production Notes

- Responsive layouts are tuned for mobile, tablet, and desktop.
- Input and backup data paths include sanitization/validation safeguards.
- App remains usable offline with local persistence.

## Tech Stack

- React 18
- React Router
- Vite
- Tailwind CSS
- Recharts
- @dnd-kit/core
- date-fns
- lucide-react
- marked
- html2canvas
- canvas-confetti

## License

Private/internal use unless changed by the repository owner.
