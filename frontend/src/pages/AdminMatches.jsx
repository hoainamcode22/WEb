import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminSidebar from "../components/AdminSidebar";
import StatusBadge from "../components/StatusBadge";
import { getAdminMatches, updateMatchStatus } from "../services/api";
import { formatDateTimeVN } from "../utils/format";

function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchMatches = async () => {
    try {
      const data = await getAdminMatches();
      setMatches(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  const stats = useMemo(() => {
    const total = matches.length;
    const open = matches.filter(m => {
      const st = String(m.status || "open").toLowerCase();
      return st === "open" || st === "";
    }).length;
    const full = matches.filter(m => String(m.status || "").toLowerCase() === "full").length;
    const cancelled = matches.filter(m => String(m.status || "").toLowerCase() === "cancelled").length;
    return { total, open, full, cancelled };
  }, [matches]);

  const filtered = useMemo(() => {
    if (!search.trim()) return matches;
    const q = search.toLowerCase();
    return matches.filter(m =>
      (m.title || "").toLowerCase().includes(q) ||
      (m.location || "").toLowerCase().includes(q) ||
      String(m.id).includes(q)
    );
  }, [matches, search]);

  const getMatchStatus = (match) => {
    if (match.status) return match.status;
    if (match.current_players >= match.max_players) return "full";
    return "open";
  };

  const doAction = async (id, status) => {
    setActionMsg(""); setActionErr("");
    setActionLoading(id);
    try {
      await updateMatchStatus(id, status);
      setActionMsg(`✅ Cập nhật trận #${id} thành công`);
      await fetchMatches();
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
              <span className="page-badge">⚽ Quản lý trận đấu</span>
              <h1 className="section-title" style={{ marginTop: "10px" }}>Quản lý trận đấu</h1>
              <p className="section-subtitle">
                Theo dõi và quản lý tất cả trận đấu cộng đồng trong hệ thống.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="admin-stat-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            <div className="admin-stat-card admin-stat-green">
              <div className="admin-stat-icon">⚽</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Tổng trận đấu</span>
                <strong className="admin-stat-value">{stats.total}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-blue">
              <div className="admin-stat-icon">🟢</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Đang mở đăng ký</span>
                <strong className="admin-stat-value">{stats.open}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-orange">
              <div className="admin-stat-icon">👥</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Đã đủ người</span>
                <strong className="admin-stat-value">{stats.full}</strong>
              </div>
            </div>
            <div className="admin-stat-card" style={{ background: "linear-gradient(135deg,#fee2e2,#fecaca)", borderColor: "#f87171" }}>
              <div className="admin-stat-icon" style={{ background: "linear-gradient(135deg,#f87171,#dc2626)" }}>❌</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Đã hủy</span>
                <strong className="admin-stat-value">{stats.cancelled}</strong>
              </div>
            </div>
          </div>

          {actionMsg && <div className="alert-success" style={{ marginBottom: 12 }}>{actionMsg}</div>}
          {actionErr && <div className="alert-error" style={{ marginBottom: 12 }}>⚠️ {actionErr}</div>}

          <div className="match-toolbar" style={{ marginBottom: "18px" }}>
            <div className="match-search-box">
              <input
                type="text"
                placeholder="🔍 Tìm theo tên trận, địa điểm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="filter-count-badge">⚽ {filtered.length} trận</span>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu trận đấu...</p>
            </div>
          )}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-box">
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚽</div>
              {search ? "Không tìm thấy trận phù hợp." : "Hiện chưa có trận đấu nào trong hệ thống."}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="table-wrap">
              <div className="table-wrap-header">
                <h3>Danh sách trận đấu ({filtered.length})</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên trận</th>
                    <th>Địa điểm</th>
                    <th>Thời gian</th>
                    <th>Sức chứa</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((match) => {
                    const matchStatus = getMatchStatus(match);
                    const busy = actionLoading === match.id;
                    return (
                      <tr key={match.id}>
                        <td><strong>#{match.id}</strong></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>⚽</span>
                            <span style={{ fontWeight: 700 }}>{match.title}</span>
                          </div>
                        </td>
                        <td>📍 {match.location || "—"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatDateTimeVN(match.time) || match.time || "—"}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{match.current_players || 0}</span>
                          <span style={{ color: "#66756d" }}>/{match.max_players || "—"}</span>
                        </td>
                        <td><StatusBadge status={matchStatus} /></td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {matchStatus !== "cancelled" && (
                              <button
                                className="admin-action-btn admin-action-cancel"
                                disabled={busy}
                                onClick={() => doAction(match.id, "cancelled")}
                              >
                                ❌ Hủy trận
                              </button>
                            )}
                            {matchStatus === "open" && (
                              <button
                                className="admin-action-btn admin-action-complete"
                                disabled={busy}
                                onClick={() => doAction(match.id, "completed")}
                              >
                                🏁 Kết thúc
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

export default AdminMatches;
