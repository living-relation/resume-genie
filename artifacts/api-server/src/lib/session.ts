import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const COOKIE_NAME = "rg_sid";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Secure cookies are dropped by browsers on plain HTTP, so a home LAN
 * (`http://192.168.x.x`) must stay insecure or every request looks like a new
 * empty session. `COOKIE_SECURE=true` forces the Secure flag (HTTPS deploys).
 * Otherwise we follow the request: `req.secure`, or the first hop in
 * `X-Forwarded-Proto` when a reverse proxy terminates TLS.
 */
export function shouldUseSecureCookie(options: {
  cookieSecure: string | undefined;
  requestSecure: boolean;
  forwardedProto: string | string[] | undefined;
}): boolean {
  if ((options.cookieSecure ?? "").trim().toLowerCase() === "true") return true;
  if (options.requestSecure) return true;
  const raw = Array.isArray(options.forwardedProto)
    ? options.forwardedProto.join(",")
    : (options.forwardedProto ?? "");
  const first = raw.split(",")[0]?.trim().toLowerCase() ?? "";
  return first === "https";
}

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
    const secure = shouldUseSecureCookie({
      cookieSecure: process.env.COOKIE_SECURE,
      requestSecure: req.secure,
      forwardedProto: req.headers["x-forwarded-proto"],
    });
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
