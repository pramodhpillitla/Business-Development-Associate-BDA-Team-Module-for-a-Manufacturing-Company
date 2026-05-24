import { useEffect, useState } from "react";

import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";
import InsightsPanel from "../components/dashboard/InsightsPanel";
import RecentLeads from "../components/dashboard/RecentLeads";
import StatsCard from "../components/dashboard/StatsCard";
import StatusBreakdown from "../components/dashboard/StatusBreakdown";
import TeamTable from "../components/dashboard/TeamTable";
import PageWrapper from "../components/layout/PageWrapper";
import API from "../services/api";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let shouldIgnore = false;

    const fetchSummary = async () => {
      try {
        const response = await API.get("/metrics");

        if (!shouldIgnore) {
          setData(response.data.data);
          setError("");
        }
      } catch (summaryError) {
        if (!shouldIgnore) {
          setError(
            summaryError.response?.data?.message ||
              "Unable to load dashboard summary."
          );
        }
      } finally {
        if (!shouldIgnore) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      shouldIgnore = true;
    };
  }, []);

  return (
    <PageWrapper>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
      </div>

      {loading ? <Loader label="Loading dashboard..." /> : null}

      {!loading && error ? (
        <EmptyState title="Dashboard unavailable" message={error} />
      ) : null}

      {!loading && data ? (
        <div className="grid gap-5">
          <InsightsPanel />
          
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-2">
            <StatsCard
              helper={`${data.activeLeads ?? 0} active opportunities`}
              title="Total Leads"
              value={data.totalLeads ?? 0}
            />
            <StatsCard
              helper="Closed won deal value"
              title="Revenue"
              value={formatCurrency(data.revenue)}
            />
            <StatsCard
              helper="Open deal value"
              title="Pipeline Value"
              value={formatCurrency(data.pipelineValue)}
            />
            <StatsCard
              helper="Average across all leads"
              title="Average Deal"
              value={formatCurrency(data.averageDealValue)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              helper={`${data.wonDeals ?? 0} won deals`}
              title="Conversion Rate"
              value={`${data.conversionRate ?? 0}%`}
            />
            <StatsCard
              helper={`${data.lostDeals ?? 0} lost deals`}
              title="Loss Rate"
              value={`${data.lossRate ?? 0}%`}
            />
            <StatsCard title="Won Deals" value={data.wonDeals ?? 0} />
            <StatsCard title="Lost Deals" value={data.lostDeals ?? 0} />
          </div>

          <AnalyticsCharts 
            revenueData={data.revenueOverTime} 
            pipelineData={data.pipelineByStatus} 
          />

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <StatusBreakdown items={data.pipelineByStatus || []} />
            <RecentLeads leads={data.recentLeads || []} />
          </div>

          <TeamTable members={data.teamStats || []} />
        </div>
      ) : null}
    </PageWrapper>
  );
};

export default Dashboard;
