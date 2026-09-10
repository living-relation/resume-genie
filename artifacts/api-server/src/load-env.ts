import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Load repo-root `.env` for local dev.
 * `pnpm --filter @workspace/api-server` runs with cwd `artifacts/api-server`,
 * and the built file lives in `dist/`, so try several known locations.
 */
const candidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../.env"),
];

for (const envPath of candidates) {
  if (!fs.existsSync(envPath)) continue;
  loadEnv({ path: envPath });
  break;
}
