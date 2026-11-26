import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findEnvFile } from "@workspace/db/repo-root";

/**
 * Load repo-root `.env` for local dev.
 * The root is the directory that contains `pnpm-workspace.yaml`, found by
 * walking up from the working directory and from this file. Set
 * `RESUME_GENIE_ROOT` when the checkout lives somewhere that walk cannot see.
 * `pnpm --filter @workspace/api-server` runs with cwd `artifacts/api-server`.
 */
const envFile = findEnvFile([
  process.cwd(),
  path.dirname(fileURLToPath(import.meta.url)),
]);

if (envFile) {
  loadEnv({ path: envFile });
}
