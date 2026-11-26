import "./load-env";
import path from "node:path";
import fs from "node:fs";
import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required to sign session cookies");
}

const app: Express = express();

// Trust X-Forwarded-For behind Render / other reverse proxies so req.ip is the
// real client (used by the generation cost guardrail).
app.set("trust proxy", true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser(SESSION_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

const staticDir =
  process.env.STATIC_DIR ||
  path.resolve(process.cwd(), "artifacts/resume-ai/dist/public");

if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir, { index: false }));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (req.path.startsWith("/api")) {
      next();
      return;
    }
    res.sendFile(path.join(staticDir, "index.html"), (err) => {
      if (err) next(err);
    });
  });
  logger.info({ staticDir }, "Serving frontend static files");
} else {
  logger.warn(
    { staticDir },
    "Frontend build not found — API-only mode (run the Vite app separately in dev)",
  );
}

const jsonErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: publicApiError(err) });
};

app.use(jsonErrorHandler);

export default app;

/** JSON body for errors that escaped a route. Never include a connection string. */
export function publicApiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "";
  if (/DATABASE_URL/i.test(raw) && !/postgres(ql)?:\/\//i.test(raw)) {
    return "The database is not configured. DATABASE_URL is missing. Copy .env.example to .env, set DATABASE_URL, then restart the API.";
  }
  return "Unexpected server error. If you were saving a document, check that DATABASE_URL in .env is set and the database is reachable, then restart the API.";
}
