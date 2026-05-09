import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getFields } from "../services/api";

function Fields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await getFields();
        setFields(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFields();
  }, []);

  const filteredFields = useMemo(() => {
    let result = fields;

    if (statusFilter === "available") {
      result = result.filter(
        (f) => String(f.status).toLowerCase() === "available"
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          (f.location || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [fields, search, statusFilter]);

  const availableCount = fields.filter(
    (f) => String(f.status).toLowerCase() === "available"
  ).length;

  const statusFilters = [
    { key: "all", label: "Tất cả sân" },
    { key: "available", label: `✅ Còn trống (${availableCount})` },
  ];

  return (
    <div>
      <Navbar />

      <div className="container page-section">
        {/* Header */}
        <div className="match-page-head">
          <div>
            <span className="page-badge">🏟️ Sân bóng</span>
            <h1 className="section-title" style={{ marginTop: "10px" }}>
              Chọn sân phù hợp để đặt lịch thi đấu
            </h1>
            <p className="section-subtitle">
              {!loading && fields.length > 0
                ? `${fields.length} sân đang có trong hệ thống · ${availableCount} sân còn trống hôm nay.`
                : "Tìm sân theo khu vực, xem mức giá và đặt sân nhanh chóng."}
            </p>
          </div>
        </div>

        {/* Search + Filter Toolbar */}
        <div className="match-toolbar">
          <div className="match-search-box">
            <input
              type="text"
              placeholder="🔍 Tìm theo tên sân hoặc khu vực..."
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

        {/* Status Filter Pills */}
        <div className="match-filter-row">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              className={`match-filter-pill${statusFilter === f.key ? " active" : ""}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
          <span className="match-filter-pill" style={{ pointerEvents: "none" }}>5 vs 5</span>
          <span className="match-filter-pill" style={{ pointerEvents: "none" }}>Phong trào</span>
        </div>

        {/* Result count */}
        {!loading && !error && (
          <div className="filter-status-row">
            <span className="filter-count-badge">
              🏟️ {filteredFields.length} sân {search ? `phù hợp với "${search}"` : "trong hệ thống"}
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách sân bóng...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert-error" style={{ marginBottom: "20px" }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredFields.length === 0 && (
          <div className="empty-box" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>🏟️</div>
            <h3 style={{ marginBottom: "8px", color: "#102418" }}>Không tìm thấy sân phù hợp</h3>
            <p>
              {search
                ? `Không có sân nào phù hợp với từ khóa "${search}". Thử tìm kiếm khác.`
                : "Hiện chưa có sân nào. Quay lại sau nhé!"}
            </p>
          </div>
        )}

        {/* Field Cards */}
        {!loading && !error && filteredFields.length > 0 && (
          <div className="match-card-grid">
            {filteredFields.map((field, index) => (
              <div
                key={field.id}
                className={`modern-field-card motion-delay-${(index % 5) + 1}`}
              >
                <div className="modern-field-image">
                  <span className="modern-field-badge">
                    {field.status === "available" ? "✅ Còn trống" : "📌 Đang nhận đặt"}
                  </span>
                  <span className="modern-field-type">⚽ Sân bóng</span>
                </div>

                <div className="modern-field-content">
                  <h3>{field.name}</h3>
                  <p className="modern-field-location">
                    📍 {field.location || "Chưa cập nhật khu vực"}
                  </p>

                  <div className="modern-field-tags">
                    <span>5v5</span>
                    <span>Đặt theo giờ</span>
                    <span>Phong trào</span>
                    {field.status === "available" && (
                      <span style={{ background: "rgba(47,255,99,0.15)", color: "#2fff63" }}>
                        Còn trống
                      </span>
                    )}
                  </div>

                  <div className="modern-field-footer">
                    <div className="modern-field-price">
                      <strong>
                        {Number(field.price || 0).toLocaleString("vi-VN")}
                      </strong>
                      <span>VNĐ / giờ</span>
                    </div>

                    <div className="modern-field-actions">
                      <Link to={`/fields/${field.id}`}>
                        <button className="btn-detail">Chi tiết</button>
                      </Link>
                      <Link to={`/booking/${field.id}`}>
                        <button className="modern-match-btn">Đặt sân</button>
                      </Link>
                    </div>
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

export default Fields;
