import { Router, type IRouter } from "express";
import { db, documentsTable, jobsTable, applicationsTable } from "@workspace/db";
import { and, eq, count } from "drizzle-orm";
import { getGenerationAllowance } from "../lib/usage";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const sid = req.sessionId;
  const clientIp = req.ip ?? "unknown";
  const [[docResult], [jobResult], [appResult], [pendingJobsResult], [completedAppsResult], allowance] = await Promise.all([
    db.select({ count: count() }).from(documentsTable).where(eq(documentsTable.sessionId, sid)),
    db.select({ count: count() }).from(jobsTable).where(eq(jobsTable.sessionId, sid)),
    db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.sessionId, sid)),
    db.select({ count: count() }).from(jobsTable).where(and(eq(jobsTable.sessionId, sid), eq(jobsTable.status, "pending"))),
    db.select({ count: count() }).from(applicationsTable).where(and(eq(applicationsTable.sessionId, sid), eq(applicationsTable.status, "done"))),
    getGenerationAllowance(sid, clientIp),
  ]);

  res.json({
    documentCount: Number(docResult?.count ?? 0),
    jobCount: Number(jobResult?.count ?? 0),
    applicationCount: Number(appResult?.count ?? 0),
    pendingJobs: Number(pendingJobsResult?.count ?? 0),
    completedApplications: Number(completedAppsResult?.count ?? 0),
    generationsRemaining: allowance.remaining,
    generationsLimit: allowance.limit,
    generationsResetAt: allowance.resetAt,
  });
});

export default router;
