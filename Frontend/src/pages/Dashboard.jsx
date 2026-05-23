import { useEffect, useState } from "react";

import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import StatsCard from "../components/dashboard/StatsCard";
import PageWrapper from "../components/layout/PageWrapper";
import API from "../services/api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await API.get("/dashboard/summary");
        setData(response.data.data);
      } catch (summaryError) {
        setError(
          summaryError.response?.data?.message ||
            "Unable to load dashboard summary."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard title="Total Leads" value={data.totalLeads ?? 0} />
          <StatsCard title="Revenue" value={`Rs. ${data.revenue ?? 0}`} />
          <StatsCard title="Won Deals" value={data.wonDeals ?? 0} />
          <StatsCard title="Conversion %" value={data.conversionRate ?? 0} />
        </div>
      ) : null}
    </PageWrapper>
  );
};

export default Dashboard;
