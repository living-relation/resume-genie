# Resume Genie

Upload resumes and cover letters, paste job listings, and get AI-tailored application documents — free to use, no account required.

## Features

1. **Upload** — paste text or upload PDF / DOCX / TXT
2. **Add jobs** — paste a job URL (auto-scrape) or paste the description
3. **Generate** — AI writes a tailored resume + cover letter (tone, style, truthfulness controls)
4. **Download** — copy text or export DOCX (classic / modern / minimal layouts)

Data is isolated per browser via a signed cookie. There is no login.

## Stack

- React + Vite + Tailwind (frontend)
- Express 5 (API)
- PostgreSQL + Drizzle ORM
- Google Gemini Flash via OpenAI-compatible API (free tier)

## Local development

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 9+
- A free [Neon](https://neon.tech) Postgres database (or any Postgres)
- A free [Google AI Studio](https://aistudio.google.com) API key

### Setup

1. Copy env file and fill secrets:

```bash
cp .env.example .env
```

2. Install and push schema:

```bash
pnpm install
pnpm db:push
```

3. Run API (port 8080) and frontend (port 5173) in two terminals:

```bash
pnpm dev:api
pnpm dev:web
```

Open http://localhost:5173 — Vite proxies `/api` to the API server.

## Free public deploy (Render + Postgres + Gemini)

Repo: https://github.com/research655/resume-genie

One-click Render Blueprint (sign in, then paste secrets):  
https://render.com/deploy?repo=https://github.com/research655/resume-genie

You need three free secrets. No credit card required for the default path.

### 1. Google AI Studio (free Gemini key)

1. Open https://aistudio.google.com
2. Sign in with Google
3. Click **Get API key** → create / copy a key
4. Keep it private — only paste it into Render secrets later

### 2. Free Postgres (`DATABASE_URL`)

Use either:

- **Neon** — https://neon.tech → create project → copy connection string (`sslmode=require`)
- **Supabase** — Project Settings → Database → Connection string (URI)

Then create tables once (from this repo, with `DATABASE_URL` set):

```bash
pnpm db:push
```

Or run the SQL in [`scripts/schema.sql`](scripts/schema.sql) in the Neon/Supabase SQL editor.

### 3. Render (free web service)

**Option A — Blueprint (recommended)**

1. Open the deploy link above (or Dashboard → **New** → **Blueprint** → this repo)
2. When prompted, set:
   - `DATABASE_URL` = Postgres connection string
   - `OPENAI_API_KEY` = Gemini API key
3. Deploy (`SESSION_SECRET` is auto-generated)

**Option B — Manual Web Service**

1. **New** → **Web Service** → connect `research655/resume-genie`
2. Runtime: **Node**
3. Build command:

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm run build:deploy
```

4. Start command:

```bash
pnpm start
```

5. Plan: **Free**
6. Environment variables:

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (Postgres URL) |
| `OPENAI_API_KEY` | (Gemini key) |
| `OPENAI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` |
| `AI_MODEL` | `gemini-2.5-flash` |
| `SESSION_SECRET` | long random string |
| `GENERATION_SESSION_DAILY_LIMIT` | `5` |
| `GENERATION_IP_DAILY_LIMIT` | `10` |

7. Open `https://YOUR-SERVICE.onrender.com/api/healthz` — should return healthy JSON
8. Open the site root and run through: upload → add job → generate → download DOCX

### Notes

- Render free services **spin down after ~15 minutes idle**. The first request after sleep can take 30–60 seconds.
- Free Gemini quotas are shared across all visitors. Daily per-browser / per-IP caps protect the quota.
- On Gemini’s free tier, prompts may be used to improve Google’s products (see in-app Privacy page).
- **Groq fallback** (if Gemini is unavailable): set `OPENAI_BASE_URL=https://api.groq.com/openai/v1`, `OPENAI_API_KEY` to a Groq key, and `AI_MODEL=llama-3.3-70b-versatile`.
- If you use **Supabase** as Postgres: connect with the **database URI** (Settings → Database), not the anon API key. Tables should have RLS enabled so the anon key cannot read them; the Node server uses the DB password and still works.

## Project layout

| Path | Role |
| --- | --- |
| `artifacts/resume-ai` | Frontend |
| `artifacts/api-server` | Express API (+ serves SPA in production) |
| `lib/db` | Drizzle schema |
| `lib/api-spec` | OpenAPI contract |
| `lib/integrations-openai-ai-server` | AI client |

Secondary packages (`resume-ai-deck`, `mockup-sandbox`) are not part of the deploy build.
