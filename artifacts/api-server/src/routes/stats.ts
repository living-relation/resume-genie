import { Router, type IRouter } from "express";
import { db, documentsTable, jobsTable, applicationsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  const [[docResult], [jobResult], [appResult], [pendingJobsResult], [completedAppsResult]] = await Promise.all([
    db.select({ count: count() }).from(documentsTable),
    db.select({ count: count() }).from(jobsTable),
    db.select({ count: count() }).from(applicationsTable),
    db.select({ count: count() }).from(jobsTable).where(eq(jobsTable.status, "pending")),
    db.select({ count: count() }).from(applicationsTable).where(eq(applicationsTable.status, "done")),
  ]);

  res.json({
    documentCount: Number(docResult?.count ?? 0),
    jobCount: Number(jobResult?.count ?? 0),
    applicationCount: Number(appResult?.count ?? 0),
    pendingJobs: Number(pendingJobsResult?.count ?? 0),
    completedApplications: Number(completedAppsResult?.count ?? 0),
  });
});

export default router;
