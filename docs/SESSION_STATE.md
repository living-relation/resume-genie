# Session state — Resume Genie

**Last updated:** 2026-08-25
**Git tip:** `b950d4b` — in sync with `origin/main`, CI n/a (no project CI gate)
**Test/deploy:** Render free deploy in progress / needs Manual Sync of tip `b950d4b`

## Read first (new session)

1. `docs/PHASE_HANDOFF.md` — progress + tip SHA
2. This file
3. `README.md` — free deploy steps (Gemini + Supabase/Neon + Render)

## Where the build stands

| Piece | State |
|-------|-------|
| De-Replit monorepo (Windows + Vite proxy + Express SPA) | ✅ |
| Free Gemini AI path + tightened generation caps | ✅ |
| GitHub repo `research655/resume-genie` | ✅ |
| Supabase Postgres schema + RLS | ✅ |
| Render Blueprint deploy | ⏳ Build can succeed; tip `b950d4b` shrinks API bundle to avoid OOM |
| Public live URL smoke (upload → generate → DOCX) | ⬜ |

## What just changed

Revived the Replit backup for free public hosting. Render builds were failing (corepack EROFS, skipped devDeps, then heap OOM on a ~18MB server bundle). Tip `b950d4b` externalizes heavy npm packages so the API bundle is ~0.5MB. Chat hit 80% context while attempting desktop control of Render Manual Sync — that was not finished.

## In flight — read before continuing

- User asked agent to drive PC (Windows MCP / Chrome) to click Render **Manual Sync** + **Approve** for tip `b950d4b`, then verify `/api/healthz`.
- Two Blueprint instances exist: use **Resume Genie Blueprint** (green Synced). Ignore **Spark Robotic Blueprint** (Failed). Prefer service `resume-genie-hztn`.
- Duplicate service `resume-genie` can be deleted after the good one is live.
- Chrome may be open as “New Tab - Google Chrome”; Render login is in the user’s real Chrome session (not Cursor browser).

## Next exact steps

1. On Render: Blueprints → **Resume Genie Blueprint** → **Manual Sync** → **Approve** (commit `b950d4b`).
2. Wait for `resume-genie-hztn` deploy; open `https://<service>.onrender.com/api/healthz` → expect `{"status":"ok"}`.
3. Smoke: upload doc → add job → generate → DOCX download.
4. Delete leftover Blueprint/service duplicates if health is green.

## Gotchas that cost time

- Render: do **not** use `corepack enable` (EROFS on `/usr/bin/pnpm`). Use `npm install -g pnpm@9.15.0`.
- Install with `--prod=false` or esbuild/vite are missing under `NODE_ENV=production`.
- Fully bundled API (~18MB) OOMs on Render free — keep heavy deps external; add `pg` + `openai` as direct api-server deps for pnpm resolution.
- Supabase: no “Project Settings → Database” in new UI. Use **Connect → Direct**, and password reset at `/database/settings`. Paste Gemini key into Render env named `OPENAI_API_KEY`.
- PowerShell execution policy blocks `pnpm.ps1`; use `cmd.exe /c` or `pnpm.cmd`.

## Do not do

- Leave durable work unpushed
- Continue long coding in a chat already at ≥80% context — hand off instead
- Use Framework/anon Supabase keys as `DATABASE_URL`
