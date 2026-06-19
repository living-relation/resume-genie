import { Router, type IRouter } from "express";
import healthRouter from "./health";
import documentsRouter from "./documents";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import exportRouter from "./export";
import statsRouter from "./stats";
import { sessionMiddleware } from "../lib/session";

const router: IRouter = Router();

// Health check needs no session; everything else is scoped per browser session.
router.use(healthRouter);
router.use(sessionMiddleware);
router.use(documentsRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(exportRouter);
router.use(statsRouter);

export default router;
