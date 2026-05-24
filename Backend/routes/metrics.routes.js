import { Router } from "express";
import { getDashboardSummary as getMetricsSummary } from "../controllers/metrics.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getMetricsSummary);

export default router;