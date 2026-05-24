import { useDroppable } from "@dnd-kit/core";
import LeadCard from "./LeadCard";
import { useAuth } from "../../context/useAuth";

const KanbanColumn = ({ leads, onCardClick, status }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });
  const { user } = useAuth();

  return (
    <section
      ref={setNodeRef}
      className={`min-h-80 w-72 shrink-0 snap-start rounded-lg border p-3 transition ${
        isOver
          ? "border-emerald-300 bg-emerald-300/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold">{status}</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
          {leads.length}
        </span>
      </div>

      <div className="grid gap-3">
        {leads.map((lead) => {
          const isEditable = user?.role === "admin" || lead.assignedTo?._id === user?._id;
          
          return (
            <LeadCard
              key={lead._id}
              lead={lead}
              onClick={onCardClick}
              isEditable={isEditable}
            />
          );
        })}

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
