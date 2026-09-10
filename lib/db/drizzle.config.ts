import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load repo-root .env before checking DATABASE_URL (Windows-safe relative path).
const rootEnvPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.env",
);
if (fs.existsSync(rootEnvPath)) {
  for (const line of fs.readFileSync(rootEnvPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  // Relative glob — absolute path.join(__dirname, ...) breaks on Windows when
  // the folder name is resume-genie (drizzle-kit: No schema files found).
  schema: "./src/schema/*.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
