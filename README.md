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

Open: http://localhost:5173/

### Production build

```bash
npm run build
npm run preview
```

## Core Features

### Sprint Planning
- **Adaptive sprint generation** — uses exam deadlines, missed days, free-time preferences, and topic confidence to build weekly study blocks
- **Live rebalancing** — automatically recalculates daily targets when you miss days or fall behind
- **Drag-and-drop** — rearrange topics between sprint blocks using @dnd-kit

### AI Study Companion
- **Chat** — conversational study assistant with topic-aware context (powered by OpenAI GPT-4o)
- **Flashcards** — AI-generated decks with front/back/memory hooks, shareable to study groups
- **Quiz & Practice Exam** — multiple-choice quizzes with automatic confidence scoring
- **Mindmap** — interactive SVG concept maps with clickable nodes that jump to study modes
- **Explain** — multi-level explanations (quick refresh / guided / exam-ready) with spaced repetition schedules

### Progress Analytics
- 14-day activity bar chart, readiness trends, confidence distribution, subject breakdowns
- Mood-vs-efficiency correlation analysis
- Velocity score tracking with comparative period analysis
- Achievement badges and gamification

### Other
- **Focus Timer** — 25-minute Pomodoro with post-session confidence self-assessment
- **Personalized recommendations** — AI-guided priorities based on progress, spacing, and exam urgency
- **Study groups** — create groups, share flashcard decks, schedule sessions (local simulation — see Limitations)
- **Keyboard shortcuts** — `T` (today's focus), `A` (add exam), `/` (search), `Esc` (close overlays)

## AI Setup

1. Open **Settings** in the app.
2. Paste an OpenAI API key (starts with `sk-`).
3. Press **Save**.

Runtime defaults:

| Setting | Value |
|---|---|
| Endpoint | `https://api.openai.com/v1/chat/completions` |
| Model | `gpt-4o` |
| Max tokens | 1000 |

Implementation references:

- Direct client call path: `src/hooks/useAI.js`
- Optional dev proxy middleware: `vite.config.js`

> The app works without a backend for the default direct-call path. The Vite dev proxy exists as an optional local integration path and is not required for normal app usage.

## Persistence Model

All data is stored in the browser's `localStorage`. Primary keys:

| Key | Content |
|---|---|
| `userProfile` | Name, daily goal, study preferences |
| `exams` | Exams, topics, status, AI content |
| `studyLog` | Session history, mood entries |
| `chatHistory` | Per-topic conversation threads |
| `sprint_plans` | Generated sprint blocks per exam |
| `socialStudyHub` | Study groups, resources, challenges |
| `openai_api_key` | OpenAI API key (plain text) |

## Project Structure

```
src/
├── components/
│   ├── ai-companion/   # Chat, Flashcards, Quiz, Mindmap, Explain tabs
│   ├── dashboard/      # Dashboard metrics, recommendations, reminders
│   ├── exams/          # Exam cards, topic rows, add exam modal
│   ├── layout/         # Sidebar, TopBar (fixed positioning)
│   ├── planner/        # Sprint planner with DnD timeline
│   ├── settings/       # API key, profile, export/import, sync
│   ├── shared/         # ErrorBoundary, RouteErrorBoundary, shared UI
│   ├── stats/          # Charts, velocity score, achievements
│   └── timer/          # Pomodoro focus timer
├── hooks/              # useExams, useStudyLog, useAI, useChatHistory, useSocialStudy
└── utils/              # sprintGenerator, readiness, priorityEngine, studyInsights, security
```

## Production Hardening

This build includes the following production-grade measures:

- **XSS protection** — All AI-generated markdown is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify) before rendering
- **Code splitting** — Route-level lazy loading via `React.lazy` reduces initial bundle size
- **Vendor chunking** — React, Recharts, date-fns, and AI libs are split into separate cached chunks
- **Per-route error boundaries** — A crash in one page doesn't destroy the entire app shell
- **Input sanitization** — All user inputs pass through `sanitizeTextInput` / `safeTopicPayload` before storage
- **Storage resilience** — `safeGet/Set` wrappers with graceful fallbacks and cross-tab sync
- **Global error boundary** — Top-level catch-all with recovery UI
- **GitHub Pages SPA routing** — Custom `404.html` redirect for client-side routing support

## Deployment (GitHub Pages)

This repo includes `.github/workflows/deploy-pages.yml`.

### One-time setup

1. Open repository **Settings → Pages**.
2. Set **Source** to **GitHub Actions**.

Deployment triggers on push to `main`.

Expected URL: `https://<owner>.github.io/<repo>/`

## Limitations

> These are intentional design boundaries for a local-first app, not bugs.

- **No backend** — All AI communication happens directly from the client to OpenAI's API. The API key is stored in plain `localStorage`.
- **Study groups are simulated** — The Group Study Hub creates groups and members locally. There is no real multi-user collaboration or networking.
- **Cloud sync is simulated** — The "cloud mirror" feature mirrors data to another localStorage key for export/import convenience. No actual cloud endpoint exists.
- **No multi-device sync** — Data lives in the browser. Use the export/import feature in Settings to transfer between devices.
- **No PWA** — No service worker or install prompt. The app works offline via localStorage but cannot be installed as a native app.

## Troubleshooting

| Issue | Fix |
|---|---|
| AI features unavailable | Confirm API key is saved in Settings |
| Import fails | Ensure selected file is a valid planner JSON backup |
| Pages not updating | Check the Deploy to GitHub Pages workflow run logs |
| Route 404 on hard refresh | The `public/404.html` SPA redirect should handle this; verify it's deployed |

## Tech Stack

| Category | Libraries |
|---|---|
| Core | React 18, React Router 7 |
| Build | Vite 7 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 3 |
| Drag & Drop | @dnd-kit/core |
| AI / Markdown | marked, DOMPurify |
| Utilities | date-fns, lucide-react, html2canvas, canvas-confetti |

## License

Private/internal use unless changed by the repository owner.
