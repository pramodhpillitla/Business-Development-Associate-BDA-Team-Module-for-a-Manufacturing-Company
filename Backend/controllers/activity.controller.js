import mongoose from "mongoose";

import { ACTIVITY_TYPES, Activity } from "../models/Activity.js";
import { Lead } from "../models/Lead.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ensureValidObjectId = (id, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
};

const ensureLeadOwnership = (lead, user) => {
  if (user.role === "admin") return;
  
  const assigneeId = lead.assignedTo?._id ? lead.assignedTo._id.toString() : lead.assignedTo?.toString();
  if (assigneeId !== user._id.toString()) {
    throw new ApiError(403, "Forbidden: You can only modify leads assigned to you.");
  }
};

const ensureLeadExists = async (leadId) => {
  ensureValidObjectId(leadId, "lead id");

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  return lead;
};

const populateActivity = (query) => {
  return query
    .populate("createdBy", "name email role")
    .populate("leadId", "name company status dealValue");
};

export const createActivity = asyncHandler(async (req, res) => {
  const { id: leadId } = req.params;
  const { message, type = "note" } = req.body;

  if (!message?.trim()) {
    throw new ApiError(400, "Activity message is required");
  }

  if (!ACTIVITY_TYPES.includes(type)) {
    throw new ApiError(400, "Invalid activity type");
  }

  const lead = await ensureLeadExists(leadId);
  ensureLeadOwnership(lead, req.user);

  const activity = await Activity.create({
    leadId,
    message,
    type,
    createdBy: req.user._id,
  });

  const populatedActivity = await populateActivity(Activity.findById(activity._id));

  return res
    .status(201)
    .json(new ApiResponse(201, populatedActivity, "Activity created successfully"));
});

export const getActivitiesByLead = asyncHandler(async (req, res) => {
  const { id: leadId } = req.params;
  const { type } = req.query;

  await ensureLeadExists(leadId);

  const filter = { leadId };

  if (type) {
    if (!ACTIVITY_TYPES.includes(type)) {
      throw new ApiError(400, "Invalid activity type");
    }

    filter.type = type;
  }

  const activities = await populateActivity(
    Activity.find(filter).sort({ createdAt: -1 })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, activities, "Activities fetched successfully"));
});

export const updateActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  const { message, type } = req.body;

  ensureValidObjectId(activityId, "activity id");

  const activity = await Activity.findById(activityId);

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  const lead = await ensureLeadExists(activity.leadId);
  ensureLeadOwnership(lead, req.user);

  if (message !== undefined) {
    if (!message.trim()) {
      throw new ApiError(400, "Activity message cannot be empty");
    }

    activity.message = message;
  }

  if (type !== undefined) {
    if (!ACTIVITY_TYPES.includes(type)) {
      throw new ApiError(400, "Invalid activity type");
    }

    activity.type = type;
  }

  await activity.save();

  const updatedActivity = await populateActivity(Activity.findById(activity._id));

  return res
    .status(200)
    .json(new ApiResponse(200, updatedActivity, "Activity updated successfully"));
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const { activityId } = req.params;

  ensureValidObjectId(activityId, "activity id");

  const activity = await Activity.findById(activityId);

  if (!activity) {
    throw new ApiError(404, "Activity not found");
  }

  const lead = await ensureLeadExists(activity.leadId);
  ensureLeadOwnership(lead, req.user);

  await activity.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Activity deleted successfully"));
});
