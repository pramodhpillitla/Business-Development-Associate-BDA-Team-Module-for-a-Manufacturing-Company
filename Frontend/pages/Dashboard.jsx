import { useEffect, useState } from "react";
import API from "../services/api";
import PageWrapper from "../components/layout/PageWrapper";
import StatsCard from "../components/dashboard/StatsCard";

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/dashboard/summary").then((res) => {
      setData(res.data.data);
    });
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <PageWrapper>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatsCard title="Total Leads" value={data.totalLeads} />
        <StatsCard title="Revenue" value={`₹ ${data.revenue}`} />
        <StatsCard title="Won Deals" value={data.wonDeals} />
        <StatsCard title="Conversion %" value={data.conversionRate} />
      </div>
    </PageWrapper>
  );
};

export default Dashboard;