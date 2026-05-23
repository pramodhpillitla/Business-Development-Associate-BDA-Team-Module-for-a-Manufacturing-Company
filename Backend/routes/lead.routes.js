import { Router } from "express";
import {
  createLead,
  getLeadById,
  getLeads,
  updateLead,
  deleteLead,
  updateLeadStatus,
} from "../controllers/lead.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all routes
router.use(verifyJWT);

// CRUD
router.route("/")
  .post(createLead)
  .get(getLeads);

router.route("/:id")
  .get(getLeadById)
  .patch(updateLead)
  .delete(deleteLead);

// Special route for Kanban
router.route("/:id/status")
  .patch(updateLeadStatus);

export default router;
