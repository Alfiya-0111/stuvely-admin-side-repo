import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import User from "./pages/User";

import Adminlayout from "./Layout/Adminlayout";
import AdminProtectedRoute from "./utils/AdminProtectedRoute";

import AdminCollections from "./pages/AdminCollections";
import OfferSlider from "./pages/OfferSlider";
import BestDealsAdmin from "./pages/BestDealsAdmin";
import Carproduct from "./pages/Carproduct";
import Keychainsproduts from "./pages/Keychainsproduts";
import AdminFooterEditor from "./pages/AdminFooterEditor";
import AdminOrders from "./pages/AdminOrders";
import AdminReviews from "./pages/AdminReviews";
import ImgUrl from "./pages/ImgUrl";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ===== ADMIN ROUTES ===== */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <Adminlayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<User />} />
          <Route path="imgurl" element={<ImgUrl />} />
          <Route path="offerslider" element={<OfferSlider />} />
          <Route path="ourcollection" element={<AdminCollections />} />
          <Route path="bestdeals" element={<BestDealsAdmin />} />
          <Route path="cars" element={<Carproduct />} />
          <Route path="keychains" element={<Keychainsproduts />} />
          <Route path="order" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="adminfooter" element={<AdminFooterEditor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
