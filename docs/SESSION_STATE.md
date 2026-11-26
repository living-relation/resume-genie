# Session state — Resume Genie

**Last updated:** 2026-11-26
**Git tip:** branch `dan_cursor/pr-comment-fixes-c68b`
**Test/deploy:** local `pnpm run ci:typecheck` and `pnpm run ci:test` (CI on the PR after push)
**Status:** In flight — six review fixes from research655/resume-genie#2

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

Review comment on https://github.com/research655/resume-genie/pull/2 (head is `living-relation/main`). Fixes live on `dan_cursor/pr-comment-fixes-c68b`.

## Next exact steps

1. Land the branch on `living-relation/main` when CI is green.
2. Merge research655/resume-genie#2 so the upstream repo gets the same commits.

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
