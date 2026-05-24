import mongoose from "mongoose";

import { Activity } from "../models/Activity.js";
import { LEAD_STATUSES, Lead } from "../models/Lead.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../src/lib/socket.js";

const CLOSED_STATUSES = ["Won", "Lost"];
const LEAD_UPDATE_FIELDS = [
  "name",
  "company",
  "contactInfo",
  "status",
  "dealValue",
  "assignedTo",
  "closedAt",
];

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

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parseNumberFilter = (value, label) => {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new ApiError(400, `${label} must be a valid number`);
  }

  return parsedValue;
};

const parseDateFilter = (value, label) => {
  const parsedValue = new Date(value);

  if (Number.isNaN(parsedValue.getTime())) {
    throw new ApiError(400, `${label} must be a valid date`);
  }

  return parsedValue;
};

const applyClosedAtRule = (lead) => {
  if (CLOSED_STATUSES.includes(lead.status)) {
    lead.closedAt = lead.closedAt || new Date();
    return;
  }

  lead.closedAt = null;
};

const ensureAssignableUser = async (userId) => {
  ensureValidObjectId(userId, "assigned user id");

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "Assigned user not found");
  }

  return user;
};

const populateLead = (query) => {
  return query
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role");
};

export const createLead = asyncHandler(async (req, res) => {
  const { name, company, contactInfo, assignedTo, dealValue, status } = req.body;

  if (!name || !company || !contactInfo || !assignedTo) {
    throw new ApiError(400, "Name, company, contact info, and assignee are required");
  }

  if (status && !LEAD_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  await ensureAssignableUser(assignedTo);

  const lead = await Lead.create({
    name,
    company,
    contactInfo,
    status,
    assignedTo,
    dealValue,
    createdBy: req.user._id,
  });

  const populatedLead = await populateLead(Lead.findById(lead._id));

  await Activity.create({
    leadId: lead._id,
    message: `Lead created and assigned to ${populatedLead.assignedTo?.name || "User"}`,
    type: "system",
    createdBy: req.user._id,
  });

  getIO().emit("lead:created", populatedLead);

  return res
    .status(201)
    .json(new ApiResponse(201, populatedLead, "Lead created successfully"));
});

export const getLeads = asyncHandler(async (req, res) => {
  const {
    assignedTo,
    createdBy,
    endDate,
    limit = 50,
    maxDealValue,
    minDealValue,
    page = 1,
    search,
    startDate,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const filter = {};

  if (status) {
    if (!LEAD_STATUSES.includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    filter.status = status;
  }

  if (assignedTo) {
    ensureValidObjectId(assignedTo, "assigned user id");
    filter.assignedTo = assignedTo;
  }

  if (createdBy) {
    ensureValidObjectId(createdBy, "creator user id");
    filter.createdBy = createdBy;
  }

  if (minDealValue || maxDealValue) {
    filter.dealValue = {};

    if (minDealValue) {
      filter.dealValue.$gte = parseNumberFilter(minDealValue, "Minimum deal value");
    }

    if (maxDealValue) {
      filter.dealValue.$lte = parseNumberFilter(maxDealValue, "Maximum deal value");
    }
  }

  if (startDate || endDate) {
    filter.createdAt = {};

    if (startDate) filter.createdAt.$gte = parseDateFilter(startDate, "Start date");
    if (endDate) filter.createdAt.$lte = parseDateFilter(endDate, "End date");
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { name: searchRegex },
      { company: searchRegex },
      { contactInfo: searchRegex },
    ];
  }

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
  const skip = (pageNumber - 1) * limitNumber;

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const [leads, total] = await Promise.all([
    populateLead(
      Lead.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
    ),
    Lead.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        leads,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          pages: Math.ceil(total / limitNumber),
        },
      },
      "Leads fetched successfully"
    )
  );
});

export const getLeadById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  ensureValidObjectId(id, "lead id");

  const lead = await populateLead(Lead.findById(id));

  if (!lead) throw new ApiError(404, "Lead not found");

  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead fetched successfully"));
});

export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  ensureValidObjectId(id, "lead id");

  const lead = await Lead.findById(id);
  if (!lead) throw new ApiError(404, "Lead not found");

  ensureLeadOwnership(lead, req.user);

  const oldStatus = lead.status;

  for (const field of LEAD_UPDATE_FIELDS) {
    if (req.body[field] !== undefined) {
      lead[field] = req.body[field];
    }
  }

  if (lead.status && !LEAD_STATUSES.includes(lead.status)) {
    throw new ApiError(400, "Invalid status value");
  }

  if (req.body.assignedTo) {
    await ensureAssignableUser(req.body.assignedTo);
  }

  applyClosedAtRule(lead);
  await lead.save();

  if (oldStatus !== lead.status) {
    await Activity.create({
      leadId: lead._id,
      message: `Lead moved from ${oldStatus} → ${lead.status}`,
      type: "system",
      createdBy: req.user._id,
    });
  }

  const updatedLead = await populateLead(Lead.findById(lead._id));

  getIO().emit("lead:updated", updatedLead);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLead, "Lead updated successfully"));
});

export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  ensureValidObjectId(id, "lead id");

  const lead = await Lead.findById(id);
  if (!lead) throw new ApiError(404, "Lead not found");

  ensureLeadOwnership(lead, req.user);

  await lead.deleteOne();

  await Activity.deleteMany({ leadId: id });

  getIO().emit("lead:deleted", id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Lead and activities deleted successfully"));
});

export const updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  ensureValidObjectId(id, "lead id");

  if (!LEAD_STATUSES.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const lead = await Lead.findById(id);
  if (!lead) throw new ApiError(404, "Lead not found");

  ensureLeadOwnership(lead, req.user);

  const oldStatus = lead.status;

  lead.status = status;
  applyClosedAtRule(lead);
  await lead.save();

  if (oldStatus !== status) {
    await Activity.create({
      leadId: lead._id,
      message: `Lead moved from ${oldStatus} → ${status}`,
      type: "system",
      createdBy: req.user._id,
    });
  }

  const updatedLead = await populateLead(Lead.findById(lead._id));

  getIO().emit("lead:updated", updatedLead);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLead, "Lead status updated"));
});
