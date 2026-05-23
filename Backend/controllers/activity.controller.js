import { Activity } from "../models/Activity.js";
import { Lead } from "../models/Lead.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Create Activity (add note / interaction)
export const createActivity = asyncHandler(async (req, res) => {
  const { id: leadId } = req.params;
  const { message, type } = req.body;

  if (!message) {
    throw new ApiError(400, "Activity message is required");
  }

  // ensure lead exists
  const lead = await Lead.findById(leadId);
  if (!lead) throw new ApiError(404, "Lead not found");

  const activity = await Activity.create({
    leadId,
    message,
    type,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, activity, "Activity created successfully"));
});


// Get all activities for a lead
export const getActivitiesByLead = asyncHandler(async (req, res) => {
  const { id: leadId } = req.params;

  const activities = await Activity.find({ leadId })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, activities, "Activities fetched successfully")
    );
});
