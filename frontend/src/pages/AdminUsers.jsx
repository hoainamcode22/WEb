import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminSidebar from "../components/AdminSidebar";
import StatusBadge from "../components/StatusBadge";
import { getAdminUsers } from "../services/api";
import { formatDateTimeVN } from "../utils/format";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAdminUsers();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const regular = total - admins;
    return { total, admins, regular };
  }, [users]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.username || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q) ||
        String(u.id).includes(q)
    );
  }, [users, search]);

  return (
    <div>
      <Navbar />

      <div className="container page-section admin-page-layout">
        <AdminSidebar />

        <div className="admin-page-main">
          <div className="match-page-head">
            <div>
              <span className="page-badge">👥 Quản lý người dùng</span>
              <h1 className="section-title" style={{ marginTop: "10px" }}>Quản lý người dùng</h1>
              <p className="section-subtitle">
                Theo dõi danh sách tài khoản đã đăng ký trong hệ thống.
              </p>
            </div>
          </div>

          <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            <div className="admin-stat-card admin-stat-purple">
              <div className="admin-stat-icon">👥</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Tổng người dùng</span>
                <strong className="admin-stat-value">{stats.total}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-blue">
              <div className="admin-stat-icon">👤</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Người dùng thường</span>
                <strong className="admin-stat-value">{stats.regular}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-orange">
              <div className="admin-stat-icon">🛡️</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Quản trị viên</span>
                <strong className="admin-stat-value">{stats.admins}</strong>
              </div>
            </div>
          </div>

          <div className="match-toolbar" style={{ marginBottom: "18px" }}>
            <div className="match-search-box">
              <input
                type="text"
                placeholder="🔍 Tìm theo tên, email, vai trò..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu người dùng...</p>
            </div>
          )}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-box">
              {search ? "Không tìm thấy người dùng phù hợp." : "Hiện chưa có người dùng nào."}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="table-wrap">
              <div className="table-wrap-header">
                <h3>Danh sách người dùng ({filtered.length})</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên đăng nhập</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Player ID</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id}>
                      <td><strong>#{user.id}</strong></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "50%",
                            background: "linear-gradient(135deg,#22c55e,#16944c)",
                            color: "white", fontWeight: 900, fontSize: "13px",
                            display: "grid", placeItems: "center", flexShrink: 0
                          }}>
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                          {user.username}
                        </div>
                      </td>
                      <td>{user.email || "—"}</td>
                      <td>{user.phone || "—"}</td>
                      <td><StatusBadge status={user.role} /></td>
                      <td>{user.player_id || "—"}</td>
                      <td>{formatDateTimeVN(user.created_at) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminUsers;
