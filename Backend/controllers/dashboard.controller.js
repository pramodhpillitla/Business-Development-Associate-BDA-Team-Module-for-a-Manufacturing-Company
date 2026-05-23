import { Lead } from "../models/lead.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  // overall stats
  const totalLeads = await Lead.countDocuments();

  const wonDeals = await Lead.countDocuments({ status: "Won" });
  const lostDeals = await Lead.countDocuments({ status: "Lost" });

  const revenueResult = await Lead.aggregate([
    { $match: { status: "Won" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$dealValue" },
      },
    },
  ]);

  const revenue = revenueResult[0]?.totalRevenue || 0;

  const conversionRate =
    totalLeads === 0 ? 0 : ((wonDeals / totalLeads) * 100).toFixed(2);

  // team performance
  const teamStats = await Lead.aggregate([
    {
      $group: {
        _id: "$assignedTo",
        totalLeads: { $sum: 1 },
        wonDeals: {
          $sum: {
            $cond: [{ $eq: ["$status", "Won"] }, 1, 0],
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        name: "$user.name",
        totalLeads: 1,
        wonDeals: 1,
        conversionRate: {
          $cond: [
            { $eq: ["$totalLeads", 0] },
            0,
            {
              $multiply: [
                { $divide: ["$wonDeals", "$totalLeads"] },
                100,
              ],
            },
          ],
        },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalLeads,
      wonDeals,
      lostDeals,
      revenue,
      conversionRate,
      teamStats,
    })
  );
});