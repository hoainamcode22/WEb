import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMatches } from "../services/api";
import { formatDateTimeVN } from "../utils/format";

const STATUS_FILTERS = [
  { key: "all",       label: "Tất cả trận" },
  { key: "open",      label: "🟢 Đang mở" },
  { key: "full",      label: "👥 Đủ người" },
  { key: "completed", label: "🏁 Kết thúc" },
];

function Matches() {
  const [matches,      setMatches]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredMatches = useMemo(() => {
    let result = matches;

    if (statusFilter !== "all") {
      result = result.filter(
        (m) => String(m.status || "open").toLowerCase() === statusFilter
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          (m.title    || "").toLowerCase().includes(q) ||
          (m.location || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [matches, search, statusFilter]);

  const stats = useMemo(() => ({
    total:     matches.length,
    open:      matches.filter((m) => String(m.status || "open") === "open").length,
    full:      matches.filter((m) => m.status === "full").length,
    completed: matches.filter((m) => m.status === "completed").length,
  }), [matches]);

  const getStatusInfo = (status) => {
    if (status === "full")      return { text: "Đã đủ người", dot: "#f59e0b", badge: "FULL" };
    if (status === "completed") return { text: "Đã kết thúc", dot: "#6b7280", badge: "DONE" };
    if (status === "cancelled") return { text: "Đã hủy",      dot: "#ef4444", badge: "HỦY" };
    return { text: "Đang tuyển",  dot: "#22c55e", badge: "OPEN" };
  };

  const playerPercent = (current, max) => {
    const c = Number(current || 0);
    const m = Number(max || 10);
    return Math.min(Math.round((c / m) * 100), 100);
  };

  return (
    <div>
      <Navbar />

      <div className="container page-section">
        {/* Header */}
        <div className="match-page-head">
          <div>
            <span className="page-badge">⚽ Tìm trận bóng</span>
            <h1 className="section-title" style={{ marginTop: "10px" }}>
              Tìm trận phù hợp để tham gia
            </h1>
            <p className="section-subtitle">
              {!loading && matches.length > 0
                ? `${stats.total} trận · ${stats.open} đang mở · ${stats.full} đã đủ người`
                : "Xem các trận đang mở đăng ký và tham gia cộng đồng bóng đá."}
            </p>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="match-toolbar">
          <div className="match-search-box">
            <input
              type="text"
              placeholder="🔍 Tìm theo tên trận hoặc địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button
              className="btn-outline"
              style={{ padding: "12px 18px", borderRadius: "12px", whiteSpace: "nowrap" }}
              onClick={() => setSearch("")}
            >
              ✕ Xóa
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="match-filter-row">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`match-filter-pill${statusFilter === f.key ? " active" : ""}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!loading && !error && (
          <div className="filter-status-row">
            <span className="filter-count-badge">
              📋 {filteredMatches.length} trận{" "}
              {search ? `phù hợp với "${search}"` : "trong hệ thống"}
            </span>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách trận đấu...</p>
          </div>
        )}
        {error && (
          <div className="alert-error" style={{ marginBottom: "20px" }}>
            <span>⚠️</span> {error}
          </div>
        )}
        {!loading && !error && filteredMatches.length === 0 && (
          <div className="empty-box" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>⚽</div>
            <h3 style={{ marginBottom: "8px" }}>Không tìm thấy trận phù hợp</h3>
            <p>
              {search
                ? `Không có trận nào phù hợp với "${search}".`
                : "Hiện chưa có trận nào. Quay lại sau nhé!"}
            </p>
          </div>
        )}

        {/* Match Cards */}
        {!loading && !error && filteredMatches.length > 0 && (
          <div className="match-card-grid">
            {filteredMatches.map((match, index) => {
              const si      = getStatusInfo(match.status);
              const current = Number(match.current_players || 0);
              const max     = Number(match.max_players || 10);
              const pct     = playerPercent(current, max);
              const isFull  = match.status === "full" || current >= max;

              return (
                <div
                  key={match.id}
                  className={`modern-match-card motion-delay-${(index % 5) + 1}`}
                >
                  <div className="modern-match-image">
                    <span className={`modern-match-badge${isFull ? " badge-full" : ""}`}>
                      {si.badge}
                    </span>
                    <span className="modern-match-level">Phong trào</span>
                  </div>

                  <div className="modern-match-content">
                    <h3>{match.title}</h3>
                    <p className="modern-match-location">📍 {match.location || "—"}</p>

                    <div className="modern-match-meta">
                      <div>
                        <span>THỜI GIAN</span>
                        <strong>{formatDateTimeVN(match.time) || match.time || "—"}</strong>
                      </div>
                      <div>
                        <span>SỐ NGƯỜI</span>
                        <strong style={{ color: isFull ? "#f59e0b" : "#16944c" }}>
                          {current}/{max}
                        </strong>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="player-progress">
                      <div
                        className="player-progress-bar"
                        style={{
                          width: `${pct}%`,
                          background: isFull
                            ? "linear-gradient(90deg,#f59e0b,#d97706)"
                            : "linear-gradient(90deg,#22c55e,#16944c)",
                        }}
                      />
                    </div>

                    <div className="modern-match-footer">
                      <div className="modern-match-status">
                        <span
                          className="status-dot"
                          style={{ background: si.dot }}
                        />
                        {si.text}
                      </div>
                      <Link to={`/matches/${match.id}`}>
                        <button
                          className="modern-match-btn"
                          disabled={match.status === "cancelled"}
                          style={match.status === "cancelled" ? { opacity: 0.5 } : {}}
                        >
                          {isFull ? "Xem chi tiết" : "Tham gia"}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Matches;
