import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const PageWrapper = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Navbar />
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default PageWrapper;
