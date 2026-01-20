import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
