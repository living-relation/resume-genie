---
name: Anonymous per-browser data isolation
description: Why/how this app isolates data per browser without user accounts
---

# Anonymous per-browser session isolation

This app has NO user accounts. Data is isolated per browser via an opaque,
signed, httpOnly cookie (`rg_sid`). Every data row carries a `session_id`
(NOT NULL) and every query is scoped to `req.sessionId`.

**Why:** The user explicitly chose "no login — each browser gets its own
private space" over real accounts. Simplest UX; tradeoff is data is tied to one
browser (clearing cookies / switching devices starts fresh, by design).

**How to apply:**
- Session id is set by `sessionMiddleware` (api-server `lib/session.ts`), wired
  via `cookie-parser(SESSION_SECRET)` in `app.ts`, mounted in `routes/index.ts`
  AFTER the health route (health needs no session).
- ANY new table holding user data must add `session_id text NOT NULL` + an index,
  scope all reads/updates/deletes with `eq(table.sessionId, req.sessionId)`, set
  `sessionId` on insert, and run rows through `stripSession()` before `res.json`
  so the id never reaches client JS (preserves httpOnly benefit).
- Async/background DB writes (e.g. job-scrape follow-up update) must also include
  the `sessionId` predicate, not just the row id.
- Frontend needs no change: it is same-origin with the API behind the proxy, so
  the cookie flows automatically (default fetch credentials = same-origin).
- Cookie is `secure: NODE_ENV === "production"` — off in dev so plain-HTTP local
  tooling (curl over localhost:80) can round-trip it; on in prod (HTTPS proxy).
- `SESSION_SECRET` is REQUIRED — the server throws at startup if missing.
- Adding the NOT NULL `session_id` column to existing tables requires clearing
  existing rows first (TRUNCATE) or providing a default; those legacy rows belong
  to no session and would be orphaned anyway.
