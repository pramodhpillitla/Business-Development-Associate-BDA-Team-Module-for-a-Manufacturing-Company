const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);
};

const TeamTable = ({ members = [] }) => {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-5">
      <div className="mb-5">
        <p className="text-sm text-zinc-400">BDA Team</p>
        <h2 className="text-xl font-black">Performance Metrics</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-zinc-500">
            <tr className="border-b border-white/10">
              <th className="pb-3 pr-4">BDA</th>
              <th className="pb-3 pr-4">Total</th>
              <th className="pb-3 pr-4">Active</th>
              <th className="pb-3 pr-4">Won</th>
              <th className="pb-3 pr-4">Lost</th>
              <th className="pb-3 pr-4">Revenue</th>
              <th className="pb-3 pr-4">Pipeline</th>
              <th className="pb-3">Conversion</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr className="border-b border-white/5" key={member.userId}>
                <td className="py-4 pr-4">
                  <p className="font-bold">{member.name}</p>
                  <p className="text-xs text-zinc-500">{member.email}</p>
                </td>
                <td className="py-4 pr-4">{member.totalLeads}</td>
                <td className="py-4 pr-4">{member.activeLeads}</td>
                <td className="py-4 pr-4 text-emerald-300">{member.wonDeals}</td>
                <td className="py-4 pr-4 text-red-200">{member.lostDeals}</td>
                <td className="py-4 pr-4">{formatCurrency(member.revenue)}</td>
                <td className="py-4 pr-4">
                  {formatCurrency(member.pipelineValue)}
                </td>
                <td className="py-4">{member.conversionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!members.length ? (
          <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-zinc-500">
            No team performance data yet.
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default TeamTable;
