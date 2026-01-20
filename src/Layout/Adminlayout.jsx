import { Outlet } from "react-router-dom"; // ✅ FIXED
import Sidebar from "../component/Sidebar";
import Nav from "../component/Nav";

function Adminlayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-50">
        <Nav />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Adminlayout;
