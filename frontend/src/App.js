import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Matches from "./pages/Matches.jsx";
import MatchDetail from "./pages/MatchDetail.jsx";
import Fields from "./pages/Fields.jsx";
import FieldDetail from "./pages/FieldDetail.jsx";
import Booking from "./pages/Booking.jsx";
import MySchedule from "./pages/MySchedule.jsx";
import Profile from "./pages/Profile.jsx";
import AdminBookings from "./pages/AdminBookings.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminFields from "./pages/AdminFields.jsx";
import AdminMatches from "./pages/AdminMatches.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="/fields" element={<Fields />} />
        <Route path="/fields/:id" element={<FieldDetail />} />

        <Route
          path="/booking/:fieldId"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-schedule"
          element={
            <ProtectedRoute>
              <MySchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/fields"
          element={
            <AdminRoute>
              <AdminFields />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/matches"
          element={
            <AdminRoute>
              <AdminMatches />
            </AdminRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;