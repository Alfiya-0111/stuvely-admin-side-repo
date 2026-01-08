import { Outlet } from "react-router";
import Sidebar from '../component/Sidebar';
import Nav from '../component/Nav';

function Adminlayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top Navbar */}
        <Nav />

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Adminlayout;
