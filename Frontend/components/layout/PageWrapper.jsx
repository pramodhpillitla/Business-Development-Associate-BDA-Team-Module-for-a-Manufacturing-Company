import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const PageWrapper = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-6 pt-24">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageWrapper;