import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  CreateJobBody,
  GetJobParams,
  DeleteJobParams,
  UpdateJobParams,
  UpdateJobBody,
} from "@workspace/api-zod";
import * as cheerio from "cheerio";
import { logger } from "../lib/logger";
import { stripSession } from "../lib/session";

const router: IRouter = Router();

function stripHtml(html: string): string {
  return cheerio.load(`<div>${html}</div>`)("div").text().replace(/\s+/g, " ").trim();
}

function extractJsonLdJobPosting(html: string): {
  title: string | null;
  company: string | null;
  location: string | null;
  description: string | null;
} | null {
  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]').toArray();

  for (const script of scripts) {
    const raw = $(script).contents().text();
    if (!raw.trim()) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    const candidates: unknown[] = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && "@graph" in parsed && Array.isArray((parsed as { "@graph": unknown[] })["@graph"])
        ? (parsed as { "@graph": unknown[] })["@graph"]
        : [parsed];

    for (const node of candidates) {
      if (!node || typeof node !== "object") continue;
      const obj = node as Record<string, unknown>;
      const type = obj["@type"];
      const isJobPosting = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
      if (!isJobPosting) continue;

      const title = typeof obj.title === "string" ? obj.title.trim() : null;

      let company: string | null = null;
      const org = obj.hiringOrganization;
      if (typeof org === "string") company = org;
      else if (org && typeof org === "object" && typeof (org as Record<string, unknown>).name === "string") {
        company = (org as Record<string, string>).name;
      }

      let location: string | null = null;
      const loc = obj.jobLocation;
      const firstLoc = Array.isArray(loc) ? loc[0] : loc;
      if (firstLoc && typeof firstLoc === "object") {
        const addr = (firstLoc as Record<string, unknown>).address;
        if (typeof addr === "string") location = addr;
        else if (addr && typeof addr === "object") {
          const a = addr as Record<string, unknown>;
          const parts = [a.addressLocality, a.addressRegion, a.addressCountry].filter(p => typeof p === "string");
          location = parts.length ? parts.join(", ") : null;
        }
      }

      const descRaw = typeof obj.description === "string" ? obj.description : null;
      const description = descRaw ? stripHtml(descRaw) : null;

      if (title || description) {
        return { title, company, location, description };
      }
    }
  }
  return null;
}

function normalizeJobUrl(rawUrl: string): string {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  const host = u.host.toLowerCase();

  // Indeed: mobile redirects often land on the homepage with `vjk=<jobkey>` in
  // the query string (e.g. `indeed.com/?vjk=abc&from=mobRdr`). Rewrite to the
  // canonical viewjob URL so we hit the real job page, not the homepage.
  if (/(?:^|\.)indeed\./i.test(host)) {
    const jk = u.searchParams.get("vjk") || u.searchParams.get("jk");
    if (jk) {
      return `https://www.indeed.com/viewjob?jk=${encodeURIComponent(jk)}`;
    }
    // Mobile host → desktop host
    if (host.startsWith("m.")) {
      u.host = u.host.replace(/^m\./, "www.");
      return u.toString();
    }
  }

  // Generic mobile-host normalization for other major job boards.
  if (/^m\.(linkedin|glassdoor|monster|ziprecruiter|simplyhired)\./i.test(host)) {
    u.host = u.host.replace(/^m\./, "www.");
    return u.toString();
  }

  return u.toString();
}

async function scrapeJobListing(rawUrl: string): Promise<{
  title: string | null;
  company: string | null;
  location: string | null;
  description: string | null;
}> {
  const url = normalizeJobUrl(rawUrl);
  try {
    const host = (() => { try { return new URL(url).host; } catch { return ""; } })();
    const isIndeed = /(?:^|\.)indeed\./i.test(host);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Sec-Ch-Ua": '"Chromium";v="122", "Google Chrome";v="122", "Not-A.Brand";v="99"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"macOS"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        ...(isIndeed ? { Referer: "https://www.google.com/" } : {}),
      },
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();

    // First, try structured data (JSON-LD JobPosting). This is the most reliable
    // method and works on Indeed, LinkedIn (public), Glassdoor, Greenhouse, Lever,
    // Workday, and most company career pages.
    const jsonLd = extractJsonLdJobPosting(html);
    if (jsonLd && (jsonLd.title || jsonLd.description)) {
      return {
        title: jsonLd.title ? jsonLd.title.slice(0, 255) : null,
        company: jsonLd.company ? jsonLd.company.slice(0, 255) : null,
        location: jsonLd.location ? jsonLd.location.slice(0, 255) : null,
        description: jsonLd.description ? jsonLd.description.slice(0, 8000) : null,
      };
    }

    // Fallback: parse HTML directly
    const $ = cheerio.load(html);
    $("script, style, nav, footer, header, iframe, noscript").remove();

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      null;

    const company =
      $('[itemprop="hiringOrganization"] [itemprop="name"]').first().text().trim() ||
      $('meta[property="og:site_name"]').attr("content") ||
      $(".company-name, .employer-name, [data-company], [class*=\"company\"]").first().text().trim() ||
      null;

    const location =
      $('[itemprop="jobLocation"]').first().text().trim() ||
      $(".location, [class*=\"location\"]").first().text().trim() ||
      null;

    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const description = bodyText.slice(0, 8000) || null;

    return {
      title: title ? title.slice(0, 255) : null,
      company: company ? company.slice(0, 255) : null,
      location: location ? location.slice(0, 255) : null,
      description,
    };
  } catch (err) {
    logger.warn({ err, url }, "Failed to scrape job listing");
    return { title: null, company: null, location: null, description: null };
  }
}

router.get("/jobs", async (req, res): Promise<void> => {
  const jobs = await db
    .select()
    .from(jobsTable)
    .where(eq(jobsTable.sessionId, req.sessionId))
    .orderBy(jobsTable.createdAt);
  res.json(jobs.map(stripSession));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const url = parsed.data.url?.trim() || null;
  const manualTitle = parsed.data.title?.trim() || null;
  const manualCompany = parsed.data.company?.trim() || null;
  const manualLocation = parsed.data.location?.trim() || null;
  const manualDescription = parsed.data.description?.trim() || null;

  if (!url && !manualDescription) {
    res.status(400).json({ error: "Provide a URL or paste a job description" });
    return;
  }

  if (url) {
    try {
      new URL(url);
    } catch {
      res.status(400).json({ error: "Invalid URL" });
      return;
    }
  }

  // If the user pasted a description, treat as immediately scraped; otherwise pending.
  const initialStatus = manualDescription ? "scraped" : "pending";

  const [job] = await db
    .insert(jobsTable)
    .values({
      sessionId: req.sessionId,
      url: url ?? "",
      title: manualTitle,
      company: manualCompany,
      location: manualLocation,
      description: manualDescription,
      status: initialStatus,
    })
    .returning();

  res.status(201).json(stripSession(job));

  // Only scrape when a URL was provided AND the user didn't already supply text.
  if (url && !manualDescription) {
    scrapeJobListing(url).then(async ({ title, company, location, description }) => {
      // Guard against overwriting manual edits: only apply scrape results if the
      // job is still in "pending" state. If the user edited it in the meantime
      // (status becomes "scraped" or "failed"), respect that.
      await db
        .update(jobsTable)
        .set({
          title: manualTitle ?? title,
          company: manualCompany ?? company,
          location: manualLocation ?? location,
          description: description,
          status: title || description ? "scraped" : "failed",
        })
        .where(and(eq(jobsTable.id, job.id), eq(jobsTable.sessionId, job.sessionId), eq(jobsTable.status, "pending")));
    }).catch((err) => {
      logger.error({ err, jobId: job.id }, "Failed to update job after scraping");
      db.update(jobsTable)
        .set({ status: "failed" })
        .where(and(eq(jobsTable.id, job.id), eq(jobsTable.sessionId, job.sessionId), eq(jobsTable.status, "pending")))
        .catch(() => {});
    });
  }
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateJobBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.id, params.data.id), eq(jobsTable.sessionId, req.sessionId)));
  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const next = {
    title: body.data.title !== undefined ? (body.data.title?.trim() || null) : existing.title,
    company: body.data.company !== undefined ? (body.data.company?.trim() || null) : existing.company,
    location: body.data.location !== undefined ? (body.data.location?.trim() || null) : existing.location,
    description: body.data.description !== undefined ? (body.data.description?.trim() || null) : existing.description,
  };

  // Only recompute status when the user actually edited title or description
  // in this PATCH. Otherwise preserve the existing status (don't flip pending
  // jobs to failed on a no-op or location-only edit).
  const touchedContent =
    body.data.title !== undefined || body.data.description !== undefined;
  const status = touchedContent
    ? next.title || next.description
      ? "scraped"
      : "failed"
    : existing.status;

  const [updated] = await db
    .update(jobsTable)
    .set({ ...next, status })
    .where(and(eq(jobsTable.id, params.data.id), eq(jobsTable.sessionId, req.sessionId)))
    .returning();

  res.json(stripSession(updated));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .select()
    .from(jobsTable)
    .where(and(eq(jobsTable.id, params.data.id), eq(jobsTable.sessionId, req.sessionId)));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(stripSession(job));
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db
    .delete(jobsTable)
    .where(and(eq(jobsTable.id, params.data.id), eq(jobsTable.sessionId, req.sessionId)))
    .returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
