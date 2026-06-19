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
    res.cookie(COOKIE_NAME, sid, {
      httpOnly: true,
      sameSite: "lax",
      // Served over HTTPS in production (and the Replit preview proxy). Kept off
      // in development so plain-HTTP local tooling can round-trip the cookie.
      secure: process.env.NODE_ENV === "production",
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
