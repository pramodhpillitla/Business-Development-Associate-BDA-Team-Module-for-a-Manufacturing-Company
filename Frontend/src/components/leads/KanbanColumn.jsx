import LeadCard from "./LeadCard";

const KanbanColumn = ({
  isDragTarget,
  leads,
  onCardClick,
  onDragOver,
  onDragStart,
  onDrop,
  status,
}) => {
  return (
    <section
      className={`min-h-80 rounded-lg border p-3 transition ${
        isDragTarget
          ? "border-emerald-300 bg-emerald-300/10"
          : "border-white/10 bg-white/5"
      }`}
      onDragOver={onDragOver}
      onDrop={(event) => onDrop(event, status)}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold">{status}</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
          {leads.length}
        </span>
      </div>

      <div className="grid gap-3">
        {leads.map((lead) => (
          <LeadCard
            key={lead._id}
            lead={lead}
            onClick={onCardClick}
            onDragStart={onDragStart}
          />
        ))}

        {!leads.length ? (
          <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-zinc-500">
            Drop leads here
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default KanbanColumn;
