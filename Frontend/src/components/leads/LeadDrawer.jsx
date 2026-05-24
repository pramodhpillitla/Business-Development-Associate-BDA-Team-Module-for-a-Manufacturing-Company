import { useEffect, useState } from "react";

import API from "../../services/api";
import { useAuth } from "../../context/useAuth";

const activityTypes = ["note", "call", "email", "meeting"];

const formatDate = (value) => {
  if (!value) return "Not closed";
  return new Date(value).toLocaleString();
};

const LeadDrawer = ({ lead, onClose }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [activityForm, setActivityForm] = useState({
    message: "",
    type: "note",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      if (!lead?._id) return;

      setLoading(true);
      setError("");

      try {
        const response = await API.get(`/leads/${lead._id}/activities`);
        setActivities(response.data.data || []);
      } catch (activityError) {
        setError(
          activityError.response?.data?.message ||
            "Unable to load activities."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [lead]);

  if (!lead) return null;

  const isEditable = user?.role === "admin" || lead.assignedTo?._id === user?._id;

  const handleActivityChange = (event) => {
    const { name, value } = event.target;
    setActivityForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleAddActivity = async (event) => {
    event.preventDefault();

    if (!activityForm.message.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await API.post(`/leads/${lead._id}/activities`, {
        message: activityForm.message,
        type: activityForm.type,
      });

      setActivities((currentActivities) => [
        response.data.data,
        ...currentActivities,
      ]);
      setActivityForm({ message: "", type: "note" });
    } catch (activityError) {
      setError(
        activityError.response?.data?.message || "Unable to add activity."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-full max-w-xl flex-col border-l border-white/10 bg-zinc-950 shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
            Lead Details
          </p>
          <h2 className="mt-1 text-2xl font-black">{lead.name}</h2>
          <p className="mt-1 text-zinc-400">{lead.company}</p>
        </div>
        <button
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="grid gap-5 overflow-y-auto p-5">
        <section className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-zinc-500">Status</p>
              <p className="font-bold">{lead.status}</p>
            </div>
            <div>
              <p className="text-zinc-500">Deal Value</p>
              <p className="font-bold">Rs. {lead.dealValue || 0}</p>
            </div>
            <div>
              <p className="text-zinc-500">Contact</p>
              <p className="font-bold">{lead.contactInfo}</p>
            </div>
            <div>
              <p className="text-zinc-500">Closed At</p>
              <p className="font-bold">{formatDate(lead.closedAt)}</p>
            </div>
          </div>
        </section>

        <form
          className={`rounded-lg border border-white/10 bg-white/5 p-4 ${!isEditable ? "opacity-50" : ""}`}
          onSubmit={handleAddActivity}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold flex items-center gap-2">
              Add Activity
              {!isEditable && <span title="Assigned to another representative" className="text-[10px]">🔒</span>}
            </h3>
            <select
              className="h-9 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none disabled:cursor-not-allowed"
              name="type"
              onChange={handleActivityChange}
              value={activityForm.type}
              disabled={!isEditable}
            >
              {activityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-emerald-300 disabled:cursor-not-allowed"
            name="message"
            onChange={handleActivityChange}
            placeholder={isEditable ? "Log call summary, email update, meeting note..." : "You cannot add activities to a lead assigned to another representative."}
            value={activityForm.message}
            disabled={!isEditable}
          />

          <button
            className="mt-3 h-10 rounded-lg bg-emerald-300 px-4 text-sm font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting || !isEditable}
            type="submit"
          >
            {submitting ? "Saving..." : "Save activity"}
          </button>
        </form>

        <section>
          <h3 className="mb-3 font-bold">Communication Timeline</h3>

          {loading ? <p className="text-sm text-zinc-400">Loading activities...</p> : null}
          {error ? <p className="text-sm text-red-200">{error}</p> : null}

          <div className="grid gap-3">
            {activities.map((activity) => {
              const isSystem = activity.type === "system";

              return (
                <article
                  className={`rounded-lg border p-4 ${
                    isSystem ? "border-zinc-800 bg-transparent" : "border-white/10 bg-white/5"
                  }`}
                  key={activity._id}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        isSystem ? "bg-zinc-900 text-zinc-500 border border-zinc-800" : "bg-zinc-800 text-zinc-300"
                      }`}>
                        {activity.type}
                      </span>
                      {activity.createdBy && (
                        <span className="text-xs text-zinc-500">
                          by <strong className="text-zinc-400">{activity.createdBy.name}</strong>
                        </span>
                      )}
                    </div>
                    <time className="text-xs text-zinc-500">
                      {formatDate(activity.createdAt)}
                    </time>
                  </div>
                  <p className={`text-sm leading-6 ${isSystem ? "text-zinc-400 italic" : "text-zinc-200"}`}>
                    {activity.message}
                  </p>
                </article>
              );
            })}

            {!loading && !activities.length ? (
              <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-zinc-500">
                No activity recorded yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </aside>
  );
};

export default LeadDrawer;
