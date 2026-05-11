import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getFields } from "../services/api";

const FIELD_TYPE_FILTERS = [
  { key: "all",   label: "Tất cả loại" },
  { key: "5v5",   label: "⚽ 5 vs 5" },
  { key: "7v7",   label: "⚽ 7 vs 7" },
  { key: "11v11", label: "⚽ 11 vs 11" },
];

const STATUS_FILTERS = [
  { key: "all",       label: "Tất cả sân" },
  { key: "available", label: "✅ Còn trống" },
];

const FIELD_TYPE_EMOJI = { "5v5": "⚽", "7v7": "🏃", "11v11": "🏟️" };

function Fields() {
  const [fields,      setFields]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [search,      setSearch]      = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter,  setTypeFilter]  = useState("all");

  useEffect(() => {
    getFields()
      .then(setFields)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredFields = useMemo(() => {
    let result = fields;

    if (statusFilter === "available") {
      result = result.filter((f) => String(f.status).toLowerCase() === "available");
    }

    if (typeFilter !== "all") {
      result = result.filter((f) => f.field_type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          (f.name     || "").toLowerCase().includes(q) ||
          (f.location || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [fields, search, statusFilter, typeFilter]);

  const stats = useMemo(() => ({
    total:     fields.length,
    available: fields.filter((f) => f.status === "available").length,
    fiveVFive: fields.filter((f) => f.field_type === "5v5").length,
    sevenVSeven: fields.filter((f) => f.field_type === "7v7").length,
  }), [fields]);

  const statusLabel = (status) => {
    if (status === "available")   return { text: "✅ Còn trống",   cls: "field-badge-green" };
    if (status === "occupied")    return { text: "⚽ Đang dùng",   cls: "field-badge-orange" };
    if (status === "maintenance") return { text: "🔧 Bảo trì",    cls: "field-badge-gray" };
    return { text: status, cls: "field-badge-gray" };
  };

  return (
    <div>
      <Navbar />

      <div className="container page-section">
        {/* Header */}
        <div className="match-page-head">
          <div>
            <span className="page-badge">🏟️ Sân bóng</span>
            <h1 className="section-title" style={{ marginTop: "10px" }}>
              Chọn sân phù hợp để đặt lịch
            </h1>
            <p className="section-subtitle">
              {!loading && fields.length > 0
                ? `${stats.total} sân · ${stats.available} sân còn trống · ${stats.fiveVFive} sân 5v5 · ${stats.sevenVSeven} sân 7v7`
                : "Tìm sân theo khu vực, loại sân và mức giá phù hợp."}
            </p>
          </div>
        </div>

        {/* Search Toolbar */}
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

        {/* Filter Pills — Trạng thái */}
        <div className="match-filter-row" style={{ gap: "8px" }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`match-filter-pill${statusFilter === f.key ? " active" : ""}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.label}
              {!loading && f.key === "available" && (
                <span style={{ marginLeft: "4px", fontSize: "11px", opacity: 0.7 }}>
                  ({stats.available})
                </span>
              )}
            </button>
          ))}

          <span style={{ width: "1px", background: "#dfe8e2", margin: "0 4px" }} />

          {/* Filter Pills — Loại sân */}
          {FIELD_TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`match-filter-pill${typeFilter === f.key ? " active" : ""}`}
              onClick={() => setTypeFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        {!loading && !error && (
          <div className="filter-status-row">
            <span className="filter-count-badge">
              🏟️ {filteredFields.length} sân{" "}
              {search ? `phù hợp với "${search}"` : "trong hệ thống"}
            </span>
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách sân bóng...</p>
          </div>
        )}
        {error && (
          <div className="alert-error" style={{ marginBottom: "20px" }}>
            <span>⚠️</span> {error}
          </div>
        )}
        {!loading && !error && filteredFields.length === 0 && (
          <div className="empty-box" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>🏟️</div>
            <h3 style={{ marginBottom: "8px" }}>Không tìm thấy sân phù hợp</h3>
            <p>
              {search
                ? `Không có sân nào phù hợp với "${search}".`
                : "Hãy thử bỏ bộ lọc hoặc tìm kiếm khác."}
            </p>
          </div>
        )}

        {/* Field Cards */}
        {!loading && !error && filteredFields.length > 0 && (
          <div className="match-card-grid">
            {filteredFields.map((field, index) => {
              const badge = statusLabel(field.status);
              const typeEmoji = FIELD_TYPE_EMOJI[field.field_type] || "⚽";
              return (
                <div
                  key={field.id}
                  className={`modern-field-card motion-delay-${(index % 5) + 1}`}
                >
                  <div className="modern-field-image">
                    <span className={`modern-field-badge ${badge.cls}`}>
                      {badge.text}
                    </span>
                    <span className="modern-field-type">
                      {typeEmoji} Sân {field.field_type || "5v5"}
                    </span>
                  </div>

                  <div className="modern-field-content">
                    <h3>{field.name}</h3>
                    <p className="modern-field-location">
                      📍 {field.location || "TP.HCM"}
                    </p>

                    {field.description && (
                      <p style={{
                        fontSize: "13px",
                        color: "#66756d",
                        marginBottom: "10px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {field.description}
                      </p>
                    )}

                    <div className="modern-field-tags">
                      <span>{field.field_type || "5v5"}</span>
                      <span>Đặt theo giờ</span>
                      {field.status === "available" && (
                        <span style={{ background: "rgba(47,255,99,0.15)", color: "#2fff63" }}>
                          Còn trống
                        </span>
                      )}
                      {field.status === "maintenance" && (
                        <span style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                          Bảo trì
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
                        {field.status === "available" ? (
                          <Link to={`/booking/${field.id}`}>
                            <button className="modern-match-btn">Đặt sân</button>
                          </Link>
                        ) : (
                          <button
                            className="modern-match-btn"
                            disabled
                            style={{ opacity: 0.5, cursor: "not-allowed" }}
                          >
                            Không khả dụng
                          </button>
                        )}
                      </div>
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

export default Fields;
