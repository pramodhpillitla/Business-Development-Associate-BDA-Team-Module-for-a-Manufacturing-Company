import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value || 0);
};

const LeadCard = ({ lead, onClick, isEditable = true }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead._id,
    data: { lead },
    disabled: !isEditable,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 100 : "auto",
        opacity: isDragging ? 0.8 : 1,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-lg border bg-zinc-950 p-3 shadow-lg transition ${
        isEditable ? "cursor-grab hover:border-emerald-300/60 active:cursor-grabbing" : "cursor-not-allowed opacity-75"
      } ${
        isDragging ? "border-emerald-300" : "border-white/10"
      }`}
      onClick={() => onClick(lead)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold leading-tight flex items-center gap-2">
            {!isEditable && <span title="Assigned to another representative" className="text-[10px]">🔒</span>}
            {lead.name}
          </h3>
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
