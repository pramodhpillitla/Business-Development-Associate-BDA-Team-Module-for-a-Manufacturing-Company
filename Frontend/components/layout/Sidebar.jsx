import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-black border-r border-white/10 p-6 hidden md:block">
      <h2 className="text-xl font-bold text-white mb-10">
        BDA<span className="text-[#2EFFA9]">CRM</span>
      </h2>

      <nav className="flex flex-col gap-4 text-sm">
        <Link to="/dashboard" className="hover:text-[#2EFFA9]">
          Dashboard
        </Link>
        <Link to="/leads" className="hover:text-[#2EFFA9]">
          Leads
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;