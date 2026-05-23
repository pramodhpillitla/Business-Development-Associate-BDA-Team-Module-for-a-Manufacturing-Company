const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);
};

const RecentLeads = ({ leads = [] }) => {
  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-5">
      <div className="mb-5">
        <p className="text-sm text-zinc-400">Latest</p>
        <h2 className="text-xl font-black">Recent Leads</h2>
      </div>

      <div className="grid gap-3">
        {leads.map((lead) => (
          <article
            className="rounded-lg border border-white/10 bg-zinc-950 p-4"
            key={lead._id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{lead.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{lead.company}</p>
              </div>
              <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-zinc-300">
                {lead.status}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-emerald-300">
                {formatCurrency(lead.dealValue)}
              </span>
              <span className="text-zinc-500">
                {lead.assignedTo?.name || "Unassigned"}
              </span>
            </div>
          </article>
        ))}

        {!leads.length ? (
          <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-zinc-500">
            No recent leads yet.
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default RecentLeads;
