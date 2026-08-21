import path from "node:path";
import fs from "node:fs";
import express, { type Express } from "express";
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

export default app;
