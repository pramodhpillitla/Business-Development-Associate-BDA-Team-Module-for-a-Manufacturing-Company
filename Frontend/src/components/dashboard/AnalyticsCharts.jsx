import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatCurrency = (value) => {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-zinc-900 p-3 shadow-xl">
        <p className="mb-1 text-sm font-semibold text-zinc-300">{label}</p>
        <p className="text-sm text-emerald-400 font-bold">
          {payload[0].name === "revenue"
            ? new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(payload[0].value)
            : payload[0].value + " Leads"}
        </p>
      </div>
    );
  }
  return null;
};

const AnalyticsCharts = ({ revenueData = [], pipelineData = [] }) => {
  return (
    <div className="grid gap-5 xl:grid-cols-2 mt-5">
      {/* Revenue Over Time Line Chart */}
      <div className="rounded-xl border border-white/5 bg-white/5 p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
          Revenue Over Time (Won Deals)
        </h3>
        <div className="h-64 w-full">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={formatCurrency}
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              No revenue data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Conversion Funnel Bar Chart */}
      <div className="rounded-xl border border-white/5 bg-white/5 p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
          Conversion Pipeline (Leads per Stage)
        </h3>
        <div className="h-64 w-full">
          {pipelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="status" 
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#ffffff50" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                <Bar 
                  dataKey="count" 
                  fill="#60a5fa" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              No pipeline data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
