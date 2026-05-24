import { Lead } from "../models/Lead.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAiInsights = asyncHandler(async (_req, res) => {
  const activeLeads = await Lead.find({
    status: { $nin: ["Won", "Lost"] },
  })
    .populate("assignedTo", "name")
    .lean();

  const aggregateResult = await Lead.aggregate([
    { $group: { _id: null, averageDealValue: { $avg: "$dealValue" } } },
  ]);
  const avgDealValue = aggregateResult[0]?.averageDealValue || 0;

  const insights = [];

  for (const lead of activeLeads) {
    const daysSinceUpdate =
      (new Date() - new Date(lead.updatedAt)) / (1000 * 60 * 60 * 24);

    let probability = 50; // Base probability
    let suggestion = "";
    let priority = "medium";
    let title = "";

    if (lead.status === "Negotiation") {
      probability = 85;
      title = "High Potential Deal";
      suggestion = "High intent stage. Schedule a closing call within 24 hours.";
      priority = "high";
    } else if (lead.dealValue > avgDealValue * 2 && lead.status !== "New") {
      probability = 70;
      title = "Whale Opportunity";
      suggestion = "High-value prospect. Ensure senior leadership is involved in the next touchpoint.";
      priority = "high";
    } else if (daysSinceUpdate > 14) {
      probability = 20;
      title = "Risky / Stagnant Lead";
      suggestion = "Lead hasn't moved in 14+ days. Send a re-engagement email or move to Lost to clean pipeline.";
      priority = "low";
    } else if (lead.status === "Proposal") {
      probability = 60;
      title = "Proposal Sent";
      suggestion = "Follow up to ensure they received the proposal and ask if they have any initial questions.";
      priority = "medium";
    } else {
      continue; // Skip generic leads that don't trigger an insight
    }

    insights.push({
      leadId: lead._id,
      leadName: lead.name,
      company: lead.company,
      assignedTo: lead.assignedTo?.name || "Unassigned",
      stage: lead.status,
      probability,
      title,
      suggestion,
      priority,
      dealValue: lead.dealValue,
    });
  }

  // Sort by highest probability for 'high' priority, and lowest for 'low' (risky)
  insights.sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    return b.probability - a.probability;
  });

  // Return the top 4 most actionable insights
  const topInsights = insights.slice(0, 4);

  return res
    .status(200)
    .json(new ApiResponse(200, topInsights, "AI Insights generated successfully"));
});
