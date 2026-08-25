# Resume Genie — Phase handoff (living)

**Last updated:** 2026-08-25
**Branch tip:** `7ce5fec` on `origin/main` (CI n/a)
**Working branch:** `main`

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

## Next exact step

1. Manual Sync **Resume Genie Blueprint** for tip `7ce5fec` so `render.yaml` `AI_MODEL` matches.
2. Optional: disconnect/delete failed **Spark Robotic Blueprint**.

## GitHub ↔ local sync

1. Clone: `C:\Users\Administrator\Downloads\ReplitExport-danielgrippin\Resume-Genie`
2. After a slice: commit → push `main` → confirm local matches `origin/main`
3. Render redeploys via Blueprint Manual Sync (or auto sync if configured)

## Notes from this slice

- Live URL: https://resume-genie-hztn.onrender.com — `/api/healthz` → `{"status":"ok"}`
- E2E smoke OK: upload → job → generate → DOCX (`scripts/smoke-live.mjs`)
- `DATABASE_URL` must be **Session pooler** (IPv4): `postgres.PROJECT@aws-0-us-east-1.pooler.supabase.com:5432` — Direct is IPv6-only
- Password special chars (e.g. `@`) must be percent-encoded (`%40`)
- New Gemini keys reject `gemini-2.5-flash` → use `gemini-3.6-flash`
- Duplicate suspended `resume-genie` service deleted; keep `resume-genie-hztn`
