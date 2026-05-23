import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Leads", to: "/leads" },
];

const Sidebar = () => {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-white/10 bg-zinc-950 p-6 md:block">
      <h2 className="mb-10 text-xl font-black">
        BDA<span className="text-emerald-300">CRM</span>
      </h2>

      <nav className="grid gap-2">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-emerald-300 text-zinc-950"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`
            }
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
