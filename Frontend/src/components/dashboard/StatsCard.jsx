const StatsCard = ({ title, value, helper }) => {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-zinc-400">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-emerald-300">{value}</h2>
      {helper ? <p className="mt-2 text-xs text-zinc-500">{helper}</p> : null}
    </article>
  );
};

export default StatsCard;
