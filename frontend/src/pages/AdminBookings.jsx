import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminSidebar from "../components/AdminSidebar";
import StatusBadge from "../components/StatusBadge";
import { getAdminBookings, updateBookingStatus, updateDepositStatus } from "../services/api";
import { formatDateVN, formatTimeVN } from "../utils/format";

const STATUS_FILTERS = [
  { key: "all",       label: "Tất cả" },
  { key: "pending",   label: "⏳ Chờ xác nhận" },
  { key: "confirmed", label: "✅ Đã xác nhận" },
  { key: "completed", label: "🏁 Hoàn thành" },
  { key: "cancelled", label: "❌ Đã hủy" },
  { key: "no_show",   label: "🚫 Không đến" },
];

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      const data = await getAdminBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    no_show:   bookings.filter(b => b.status === "no_show").length,
  }), [bookings]);

  const filtered = useMemo(() => {
    let list = bookings;
    if (statusFilter !== "all") list = list.filter(b => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        String(b.id).includes(q) ||
        (b.field_name || "").toLowerCase().includes(q) ||
        String(b.user_id).includes(q) ||
        (b.username || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, search, statusFilter]);

  const doAction = async (id, type, value) => {
    setActionMsg(""); setActionErr("");
    setActionLoading(id + type);
    try {
      if (type === "status") await updateBookingStatus(id, value);
      if (type === "deposit") await updateDepositStatus(id, value);
      setActionMsg(`✅ Cập nhật booking #${id} thành công`);
      await fetchBookings();
    } catch (err) {
      setActionErr(err.message || "Cập nhật thất bại. Cần kết nối database.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="container page-section admin-page-layout">
        <AdminSidebar />

        <div className="admin-page-main">
          <div className="match-page-head">
            <div>
              <span className="page-badge">📋 Quản lý booking</span>
              <h1 className="section-title" style={{ marginTop: "10px" }}>Quản lý đặt sân</h1>
              <p className="section-subtitle">
                Theo dõi và xử lý toàn bộ lượt đặt sân trong hệ thống.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            <div className="admin-stat-card admin-stat-blue">
              <div className="admin-stat-icon">📋</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Tổng booking</span>
                <strong className="admin-stat-value">{stats.total}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-orange">
              <div className="admin-stat-icon">⏳</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Chờ xác nhận</span>
                <strong className="admin-stat-value">{stats.pending}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-green">
              <div className="admin-stat-icon">✅</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Đã xác nhận</span>
                <strong className="admin-stat-value">{stats.confirmed}</strong>
              </div>
            </div>
            <div className="admin-stat-card" style={{ background: "linear-gradient(135deg,#dbeafe,#bfdbfe)", borderColor: "#93c5fd" }}>
              <div className="admin-stat-icon" style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>🏁</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Hoàn thành</span>
                <strong className="admin-stat-value">{stats.completed}</strong>
              </div>
            </div>
            <div className="admin-stat-card" style={{ background: "linear-gradient(135deg,#fee2e2,#fecaca)", borderColor: "#f87171" }}>
              <div className="admin-stat-icon" style={{ background: "linear-gradient(135deg,#f87171,#dc2626)" }}>❌</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Đã hủy</span>
                <strong className="admin-stat-value">{stats.cancelled}</strong>
              </div>
            </div>
            <div className="admin-stat-card" style={{ background: "linear-gradient(135deg,#fdf4ff,#e9d5ff)", borderColor: "#c084fc" }}>
              <div className="admin-stat-icon" style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>🚫</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Không đến</span>
                <strong className="admin-stat-value">{stats.no_show}</strong>
              </div>
            </div>
          </div>

          {/* Action feedback */}
          {actionMsg && <div className="alert-success" style={{ marginBottom: 12 }}>{actionMsg}</div>}
          {actionErr && <div className="alert-error" style={{ marginBottom: 12 }}>⚠️ {actionErr}</div>}

          {/* Toolbar */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
            <div className="match-search-box" style={{ flex: "1", minWidth: "200px" }}>
              <input
                type="text"
                placeholder="🔍 Tìm theo mã, tên sân, username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Status filter pills */}
          <div className="filter-status-row">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`filter-pill${statusFilter === f.key ? " filter-pill-active" : ""}`}
                  onClick={() => setStatusFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <span className="filter-count-badge">
              📋 {filtered.length} kết quả
            </span>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu booking...</p>
            </div>
          )}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-box">
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
              {search || statusFilter !== "all"
                ? "Không tìm thấy booking phù hợp."
                : "Hiện chưa có booking nào trong hệ thống."}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="table-wrap">
              <div className="table-wrap-header">
                <h3>Danh sách booking ({filtered.length})</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Người đặt</th>
                    <th>Tên sân</th>
                    <th>Ngày</th>
                    <th>Giờ</th>
                    <th>Trạng thái</th>
                    <th>Cọc</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => {
                    const busy = actionLoading && actionLoading.startsWith(String(booking.id));
                    return (
                      <tr key={booking.id}>
                        <td><strong>#{booking.id}</strong></td>
                        <td>{booking.username || `User #${booking.user_id}`}</td>
                        <td>{booking.field_name || `Sân #${booking.field_id}`}</td>
                        <td>{formatDateVN(booking.booking_date) || "—"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatTimeVN(booking.start_time) || "—"} – {formatTimeVN(booking.end_time) || "—"}
                        </td>
                        <td><StatusBadge status={booking.status} /></td>
                        <td><StatusBadge status={booking.deposit_status || "unpaid"} /></td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {booking.status === "pending" && (
                              <>
                                <button
                                  className="admin-action-btn admin-action-confirm"
                                  disabled={busy}
                                  onClick={() => doAction(booking.id, "status", "confirmed")}
                                >
                                  ✅ Xác nhận
                                </button>
                                <button
                                  className="admin-action-btn admin-action-cancel"
                                  disabled={busy}
                                  onClick={() => doAction(booking.id, "status", "cancelled")}
                                >
                                  ❌ Hủy
                                </button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <>
                                <button
                                  className="admin-action-btn admin-action-complete"
                                  disabled={busy}
                                  onClick={() => doAction(booking.id, "status", "completed")}
                                >
                                  🏁 Hoàn thành
                                </button>
                                <button
                                  className="admin-action-btn admin-action-noshow"
                                  disabled={busy}
                                  onClick={() => doAction(booking.id, "status", "no_show")}
                                >
                                  🚫 Không đến
                                </button>
                              </>
                            )}
                            {(booking.deposit_status === "unpaid" || !booking.deposit_status) && (
                              <button
                                className="admin-action-btn admin-action-deposit"
                                disabled={busy}
                                onClick={() => doAction(booking.id, "deposit", "paid")}
                              >
                                💰 Đã cọc
                              </button>
                            )}
                            {booking.deposit_status === "paid" && (
                              <button
                                className="admin-action-btn admin-action-refund"
                                disabled={busy}
                                onClick={() => doAction(booking.id, "deposit", "refunded")}
                              >
                                🔄 Hoàn cọc
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

export default AdminBookings;
