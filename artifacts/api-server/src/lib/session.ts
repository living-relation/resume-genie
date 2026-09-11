import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const COOKIE_NAME = "rg_sid";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}

/**
 * Anonymous per-browser session. We don't have user accounts; instead each
 * browser gets an opaque, signed, httpOnly cookie the first time it hits the
 * API. Every data row is scoped to this id so visitors never see each other's
 * documents, jobs, or generated applications.
 */
export const sessionMiddleware: RequestHandler = (req, res, next) => {
  const existing = req.signedCookies?.[COOKIE_NAME];
  let sid = typeof existing === "string" && existing.length > 0 ? existing : undefined;

  if (!sid) {
    sid = randomUUID();
    // Prefer the actual request scheme over NODE_ENV. Local LAN access is plain
    // HTTP (e.g. http://192.168.x.x:5173); Secure cookies are dropped by the
    // browser on HTTP and every request looks like a new empty session — so
    // uploads appear to fail / never show up in Documents.
    const forwardedProto = req.headers["x-forwarded-proto"];
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
    const secure =
      process.env.COOKIE_SECURE === "true" ||
      req.secure ||
      proto === "https";
    res.cookie(COOKIE_NAME, sid, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      signed: true,
      path: "/",
      maxAge: ONE_YEAR_MS,
    });
  }

  req.sessionId = sid;
  next();
};

/**
 * Strip the internal `sessionId` field before returning a row to the client.
 * The session id lives in an httpOnly cookie and must never be exposed to JS.
 */
export function stripSession<T extends { sessionId?: unknown }>(row: T): Omit<T, "sessionId"> {
  const { sessionId: _omit, ...rest } = row;
  return rest;
}
