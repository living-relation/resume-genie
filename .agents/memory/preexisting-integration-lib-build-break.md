---
name: Pre-existing integration-lib build break
description: Why full `pnpm run typecheck` / `typecheck:libs` is red even on clean work, and how to verify your own changes instead.
---

# Pre-existing integration-lib build break

`pnpm run typecheck` and `pnpm run typecheck:libs` fail in this repo regardless of your changes, because two auto-generated integration libs don't build in a fresh environment:

- `lib/integrations-openai-ai-react` — missing its `react` peer dep in its own `node_modules`, so every `react` import is TS2307.
- `lib/integrations-openai-ai-server` — `src/image/client.ts` has `response.data` possibly-undefined (TS18048) errors.

Both libs' `dist/` is **git-ignored** (never committed), so when they fail to build, any consumer typecheck cascades with TS6305 ("Output file ... has not been built from source"). In particular `artifacts/api-server` typecheck fails with TS6305 on the `@workspace/integrations-openai-ai-server` import even when api-server's own code is correct.

**Why:** these are generated integration scaffolds; editing them is out of scope and risks being overwritten. The react one needs a dependency install in an unused lib.

**How to apply:**
- Don't treat a red `typecheck:libs` as your regression. Confirm the failing files are under `lib/integrations-openai-ai-*` before investigating.
- Verify your own work by building only the libs you touched (`npx tsc --build lib/db/tsconfig.json lib/api-zod/tsconfig.json lib/api-client-react/tsconfig.json`) and running per-artifact `pnpm --filter @workspace/<slug> run typecheck`.
- `artifacts/api-server` dev/build uses esbuild (`build.mjs`) which bundles and does NOT typecheck, so the server runs fine despite the TS6305; verify api-server changes by restarting the workflow + curling `localhost:80/api/...`.
