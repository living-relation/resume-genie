# Session state — Resume Genie

**Last updated:** 2026-08-25
**Git tip:** pushing free-public go-live fixes (model + pooler docs + SSL)
**Test/deploy:** Render `resume-genie-hztn` Live; health + full smoke OK; Blueprint Manual Sync owed after push

## Read first (new session)

1. `docs/PHASE_HANDOFF.md` — progress + tip SHA
2. This file
3. `README.md` — free deploy steps (Gemini + Supabase/Neon + Render)

## Where the build stands

| Piece | State |
|-------|-------|
| De-Replit monorepo (Windows + Vite proxy + Express SPA) | ✅ |
| Free Gemini AI path + tightened generation caps | ✅ (`gemini-3.6-flash`) |
| GitHub repo `research655/resume-genie` | ✅ |
| Supabase Postgres schema + RLS | ✅ |
| Render Blueprint deploy | ✅ Live |
| Public live URL smoke (upload → generate → DOCX) | ✅ |

## What just changed

Public go-live complete. Fixed two prod blockers:

1. **DB:** Direct Supabase URI is IPv6-only → Render free couldn't insert. Use **Session pooler** (`aws-0-us-east-1.pooler.supabase.com:5432`, user `postgres.<project-ref>`). Percent-encode `@` in the DB password.
2. **AI:** New Gemini keys get 404 on `gemini-2.5-flash` → `AI_MODEL=gemini-3.6-flash`.

Also: DB client SSL relax for hosted Postgres; living docs; live smoke script; deleted suspended duplicate `resume-genie`.

## In flight — read before continuing

- After push: Manual Sync **Resume Genie Blueprint** so blueprint `AI_MODEL` matches (Render env already set).
- Failed **Spark Robotic Blueprint** can still be disconnected/deleted optionally.

## Next exact steps

1. Manual Sync Blueprint after this release lands on `main`.
2. Optional: remove Spark Robotic Blueprint.
3. Spot-check site after idle spin-up if needed.

## Gotchas that cost time

- Render: do **not** use `corepack enable` (EROFS on `/usr/bin/pnpm`). Use `npm install -g pnpm@9.15.0`.
- Install with `--prod=false` or esbuild/vite are missing under `NODE_ENV=production`.
- Fully bundled API (~18MB) OOMs on Render free — keep heavy deps external; add `pg` + `openai` as direct api-server deps for pnpm resolution.
- Supabase: **Connect → Direct → Session pooler** for Render (IPv4). Direct host is IPv6-only. Password reset at `/database/settings`. Paste Gemini key into Render env named `OPENAI_API_KEY`.
- New Gemini API keys: use `gemini-3.6-flash` (not `gemini-2.5-flash`).
- PowerShell execution policy blocks `pnpm.ps1`; use `cmd.exe /c` or `pnpm.cmd`.

## Do not do

- Leave durable work unpushed
- Continue long coding in a chat already at ≥80% context — hand off instead
- Use Framework/anon Supabase keys as `DATABASE_URL`
- Use Supabase Direct (IPv6) URI on Render free without IPv4 add-on
