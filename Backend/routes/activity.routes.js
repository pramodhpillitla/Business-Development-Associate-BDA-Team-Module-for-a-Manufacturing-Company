import { Router } from "express";
import {
  createActivity,
  getActivitiesByLead,
} from "../controllers/activity.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// activities are always tied to a lead
router.route("/leads/:id/activities")
  .post(createActivity)
  .get(getActivitiesByLead);

export default router;