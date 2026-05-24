import { LEAD_STATUSES, Lead } from "../models/Lead.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ACTIVE_STATUSES = LEAD_STATUSES.filter(
  (status) => !["Won", "Lost"].includes(status)
);

const roundToTwo = (value) => {
  return Number((value || 0).toFixed(2));
};

export const getDashboardSummary = asyncHandler(async (_req, res) => {
  const [
    totalLeads,
    wonDeals,
    lostDeals,
    activeLeads,
    revenueResult,
    pipelineResult,
    averageDealResult,
    statusStats,
    teamStats,
    recentLeads,
    revenueOverTimeRaw,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: "Won" }),
    Lead.countDocuments({ status: "Lost" }),
    Lead.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
    Lead.aggregate([
      { $match: { status: "Won" } },
      { $group: { _id: null, totalRevenue: { $sum: "$dealValue" } } },
    ]),
    Lead.aggregate([
      { $match: { status: { $in: ACTIVE_STATUSES } } },
      { $group: { _id: null, pipelineValue: { $sum: "$dealValue" } } },
    ]),
    Lead.aggregate([
      { $group: { _id: null, averageDealValue: { $avg: "$dealValue" } } },
    ]),
    Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          value: { $sum: "$dealValue" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Lead.aggregate([
      {
        $group: {
          _id: "$assignedTo",
          totalLeads: { $sum: 1 },
          activeLeads: {
            $sum: {
              $cond: [{ $in: ["$status", ACTIVE_STATUSES] }, 1, 0],
            },
          },
          wonDeals: {
            $sum: {
              $cond: [{ $eq: ["$status", "Won"] }, 1, 0],
            },
          },
          lostDeals: {
            $sum: {
              $cond: [{ $eq: ["$status", "Lost"] }, 1, 0],
            },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "Won"] }, "$dealValue", 0],
            },
          },
          pipelineValue: {
            $sum: {
              $cond: [{ $in: ["$status", ACTIVE_STATUSES] }, "$dealValue", 0],
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
          email: "$user.email",
          role: "$user.role",
          totalLeads: 1,
          activeLeads: 1,
          wonDeals: 1,
          lostDeals: 1,
          revenue: 1,
          pipelineValue: 1,
          conversionRate: {
            $cond: [
              { $eq: ["$totalLeads", 0] },
              0,
              { $multiply: [{ $divide: ["$wonDeals", "$totalLeads"] }, 100] },
            ],
          },
        },
      },
      { $sort: { revenue: -1, wonDeals: -1, totalLeads: -1 } },
    ]),
    Lead.find()
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name company status dealValue assignedTo createdAt"),
    Lead.aggregate([
      { $match: { status: "Won" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: { $ifNull: ["$closedAt", "$updatedAt"] } } },
          revenue: { $sum: "$dealValue" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
  ]);

  const revenue = revenueResult[0]?.totalRevenue || 0;
  const pipelineValue = pipelineResult[0]?.pipelineValue || 0;
  const averageDealValue = averageDealResult[0]?.averageDealValue || 0;
  const conversionRate =
    totalLeads === 0 ? 0 : roundToTwo((wonDeals / totalLeads) * 100);
  const lossRate =
    totalLeads === 0 ? 0 : roundToTwo((lostDeals / totalLeads) * 100);

  const statusMap = new Map(
    statusStats.map((status) => [
      status._id,
      {
        status: status._id,
        count: status.count,
        value: status.value,
      },
    ])
  );

  const pipelineByStatus = LEAD_STATUSES.map((status) => {
    return statusMap.get(status) || { status, count: 0, value: 0 };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalLeads,
        activeLeads,
        wonDeals,
        lostDeals,
        revenue,
        pipelineValue,
        averageDealValue: roundToTwo(averageDealValue),
        conversionRate,
        lossRate,
        pipelineByStatus,
        revenueOverTime: revenueOverTimeRaw.map((item) => ({
          month: item._id,
          revenue: item.revenue,
        })),
        teamStats: teamStats.map((member) => ({
          ...member,
          conversionRate: roundToTwo(member.conversionRate),
        })),
        recentLeads,
      },
      "Dashboard summary fetched successfully"
    )
  );
});
