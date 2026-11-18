# Session state — Resume Genie

**Last updated:** 2026-08-26
**Git tip:** `98937a5` — in sync with `origin/main`, CI n/a
**Test/deploy:** Render `resume-genie-hztn` Live on `98937a5`; health + full smoke OK
**Status:** Closed — no in-flight work

## Read first (new session)

1. `docs/PHASE_HANDOFF.md` — progress + tip SHA
2. This file
3. `README.md` — free deploy steps (Gemini + Supabase/Neon + Render)

## Where the build stands

| Piece | State |
|-------|-------|
| De-Replit monorepo (Windows + Vite proxy + Express SPA) | ✅ |
| Free Gemini AI path + tightened generation caps | ✅ (`gemini-3.6-flash`) |
| GitHub repo `research655/resume-genie` | ✅ `v1.0.0` |
| Supabase Postgres schema + RLS | ✅ |
| Render Blueprint deploy | ✅ Live on `98937a5` |
| Public live URL smoke (upload → generate → DOCX) | ✅ |

## What just changed

Marked go-live complete. Tip `98937a5` is Live via Manual Deploy (GitHub push did not auto-deploy). Full smoke passed after deploy.

## In flight — read before continuing

Nothing in flight.

## Next exact steps

1. None required.
2. Optional: remove failed Spark Robotic Blueprint in Render.

## Gotchas that cost time

- Render: do **not** use `corepack enable` (EROFS on `/usr/bin/pnpm`). Use `npm install -g pnpm@9.15.0`.
- Install with `--prod=false` or esbuild/vite are missing under `NODE_ENV=production`.
- Fully bundled API (~18MB) OOMs on Render free — keep heavy deps external; add `pg` + `openai` as direct api-server deps for pnpm resolution.
- Supabase: **Connect → Direct → Session pooler** for Render (IPv4). Direct host is IPv6-only. Password reset at `/database/settings`. Paste Gemini key into Render env named `OPENAI_API_KEY`.
- New Gemini API keys: use `gemini-3.6-flash` (not `gemini-2.5-flash`).
- PowerShell execution policy blocks `pnpm.ps1`; use `cmd.exe /c` or `pnpm.cmd`.
- Blueprint-managed service: pushes may not auto-deploy — use **Manual Deploy → Deploy latest commit**. Blueprint Manual Sync UI can no-op from automation; optional for yaml history.

## Do not do

- Leave durable work unpushed
- Continue long coding in a chat already at ≥80% context — hand off instead
- Use Framework/anon Supabase keys as `DATABASE_URL`
- Use Supabase Direct (IPv6) URI on Render free without IPv4 add-on
- Recreate duplicate `resume-genie` services under Spark Robotic Blueprint
