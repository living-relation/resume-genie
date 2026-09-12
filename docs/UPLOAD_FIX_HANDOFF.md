# Handoff — document upload + AI local retest

**Date:** 2026-09-12  
**From:** Cloud agent (Composer) — computer-use / Grok spend limit hit mid-test  
**Pass to:** Grok bot or next Cursor agent on the Windows PC  
**Talk to human in:** 8th-grade English, one click at a time

## Goal

Local Resume Genie works on the PC/LAN again: upload documents (file + paste), then AI generate resumes/cover letters.

## Repo / git

| Item | Value |
|------|--------|
| Repo | `https://github.com/living-relation/resume-genie` |
| Fix branch | `cursor-fix-upload-mime-1b0d` |
| Tip SHA | `5abf3017b3ed1ca83d863270e4f905b23f42fcca` |
| Base | `main` (also has earlier drizzle `.env` load fix `f1bb730`) |
| Local folder | `C:\projects\sparks\resume-genie` (moved after cleanup) |
| Do not | Commit `.env`, paste Neon/Gemini secrets in chat, upgrade pnpm to 12 |

PR for upload fix may need manual create (user settings blocked auto-PR).

## Bugs already fixed on the branch (do not redo)

1. **Windows MIME reject** — browsers often send empty type or `application/octet-stream`.  
   Client + server now accept by **extension** (`.pdf` / `.docx` / `.doc` / `.txt`).  
   Files: `artifacts/resume-ai/src/pages/upload.tsx`, `artifacts/api-server/src/lib/document-format.ts`, `artifacts/api-server/src/routes/documents.ts`

2. **LAN HTTP session cookies** — Secure cookies were dropped on `http://192.168.x.x`, so saves looked like they never stuck.  
   Cookie `secure` now follows real HTTPS / `COOKIE_SECURE=true` only.  
   File: `artifacts/api-server/src/lib/session.ts`

3. **Fetch credentials** — API client always sends `credentials: "include"`.  
   File: `lib/api-client-react/src/custom-fetch.ts`

4. **Clearer DB save error** — JSON `{ error: "…DATABASE_URL…" }` instead of HTML 500.  
   File: `artifacts/api-server/src/routes/documents.ts`

5. **Earlier (on `main` / same lineage):** drizzle schema relative glob + load root `.env` before `db:push`.

## Verified in cloud (not on user’s PC)

- `POST /api/documents/extract-pdf` with `application/octet-stream` + `.txt` → **200** + text  
- `POST /api/documents` with no real DB → **500 JSON** explaining DATABASE_URL  
- Computer-use UI pass on the Windows desktop: **blocked** (monthly spend / model limit)

## Most likely remaining human issue

After the folder move, **`.env` may be missing** from `C:\projects\sparks\resume-genie`.  
Without `DATABASE_URL` + `SESSION_SECRET` + `OPENAI_API_KEY`, paste-save and AI both fail.

## Exact next steps for Grok / next agent

1. On the PC, cwd = `C:\projects\sparks\resume-genie`.
2. `git fetch origin && git checkout cursor-fix-upload-mime-1b0d && git pull`
3. Confirm `.env` exists (copy from `.env.example` if not). Never print secrets.
4. Restart:
   - Terminal 1: `pnpm dev:api` → wait for **Server listening**
   - Terminal 2: `pnpm dev:web` → wait for **5173**
5. Full product test (use computer control if available):
   - Upload PDF/DOCX/TXT
   - Paste text + Save Document
   - Documents list shows the doc
   - Add a job (URL or paste description)
   - Generate application (AI resume + cover letter)
   - Export DOCX if present
   - Phone/LAN: `http://<IPv4>:5173` (firewall rule for 5173 may already exist)
6. If upload still fails: read the **toast text** (now more specific). If it mentions DATABASE_URL, fix `.env` only in the editor.
7. When green: merge branch to `main` (or ask human to approve PR), then `git checkout main && git pull` in the sparks folder.

## Commands cheat sheet

```bash
cd C:\projects\sparks\resume-genie
git fetch origin cursor-fix-upload-mime-1b0d
git checkout cursor-fix-upload-mime-1b0d
git pull
pnpm install
pnpm db:push
pnpm dev:api
pnpm dev:web
```

## Do not

- Ask human to paste Neon URLs / Gemini keys into chat  
- Follow Neon coding-agent wizard  
- Upgrade pnpm to 12  
- Stop on Node engine warning (Node 24+ OK)  
- Commit `.env`
