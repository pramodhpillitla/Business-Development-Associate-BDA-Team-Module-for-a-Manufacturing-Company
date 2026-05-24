import { useEffect, useMemo, useState } from "react";

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
  const [dragTarget, setDragTarget] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    let shouldIgnore = false;

    const fetchLeads = async () => {
      try {
        const response = await API.get("/leads", {
          params: {
            limit: 100,
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
  }, []);

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

  const filteredLeads = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return leads;

    return leads.filter((lead) => {
      return [lead.name, lead.company, lead.contactInfo]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [leads, search]);

  const leadsByStatus = useMemo(() => {
    return statusLabels.map((status) => ({
      status,
      leads: filteredLeads.filter((lead) => lead.status === status),
    }));
  }, [filteredLeads]);

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

  const handleDragStart = (event, lead) => {
    event.dataTransfer.setData("leadId", lead._id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event, status) => {
    event.preventDefault();
    setDragTarget(status);
  };

  const handleDrop = async (event, status) => {
    event.preventDefault();
    setDragTarget("");

    const leadId = event.dataTransfer.getData("leadId");
    const lead = leads.find((currentLead) => currentLead._id === leadId);

    if (!lead || lead.status === status) return;

    const previousLeads = leads;

    setLeads((currentLeads) =>
      currentLeads.map((currentLead) =>
        currentLead._id === leadId ? { ...currentLead, status } : currentLead
      )
    );

    try {
      const response = await API.patch(`/leads/${leadId}/status`, { status });
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

    setLeads((currentLeads) => [response.data.data, ...currentLeads]);
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-emerald-300 md:w-80"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads or companies"
            type="search"
            value={search}
          />
          <button
            className="h-11 rounded-lg bg-emerald-300 px-4 font-bold text-zinc-950"
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
        <div className="grid gap-4 overflow-x-auto pb-4 xl:grid-cols-7">
          {leadsByStatus.map((column) => (
            <KanbanColumn
              isDragTarget={dragTarget === column.status}
              key={column.status}
              leads={column.leads}
              onCardClick={setSelectedLead}
              onDragOver={(event) => handleDragOver(event, column.status)}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              status={column.status}
            />
          ))}
        </div>
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
