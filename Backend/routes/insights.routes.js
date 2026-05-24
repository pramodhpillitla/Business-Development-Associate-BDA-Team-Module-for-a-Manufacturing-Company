import { Router } from "express";
import { getAiInsights } from "../controllers/insights.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getAiInsights);

export default router;
