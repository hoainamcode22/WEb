import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminSidebar from "../components/AdminSidebar";
import StatusBadge from "../components/StatusBadge";
import { getAdminFields } from "../services/api";

function AdminFields() {
  const [fields, setFields] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await getAdminFields();
        setFields(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  const stats = useMemo(() => {
    const total = fields.length;
    const available = fields.filter(
      (f) => String(f.status).toLowerCase() === "available"
    ).length;
    const unavailable = total - available;
    return { total, available, unavailable };
  }, [fields]);

  const filtered = useMemo(() => {
    if (!search.trim()) return fields;
    const q = search.toLowerCase();
    return fields.filter(
      (f) =>
        (f.name || "").toLowerCase().includes(q) ||
        (f.location || "").toLowerCase().includes(q) ||
        (f.status || "").toLowerCase().includes(q)
    );
  }, [fields, search]);

  return (
    <div>
      <Navbar />

      <div className="container page-section admin-page-layout">
        <AdminSidebar />

        <div className="admin-page-main">
          <div className="match-page-head">
            <div>
              <span className="page-badge">🏟️ Quản lý sân bóng</span>
              <h1 className="section-title" style={{ marginTop: "10px" }}>Quản lý sân bóng</h1>
              <p className="section-subtitle">
                Theo dõi danh sách sân bóng hiện có trong hệ thống.
              </p>
            </div>
          </div>

          <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            <div className="admin-stat-card admin-stat-green">
              <div className="admin-stat-icon">🏟️</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Tổng sân bóng</span>
                <strong className="admin-stat-value">{stats.total}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-blue">
              <div className="admin-stat-icon">✅</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Sân còn trống</span>
                <strong className="admin-stat-value">{stats.available}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-orange">
              <div className="admin-stat-icon">🔒</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Không khả dụng</span>
                <strong className="admin-stat-value">{stats.unavailable}</strong>
              </div>
            </div>
          </div>

          <div className="match-toolbar" style={{ marginBottom: "18px" }}>
            <div className="match-search-box">
              <input
                type="text"
                placeholder="🔍 Tìm theo tên sân, khu vực, trạng thái..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu sân bóng...</p>
            </div>
          )}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-box">
              {search ? "Không tìm thấy sân phù hợp." : "Hiện chưa có sân bóng nào trong hệ thống."}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="table-wrap">
              <div className="table-wrap-header">
                <h3>Danh sách sân bóng ({filtered.length})</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên sân</th>
                    <th>Giá / giờ</th>
                    <th>Khu vực</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((field) => (
                    <tr key={field.id}>
                      <td><strong>#{field.id}</strong></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "20px" }}>🏟️</span>
                          <span style={{ fontWeight: 700 }}>{field.name}</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: "#16944c" }}>
                          {Number(field.price || 0).toLocaleString("vi-VN")} VNĐ
                        </strong>
                      </td>
                      <td>📍 {field.location || "—"}</td>
                      <td><StatusBadge status={field.status} /></td>
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

export default AdminFields;
