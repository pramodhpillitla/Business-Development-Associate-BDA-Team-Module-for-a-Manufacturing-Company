import { useEffect, useState } from "react";
import API from "../../services/api";
import Loader from "../common/Loader";

const PriorityIcon = ({ priority }) => {
  if (priority === "high") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
        ★
      </span>
    );
  }
  if (priority === "low") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20 text-red-400">
        !
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
      i
    </span>
  );
};

const InsightsPanel = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let shouldIgnore = false;
    const fetchInsights = async () => {
      try {
        const res = await API.get("/insights");
        if (!shouldIgnore) {
          setInsights(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        if (!shouldIgnore) setLoading(false);
      }
    };
    fetchInsights();
    return () => {
      shouldIgnore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/5 bg-zinc-900/50 p-6 shadow-sm mt-5">
        <Loader label="Generating AI Insights..." />
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-6 shadow-sm mt-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <span>✨</span> AI Deal Insights
        </h3>
        <span className="text-xs text-zinc-500">Auto-generated</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <article
            key={insight.leadId}
            className="rounded-lg border border-white/5 bg-zinc-950/50 p-4 transition hover:bg-zinc-900/80"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <PriorityIcon priority={insight.priority} />
                <h4 className="text-sm font-semibold text-zinc-200 line-clamp-1">
                  {insight.leadName}
                </h4>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-zinc-300">
                  {insight.probability}%
                </span>
                <span className="block text-[10px] text-zinc-500 uppercase">
                  Prob
                </span>
              </div>
            </div>
            
            <p className="mb-2 text-xs font-medium text-emerald-300/80">
              {insight.title}
            </p>
            
            <div className="rounded bg-black/20 p-2 border border-white/5">
              <p className="text-xs leading-relaxed text-zinc-400">
                {insight.suggestion}
              </p>
            </div>
            
            <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-500">
              <span>{insight.company}</span>
              <span>{insight.assignedTo}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
