# Exam Sprint Planner

A local-first React study planner for exam preparation, adaptive sprint scheduling, and AI-guided revision.

## What It Does

The app now combines:
- Smart sprint generation based on exam deadlines, missed study days, free-time preferences, and high-yield topics
- AI study workflows for chat, flashcards, quizzes, practice exams, mindmaps, and layered explanations
- Personalized recommendations driven by study history, streaks, quiz performance, and review spacing
- Progress analytics with badges, comparative charts, mood tracking, and efficiency feedback
- Collaboration features for study groups, shared resources, peer reviews, leaderboards, and challenges
- Offline-friendly local persistence with sync-pack export/import and cloud-mirror metadata in `localStorage`
- H-Farm-oriented integration settings for exposing the planner inside a wider academic dashboard

## Tech Stack

- React 18
- React Router
- Vite
- Tailwind CSS
- Recharts
- `@dnd-kit/core`
- `date-fns`
- `lucide-react`
- `marked`
- `html2canvas`
- `canvas-confetti`

## Project Structure

- `src/components/` feature UI for dashboard, planner, AI companion, stats, settings, exams, and timer flows
- `src/hooks/` local persistence hooks, AI API wrapper, chat history, and social study state
- `src/utils/` sprint generation, readiness, prioritization, date helpers, and study insight utilities
- `src/graphify-out/` Graphify architecture artifacts generated from the `src/` tree

## Prerequisites

- Node.js 18+
- npm 9+

## Run Locally

```bash
npm install
npm run dev
```

Default dev URL:
- `http://localhost:5173/`

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

This repo includes a workflow at `.github/workflows/deploy-pages.yml` that deploys on every push to `main`.

One-time setup in GitHub:
1. Open repository **Settings** -> **Pages**.
2. Set **Source** to **GitHub Actions**.

After that, push to `main` and the site will be published automatically.

## Production Readiness

This repo is now prepared for production deployment with:
- Responsive layouts hardened for mobile, tablet, and desktop breakpoints
- Shared UI primitives (`input`, `button`, `card`) to keep pages modular and consistent
- Input sanitization helpers for user-entered fields and persisted payloads
- Defensive import validation for backup restore flow
- Safer markdown rendering path for AI-generated assistant/explanation content
- Regenerated architecture graph (`graphify update src`) aligned with the current codebase

Current pre-deploy check:
- `npm run build` passes successfully
- Vite reports a large bundle warning for the main chunk; app works, but code-splitting is recommended for further optimization

## Persistence Model

The app is local-first and stores data in browser `localStorage`.

Primary keys:
- `userProfile`
- `exams`
- `studyLog`
- `chatHistory`
- `sprint_plans`
- `socialStudyHub`
- `exam_sprint_cloud_snapshot`
- `exam_sprint_sync_meta`
- `openai_api_key`

## AI Setup

1. Open **Settings**.
2. Paste your OpenAI API key.
3. Save.

Current API configuration in the app:
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o`

No backend is required.

## Key Features

### Personalized planning
- Adaptive sprint generation with missed-day recovery
- Topic prioritization using urgency, confidence, and recent performance
- Study efficiency suggestions and smart reminders

### AI study companion
- Topic chat
- Flashcards with custom notes/definitions
- Quizzes and full-length practice exams
- Explanation depth modes
- Interactive mindmaps with study-mode links
- AI-driven review schedules and extra exam-style questions

### Collaboration and motivation
- Study groups and scheduled group sprints
- Shared flashcard decks/resources
- Peer-review metadata
- Leaderboards and challenge cards
- Achievement badges and streak tracking

### Analytics
- Readiness tracking
- Subject and daily activity charts
- Comparative long-term trend charts
- Mood-to-efficiency correlation

## Keyboard Shortcuts

- `T` jumps to Today’s Focus
- `A` opens the Add Exam modal
- `/` focuses topic search in AI Companion
- `Esc` closes open overlays

## Graphify

Graphify is generated from the `src/` tree so the architecture view reflects the app code directly.

Regenerate it with:

```bash
graphify update src
```

Tracked Graphify artifacts:
- `src/graphify-out/GRAPH_REPORT.md`
- `src/graphify-out/graph.json`
- `src/graphify-out/graph.html`

Ignored Graphify cache/noise:
- `src/graphify-out/cache/`
- legacy root-level `graphify-out/`

## Notes

- The app is designed to remain usable offline.
- Sync is local-first and export/import friendly; no remote backend is included.
- AI generation handles missing API keys and request failures gracefully.
- For stricter enterprise deployments, add CSP/security headers at hosting level and route-level code splitting in Vite.

## License

Private/internal use unless changed by the repository owner.
