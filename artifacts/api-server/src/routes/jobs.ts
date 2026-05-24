import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  CreateJobBody,
  GetJobParams,
  DeleteJobParams,
} from "@workspace/api-zod";
import * as cheerio from "cheerio";
import { logger } from "../lib/logger";

const router: IRouter = Router();

async function scrapeJobListing(url: string): Promise<{
  title: string | null;
  company: string | null;
  location: string | null;
  description: string | null;
}> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $("script, style, nav, footer, header, iframe, noscript").remove();

    // Try to extract title
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      null;

    // Try to extract company name from common patterns
    const company =
      $('[itemprop="hiringOrganization"] [itemprop="name"]').first().text().trim() ||
      $(".company-name, .employer-name, [data-company], [class*=\"company\"]").first().text().trim() ||
      null;

    // Try to extract location
    const location =
      $('[itemprop="jobLocation"]').first().text().trim() ||
      $(".location, [class*=\"location\"]").first().text().trim() ||
      null;

    // Extract main text content for description
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
  const jobs = await db.select().from(jobsTable).orderBy(jobsTable.createdAt);
  res.json(jobs);
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { url } = parsed.data;

  // Validate URL
  try {
    new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  // Create job with pending status
  const [job] = await db
    .insert(jobsTable)
    .values({ url, status: "pending" })
    .returning();

  res.status(201).json(job);

  // Scrape asynchronously after response
  scrapeJobListing(url).then(async ({ title, company, location, description }) => {
    await db
      .update(jobsTable)
      .set({
        title,
        company,
        location,
        description,
        status: title || description ? "scraped" : "failed",
      })
      .where(eq(jobsTable.id, job.id));
  }).catch((err) => {
    logger.error({ err, jobId: job.id }, "Failed to update job after scraping");
    db.update(jobsTable).set({ status: "failed" }).where(eq(jobsTable.id, job.id)).catch(() => {});
  });
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(job);
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
