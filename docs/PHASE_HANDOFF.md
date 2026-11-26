# Resume Genie — Phase handoff (living)

**Last updated:** 2026-11-26
**Branch tip:** `dan_cursor/pr-comment-fixes-c68b` (not merged yet)
**Working branch:** `dan_cursor/pr-comment-fixes-c68b`
**Status:** Review fixes for research655/resume-genie#2 — env root, CI typecheck, upload MIME, cookies, upload errors, Windows stop ownership

> After every meaningful commit: update this file **and** session state in the same commit (or the immediately following docs commit). Do not leave progress only in chat.

## Progress

| # | Step | Status |
|---|------|--------|
| 1 | De-Replit / Windows-friendly monorepo | ✅ |
| 2 | Gemini free AI + usage caps + privacy note | ✅ |
| 3 | `.env.example`, README, `render.yaml`, schema SQL | ✅ |
| 4 | GitHub `research655/resume-genie` | ✅ |
| 5 | Supabase restore + tables + RLS | ✅ |
| 6 | Render free Blueprint live + health smoke | ✅ |
| 7 | End-to-end public product smoke | ✅ |
| 8 | Release `v1.0.0` + tip `98937a5` Manual Deploy Live | ✅ |

## Next exact step

Merge `dan_cursor/pr-comment-fixes-c68b` into `living-relation/main` when CI is green, then merge research655/resume-genie#2.

## GitHub ↔ local sync

1. Canonical repo: https://github.com/research655/resume-genie
2. After a slice: commit → push `main` → confirm local matches `origin/main`
3. Render: Manual Deploy latest commit (Blueprint-managed; auto-deploy of pushes was not firing). Blueprint Manual Sync is optional history hygiene when `render.yaml` changes.

## Notes from this slice

- Live URL: https://resume-genie-hztn.onrender.com — `/api/healthz` → `{"status":"ok"}`
- E2E smoke OK: upload → job → generate → DOCX (`scripts/smoke-live.mjs`)
- Live tip: `98937a5` (Manual Deploy 2026-08-25)
- Release: https://github.com/research655/resume-genie/releases/tag/v1.0.0
- `DATABASE_URL` must be **Session pooler** (IPv4): `postgres.PROJECT@aws-0-us-east-1.pooler.supabase.com:5432` — Direct is IPv6-only
- Password special chars (e.g. `@`) must be percent-encoded (`%40`)
- New Gemini keys reject `gemini-2.5-flash` → use `gemini-3.6-flash`
- Keep service `resume-genie-hztn` / **Resume Genie Blueprint** only
