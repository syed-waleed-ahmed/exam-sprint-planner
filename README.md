# Exam Sprint Planner

A standalone single-page study planning app built with React 18 + Tailwind CSS.

It combines:
- Sprint planning and revision tracking
- AI-assisted study modes (Chat, Flashcards, Quiz, Mindmap, Explain)
- Local-first persistence with `localStorage`

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

## Project Structure

- `src/components/` UI pages and feature components
- `src/hooks/` data + API hooks
- `src/utils/` readiness, sprint generation, date and prioritization logic

## Prerequisites

- Node.js 18+
- npm 9+

## Run Locally

```bash
npm install
npm run dev
```

App runs at:
- `http://localhost:5173/`

## Build

```bash
npm run build
npm run preview
```

## Persistence Model

All app data is stored in browser `localStorage`:
- `userProfile`
- `exams`
- `studyLog`
- `chatHistory`
- `sprint_plans`
- `openai_api_key`

## OpenAI API Setup

1. Open **Settings** in the app.
2. Paste your OpenAI API key in the API key field.
3. Save.

The app calls:
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4o`

No backend is required.

## Keyboard Shortcuts

- `T` -> jump to Today's Focus
- `A` -> open Add Exam modal
- `/` -> focus topic search in AI Companion
- `Esc` -> close open modal

## Notes

- AI generation gracefully handles missing keys and API errors.
- Flashcards/Quiz/Mindmap/Explain outputs are cached per topic in `localStorage`.
- Focus timer updates confidence and logs sessions.

## Graphify

Graph outputs are generated under `graphify-out/` (ignored by git).

Recommended run commands:

```bash
python -m pip install graphifyy
/graphify src
```

Generated artifacts:
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`
- `graphify-out/graph.html`

## License

Private/internal use unless changed by repository owner.
