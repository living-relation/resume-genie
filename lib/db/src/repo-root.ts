import fs from "node:fs";
import path from "node:path";

/**
 * Find this monorepo's root without a hardcoded `../../.env` hop.
 *
 * `RESUME_GENIE_ROOT` wins when it points at a real checkout (the folder that
 * contains `pnpm-workspace.yaml` or the root package named `workspace`).
 * Otherwise we walk upward from `start`. Nested package.json files
 * (`artifacts/api-server`, `lib/db`, …) are not the root.
 */
export function findRepoRoot(start: string): string | null {
  const override = process.env.RESUME_GENIE_ROOT?.trim();
  if (override) {
    const resolved = path.resolve(override);
    if (isRepoRoot(resolved)) return resolved;
  }

  let dir = path.resolve(start);
  const seen = new Set<string>();
  while (!seen.has(dir)) {
    seen.add(dir);
    if (isRepoRoot(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** First existing `<repo>/.env` found by walking each start directory. */
export function findEnvFile(starts: readonly string[]): string | null {
  const seen = new Set<string>();
  for (const start of starts) {
    if (!start) continue;
    const root = findRepoRoot(start);
    if (!root || seen.has(root)) continue;
    seen.add(root);
    const envPath = path.join(root, ".env");
    if (fs.existsSync(envPath)) return envPath;
  }
  return null;
}

function isRepoRoot(dir: string): boolean {
  if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return true;
  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { name?: unknown };
    return pkg.name === "workspace";
  } catch {
    return false;
  }
}
