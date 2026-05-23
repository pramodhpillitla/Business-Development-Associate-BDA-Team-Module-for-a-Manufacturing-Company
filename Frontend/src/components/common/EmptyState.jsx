const EmptyState = ({ title, message }) => {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-8 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-400">{message}</p>
    </div>
  );
};

export default EmptyState;
