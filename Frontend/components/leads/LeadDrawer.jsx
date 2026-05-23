import { useEffect, useState } from "react";
import API from "../../services/api";

const LeadDrawer = ({ lead, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (lead) {
      fetchActivities();
    }
  }, [lead]);

  const fetchActivities = async () => {
    const res = await API.get(`/leads/${lead._id}/activities`);
    setActivities(res.data.data);
  };

  const handleAddActivity = async () => {
    if (!message.trim()) return;

    await API.post(`/leads/${lead._id}/activities`, {
      message,
      type: "note",
    });

    setMessage("");
    fetchActivities();
  };

  if (!lead) return null;

  return (
    <div className="fixed top-0 right-0 w-[400px] h-full bg-black border-l border-white/10 p-6 z-50 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{lead.name}</h2>
        <button onClick={onClose}>Close</button>
      </div>

      {/* Lead Info */}
      <div className="mb-6 text-sm text-gray-400">
        <p>{lead.company}</p>
        <p>₹ {lead.dealValue}</p>
      </div>

      {/* Add Activity */}
      <div className="mb-6">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add note..."
          className="w-full p-2 bg-white/5 border border-white/10 rounded"
        />
        <button
          onClick={handleAddActivity}
          className="mt-2 px-4 py-1 bg-[#2EFFA9] text-black rounded"
        >
          Add
        </button>
      </div>

      {/* Activity Timeline */}
      <div>
        <h3 className="text-sm text-gray-500 mb-4">Activity</h3>

        {activities.map((act) => (
          <div key={act._id} className="mb-4 border-b border-white/10 pb-2">
            <p className="text-sm">{act.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(act.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadDrawer;