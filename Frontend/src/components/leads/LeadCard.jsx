const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);
};

const LeadCard = ({ lead, onClick, onDragStart }) => {
  return (
    <article
      className="rounded-lg border border-white/10 bg-zinc-950 p-3 shadow-lg transition hover:border-emerald-300/60"
      draggable
      onClick={() => onClick(lead)}
      onDragStart={(event) => onDragStart(event, lead)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold leading-tight">{lead.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">{lead.company}</p>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
          {lead.status}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="text-sm font-black text-emerald-300">
          {formatCurrency(lead.dealValue)}
        </p>
        <p className="truncate text-xs text-zinc-500">
          {lead.assignedTo?.name || "Unassigned"}
        </p>
      </div>
    </article>
  );
};

export default LeadCard;
