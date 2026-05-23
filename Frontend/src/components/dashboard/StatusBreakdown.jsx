const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);
};

const StatusBreakdown = ({ items = [] }) => {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <section className="rounded-lg border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">Pipeline</p>
          <h2 className="text-xl font-black">Status Breakdown</h2>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.status}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold">{item.status}</span>
              <span className="text-zinc-400">
                {item.count} leads · {formatCurrency(item.value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-300"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatusBreakdown;
