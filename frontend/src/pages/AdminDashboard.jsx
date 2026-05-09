import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminSidebar from "../components/AdminSidebar";
import {
  getAdminBookings,
  getAdminUsers,
  getAdminFields,
  getAdminMatches,
} from "../services/api";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [fields, setFields] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [b, u, f, m] = await Promise.all([
          getAdminBookings(),
          getAdminUsers(),
          getAdminFields(),
          getAdminMatches(),
        ]);
        setBookings(b);
        setUsers(u);
        setFields(f);
        setMatches(m);
      } catch (err) {
        console.error("Lỗi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = useMemo(() => {
    const pendingBookings = bookings.filter(
      (b) => String(b.status).toLowerCase() === "pending"
    ).length;
    const confirmedBookings = bookings.filter(
      (b) => String(b.status).toLowerCase() === "confirmed"
    ).length;
    const availableFields = fields.filter(
      (f) => String(f.status).toLowerCase() === "available"
    ).length;
    const adminUsers = users.filter((u) => u.role === "admin").length;

    return { pendingBookings, confirmedBookings, availableFields, adminUsers };
  }, [bookings, users, fields]);

  const recentBookings = bookings.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  return (
    <div>
      <Navbar />

      <div className="container page-section admin-page-layout">
        <AdminSidebar />

        <div className="admin-page-main">
          <div className="match-page-head">
            <div>
              <span className="hero-badge">Khu vực quản trị</span>
              <h1 className="section-title">Dashboard tổng quan</h1>
              <p className="section-subtitle">
                Theo dõi tổng quan hệ thống: sân bóng, booking, người dùng và trận đấu.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu dashboard...</p>
            </div>
          ) : (
            <>
              <div className="admin-stat-grid">
                <div className="admin-stat-card admin-stat-green">
                  <div className="admin-stat-icon">🏟️</div>
                  <div className="admin-stat-body">
                    <span className="admin-stat-label">Tổng sân bóng</span>
                    <strong className="admin-stat-value">{fields.length}</strong>
                    <span className="admin-stat-sub">{stats.availableFields} sân còn trống</span>
                  </div>
                </div>

                <div className="admin-stat-card admin-stat-blue">
                  <div className="admin-stat-icon">📋</div>
                  <div className="admin-stat-body">
                    <span className="admin-stat-label">Tổng booking</span>
                    <strong className="admin-stat-value">{bookings.length}</strong>
                    <span className="admin-stat-sub">{stats.pendingBookings} chờ xác nhận</span>
                  </div>
                </div>

                <div className="admin-stat-card admin-stat-purple">
                  <div className="admin-stat-icon">👥</div>
                  <div className="admin-stat-body">
                    <span className="admin-stat-label">Tổng người dùng</span>
                    <strong className="admin-stat-value">{users.length}</strong>
                    <span className="admin-stat-sub">{stats.adminUsers} quản trị viên</span>
                  </div>
                </div>

                <div className="admin-stat-card admin-stat-orange">
                  <div className="admin-stat-icon">⚽</div>
                  <div className="admin-stat-body">
                    <span className="admin-stat-label">Tổng trận đấu</span>
                    <strong className="admin-stat-value">{matches.length}</strong>
                    <span className="admin-stat-sub">{stats.confirmedBookings} booking xác nhận</span>
                  </div>
                </div>
              </div>

              <div className="admin-dashboard-grid">
                <div className="table-wrap">
                  <div className="table-wrap-header">
                    <h3>Booking gần đây</h3>
                    <a href="/admin/bookings" className="table-view-all">Xem tất cả →</a>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Sân</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center", padding: "24px", color: "#66756d" }}>
                            Chưa có booking nào
                          </td>
                        </tr>
                      ) : (
                        recentBookings.map((b) => (
                          <tr key={b.id}>
                            <td>#{b.id}</td>
                            <td>{b.field_name || `Sân #${b.field_id}`}</td>
                            <td>{b.booking_date ? new Date(b.booking_date).toLocaleDateString("vi-VN") : "—"}</td>
                            <td>
                              <span className={`status-badge status-${String(b.status).toLowerCase()}`}>
                                {b.status === "pending" ? "Chờ xác nhận"
                                  : b.status === "confirmed" ? "Đã xác nhận"
                                  : b.status === "cancelled" ? "Đã hủy"
                                  : b.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="table-wrap">
                  <div className="table-wrap-header">
                    <h3>Người dùng mới</h3>
                    <a href="/admin/users" className="table-view-all">Xem tất cả →</a>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Tên đăng nhập</th>
                        <th>Vai trò</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ textAlign: "center", padding: "24px", color: "#66756d" }}>
                            Chưa có người dùng nào
                          </td>
                        </tr>
                      ) : (
                        recentUsers.map((u) => (
                          <tr key={u.id}>
                            <td>#{u.id}</td>
                            <td>{u.username}</td>
                            <td>
                              <span className={`status-badge status-${u.role}`}>
                                {u.role === "admin" ? "Admin" : "Người dùng"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminDashboard;
