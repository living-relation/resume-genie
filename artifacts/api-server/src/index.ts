import { config as loadEnv } from "dotenv";
import path from "node:path";
import app from "./app";
import { logger } from "./lib/logger";

// After imports (lazy DB/AI clients). Loads repo-root .env for local dev;
// Render/host env vars already set in process.env take precedence.
loadEnv({ path: path.resolve(process.cwd(), ".env") });

const rawPort = process.env["PORT"] || "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
