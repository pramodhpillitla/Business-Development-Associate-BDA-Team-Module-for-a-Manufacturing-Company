import { Lead } from "../models/lead.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Create Lead
export const createLead = asyncHandler(async (req, res) => {
  const { name, company, contactInfo, assignedTo, dealValue } = req.body;

  if (!name || !company || !contactInfo || !assignedTo) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const lead = await Lead.create({
    name,
    company,
    contactInfo,
    assignedTo,
    dealValue,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, lead, "Lead created successfully"));
});


// Get All Leads
export const getLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find()
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, leads, "Leads fetched successfully"));
});


// Update Lead (general update)
export const updateLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await Lead.findById(id);
  if (!lead) throw new ApiError(404, "Lead not found");

  Object.assign(lead, req.body);
  await lead.save();

  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead updated successfully"));
});


// Delete Lead
export const deleteLead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await Lead.findByIdAndDelete(id);
  if (!lead) throw new ApiError(404, "Lead not found");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Lead deleted successfully"));
});


// Update Lead Status (KANBAN LOGIC)
export const updateLeadStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["New", "Contacted", "Qualified", "Won", "Lost"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  const lead = await Lead.findById(id);
  if (!lead) throw new ApiError(404, "Lead not found");

  lead.status = status;

  // Business logic lives here (NOT frontend)
  if (status === "Won" || status === "Lost") {
    lead.closedAt = new Date();
  } else {
    lead.closedAt = null;
  }

  await lead.save();

  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead status updated"));
});