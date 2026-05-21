# AI-CardCrafter

AI-CardCrafter is a full-stack marketing card generator for creators, cross-border ecommerce sellers, and indie builders. It turns a plain-language selling point into an editable, high-fidelity card with streaming AI copy, live visual templates, high-DPI PNG export, and local draft recovery.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn-style UI primitives, Zustand, localForage, html-to-image
- Backend: Python, FastAPI, Pydantic, SQLite, OpenAI-compatible chat completions
- Transport: `text/event-stream` with field-level patch events

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://localhost:5173`.

## AI Configuration

Copy `.env.example` to `backend/.env` or set these variables in your shell:

```bash
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
APP_DATABASE_URL=sqlite:///./ai_card_crafter.db
```

When `OPENAI_API_KEY` is empty, the backend uses a built-in mock stream so the demo still works locally.

## CardPayload Contract

```ts
interface CardPayload {
  title: string
  subtitle?: string
  content: string
  tags: string[]
  themeColor: {
    from: string
    to: string
  }
  emojiIcon: string
}
```

## Git Workflow

Use Conventional Commits:

```bash
git commit -m "feat: design card payload schema and zustand store"
git commit -m "feat: implement openai compatible streaming card generation"
git commit -m "feat: add high dpi marketing card export"
```
