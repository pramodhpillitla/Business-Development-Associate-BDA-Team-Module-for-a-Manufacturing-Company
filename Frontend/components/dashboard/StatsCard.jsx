const StatsCard = ({ title, value }) => {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
      <p className="text-xs text-gray-400">{title}</p>
      <h2 className="text-2xl font-bold text-[#2EFFA9] mt-2">
        {value}
      </h2>
    </div>
  );
};

export default StatsCard;