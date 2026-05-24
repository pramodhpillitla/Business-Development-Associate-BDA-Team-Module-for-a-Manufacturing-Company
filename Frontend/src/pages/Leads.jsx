import { useEffect, useMemo, useState } from "react";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";

import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import CreateLeadModal from "../components/leads/CreateLeadModal";
import KanbanColumn from "../components/leads/KanbanColumn";
import LeadDrawer from "../components/leads/LeadDrawer";
import PageWrapper from "../components/layout/PageWrapper";
import { useAuth } from "../context/useAuth";
import { useSocket } from "../context/useSocket";
import API from "../services/api";

const statusLabels = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const Leads = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    revenueRange: "",
    sortBy: "createdAt",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    let shouldIgnore = false;

    const fetchLeads = async () => {
      setLoading(true);
      try {
        const [minDealValue, maxDealValue] = filters.revenueRange ? filters.revenueRange.split("-") : [undefined, undefined];

        const response = await API.get("/leads", {
          params: {
            limit: 100,
            search: debouncedSearch || undefined,
            status: filters.status || undefined,
            minDealValue: minDealValue || undefined,
            maxDealValue: maxDealValue || undefined,
            sortBy: filters.sortBy,
            sortOrder: "desc"
          },
        });

        if (!shouldIgnore) {
          setLeads(response.data.data.leads || []);
          setError("");
        }
      } catch (leadError) {
        if (!shouldIgnore) {
          setError(
            leadError.response?.data?.message || "Unable to load leads."
          );
        }
      } finally {
        if (!shouldIgnore) {
          setLoading(false);
        }
      }
    };

    fetchLeads();

    return () => {
      shouldIgnore = true;
    };
  }, [debouncedSearch, filters]);

  useEffect(() => {
    if (!socket) return;

    const handleLeadCreated = (newLead) => {
      setLeads((currentLeads) => {
        if (currentLeads.some((l) => l._id === newLead._id)) return currentLeads;
        return [newLead, ...currentLeads];
      });
    };

    const handleLeadUpdated = (updatedLead) => {
      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead._id === updatedLead._id ? updatedLead : lead
        )
      );

      setSelectedLead((currentLead) =>
        currentLead?._id === updatedLead._id ? updatedLead : currentLead
      );
    };

    const handleLeadDeleted = (deletedId) => {
      setLeads((currentLeads) => currentLeads.filter((l) => l._id !== deletedId));
      setSelectedLead((current) => (current?._id === deletedId ? null : current));
    };

    socket.on("lead:created", handleLeadCreated);
    socket.on("lead:updated", handleLeadUpdated);
    socket.on("lead:deleted", handleLeadDeleted);

    return () => {
      socket.off("lead:created", handleLeadCreated);
      socket.off("lead:updated", handleLeadUpdated);
      socket.off("lead:deleted", handleLeadDeleted);
    };
  }, [socket]);

  const leadsByStatus = useMemo(() => {
    const columnsToRender = filters.status ? [filters.status] : statusLabels;

    return columnsToRender.map((status) => ({
      status,
      leads: leads.filter((lead) => lead.status === status),
    }));
  }, [leads, filters.status]);

  const updateLeadInState = (updatedLead) => {
    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead._id === updatedLead._id ? updatedLead : lead
      )
    );

    setSelectedLead((currentLead) =>
      currentLead?._id === updatedLead._id ? updatedLead : currentLead
    );
  };

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const leadId = active.id;
    const newStatus = over.id;
    const lead = active.data.current?.lead;

    if (!lead || lead.status === newStatus) return;

    const isEditable = user?.role === "admin" || lead.assignedTo?._id === user?._id;
    if (!isEditable) {
      setError("You do not have permission to move this lead.");
      return;
    }

    const previousLeads = leads;

    setLeads((currentLeads) =>
      currentLeads.map((currentLead) =>
        currentLead._id === leadId ? { ...currentLead, status: newStatus } : currentLead
      )
    );

    try {
      const response = await API.patch(`/leads/${leadId}/status`, { status: newStatus });
      updateLeadInState(response.data.data);
    } catch (statusError) {
      setLeads(previousLeads);
      setError(
        statusError.response?.data?.message || "Unable to update lead status."
      );
    }
  };

  const handleCreateLead = async (payload) => {
    const response = await API.post("/leads", {
      ...payload,
      assignedTo: user._id,
    });

    setLeads((currentLeads) => {
      if (currentLeads.some((l) => l._id === response.data.data._id)) {
        return currentLeads;
      }
      return [response.data.data, ...currentLeads];
    });
    setShowCreateModal(false);
  };

  return (
    <PageWrapper>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
            Pipeline
          </p>
          <h1 className="mt-2 text-3xl font-black">Lead Pipeline</h1>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <input
            className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-emerald-300 md:w-64"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads or companies..."
            type="search"
            value={search}
          />
          <select
            className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-emerald-300"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Stages</option>
            {statusLabels.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-emerald-300"
            value={filters.revenueRange}
            onChange={(e) => setFilters({ ...filters, revenueRange: e.target.value })}
          >
            <option value="">All Revenue</option>
            <option value="0-10000">Under $10k</option>
            <option value="10000-50000">$10k - $50k</option>
            <option value="50000-">Over $50k</option>
          </select>
          <select
            className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-emerald-300"
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="createdAt">Latest</option>
            <option value="dealValue">Highest Value</option>
          </select>
          <button
            className="h-11 whitespace-nowrap rounded-lg bg-emerald-300 px-4 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
            onClick={() => setShowCreateModal(true)}
            type="button"
          >
            New Lead
          </button>
        </div>
      </div>

      {loading ? <Loader label="Loading leads..." /> : null}

      {!loading && error ? (
        <div className="mb-4">
          <EmptyState title="Pipeline notice" message={error} />
        </div>
      ) : null}

      {!loading ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {leadsByStatus.map((column) => (
              <KanbanColumn
                key={column.status}
                leads={column.leads}
                onCardClick={setSelectedLead}
                status={column.status}
              />
            ))}
          </div>
        </DndContext>
      ) : null}

      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />

      {showCreateModal ? (
        <CreateLeadModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateLead}
        />
      ) : null}
    </PageWrapper>
  );
};

export default Leads;
