import { Router, type IRouter } from "express";
import healthRouter from "./health";
import documentsRouter from "./documents";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(documentsRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(statsRouter);

export default router;
