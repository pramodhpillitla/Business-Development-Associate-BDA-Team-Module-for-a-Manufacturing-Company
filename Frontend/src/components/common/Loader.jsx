const Loader = ({ label = "Loading..." }) => {
  return (
    <div className="grid min-h-48 place-items-center rounded-lg border border-white/10 bg-white/5 text-zinc-300">
      {label}
    </div>
  );
};

export default Loader;
