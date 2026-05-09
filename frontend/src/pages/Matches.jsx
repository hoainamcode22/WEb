import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMatches } from "../services/api";
import { formatDateTimeVN } from "../utils/format";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches();
        setMatches(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filteredMatches = useMemo(() => {
    let result = matches;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.location?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [matches, search]);

  const filters = [
    { key: "all", label: "Tất cả trận" },
    { key: "open", label: "Đang mở" },
    { key: "5v5", label: "5 vs 5" },
    { key: "evening", label: "Buổi tối" },
  ];

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
              Xem các trận đang mở đăng ký, chọn địa điểm phù hợp và tham gia
              cùng cộng đồng bóng đá ngay hôm nay.
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
          {filters.map((f) => (
            <button
              key={f.key}
              className={`match-filter-pill${activeFilter === f.key ? " active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!loading && !error && (
          <div className="filter-status-row">
            <span className="filter-count-badge">
              📋 {filteredMatches.length} trận {search ? `phù hợp với "${search}"` : "trong hệ thống"}
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
            <h3 style={{ marginBottom: "8px", color: "#102418" }}>Không tìm thấy trận phù hợp</h3>
            <p>
              {search
                ? `Không có trận nào phù hợp với từ khóa "${search}". Thử tìm kiếm khác.`
                : "Hiện chưa có trận nào đang mở. Quay lại sau nhé!"}
            </p>
          </div>
        )}

        {/* Match Cards */}
        {!loading && !error && filteredMatches.length > 0 && (
          <div className="match-card-grid">
            {filteredMatches.map((match, index) => (
              <div
                key={match.id}
                className={`modern-match-card motion-delay-${(index % 5) + 1}`}
              >
                <div className="modern-match-image">
                  <span className="modern-match-badge">OPEN MATCH</span>
                  <span className="modern-match-level">Phong trào</span>
                </div>

                <div className="modern-match-content">
                  <h3>{match.title}</h3>
                  <p className="modern-match-location">📍 {match.location}</p>

                  <div className="modern-match-meta">
                    <div>
                      <span>THỜI GIAN</span>
                      <strong>{formatDateTimeVN(match.time) || match.time}</strong>
                    </div>
                    <div>
                      <span>SỨC CHỨA</span>
                      <strong>{match.max_players} người</strong>
                    </div>
                  </div>

                  <div className="modern-match-footer">
                    <div className="modern-match-status">
                      <span className="status-dot"></span>
                      Đang tuyển người
                    </div>
                    <Link to={`/matches/${match.id}`}>
                      <button className="modern-match-btn">Xem chi tiết</button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Matches;
