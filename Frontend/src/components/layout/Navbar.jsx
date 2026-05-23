import { useAuth } from "../../context/useAuth";

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-white/10 bg-zinc-950/95 px-5 backdrop-blur">
      <div>
        <p className="text-xs text-zinc-500">Logged in as</p>
        <h2 className="font-semibold">{user?.name || "BDA User"}</h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-zinc-300">
          {user?.role || "bda"}
        </span>
        <button
          className="rounded-lg bg-emerald-300 px-4 py-2 text-sm font-bold text-zinc-950"
          onClick={logout}
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
