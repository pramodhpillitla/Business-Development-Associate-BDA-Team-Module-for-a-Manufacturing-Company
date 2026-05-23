const StatsCard = ({ title, value }) => {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-zinc-400">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-emerald-300">{value}</h2>
    </article>
  );
};

export default StatsCard;
