import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getFieldById } from "../services/api";

function FieldDetail() {
  const { id } = useParams();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchField = async () => {
      try {
        const data = await getFieldById(id);
        setField(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchField();
  }, [id]);

  const isAvailable = field?.status === "available";
  const fieldStatusText = isAvailable ? "Còn trống" : field?.status || "Chưa cập nhật";
  const fieldPriceText = `${Number(field?.price || 0).toLocaleString("vi-VN")} VNĐ / giờ`;

  return (
    <div>
      <Navbar />

      <div className="container page-section">

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải chi tiết sân...</p>
          </div>
        )}

        {!loading && error && (
          <div className="alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {!loading && !error && !field && (
          <div className="empty-box" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>🏟️</div>
            <h3 style={{ marginBottom: "8px" }}>Không tìm thấy sân</h3>
            <p>Sân bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/fields" className="btn-primary" style={{ display: "inline-flex", marginTop: "20px" }}>
              Quay lại danh sách sân
            </Link>
          </div>
        )}

        {!loading && field && (
          <>
            {/* Detail Hero */}
            <div className="detail-hero">
              <div className="detail-hero-left">
                <span className="page-badge">🏟️ Chi tiết sân bóng</span>
                <h1>{field.name}</h1>
                <p>
                  Xem thông tin sân, mức giá và chọn khung giờ phù hợp để đặt sân
                  nhanh chóng. Hỗ trợ đặt theo giờ linh hoạt.
                </p>

                <div className="detail-tags">
                  <span
                    style={{
                      display: "inline-block",
                      padding: "7px 13px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 800,
                      background: isAvailable ? "#dcfce7" : "#fef3c7",
                      color: isAvailable ? "#14532d" : "#92400e",
                    }}
                  >
                    {isAvailable ? "✅ Còn trống" : "⏳ Đang nhận đặt"}
                  </span>
                  <span className="detail-tag">⚽ Sân cộng đồng</span>
                  <span className="detail-tag">5v5</span>
                  <span className="detail-tag">Phong trào</span>
                </div>
              </div>

              <div className="detail-hero-right">
                <div className="detail-info-box">
                  <h3>📋 Thông tin nhanh</h3>
                  <p>
                    <strong>💰 Giá thuê:</strong>{" "}
                    <span style={{ color: "#31ff69", fontWeight: 900 }}>{fieldPriceText}</span>
                  </p>
                  <p><strong>📍 Khu vực:</strong> {field.location || "Chưa cập nhật"}</p>
                  <p><strong>📊 Trạng thái:</strong> {fieldStatusText}</p>
                  <p><strong>🆔 Mã sân:</strong> #{field.id}</p>
                </div>
              </div>
            </div>

            {/* Detail Layout */}
            <div className="detail-layout">

              {/* Info Card */}
              <div className="simple-card">
                <h2 style={{ marginBottom: "18px" }}>📖 Giới thiệu sân</h2>
                <p className="section-subtitle" style={{ marginBottom: "22px" }}>
                  Sân bóng phù hợp cho các trận giao lưu, đá phong trào và đặt lịch theo
                  khung giờ linh hoạt phù hợp với nhu cầu của bạn.
                </p>

                <div style={{ display: "grid", gap: "16px" }}>
                  {[
                    { label: "Tên sân", value: field.name, icon: "🏟️" },
                    { label: "Giá thuê", value: fieldPriceText, icon: "💰" },
                    { label: "Khu vực", value: field.location || "Chưa cập nhật", icon: "📍" },
                    { label: "Trạng thái", value: fieldStatusText, icon: "📊" },
                    { label: "Hình thức", value: "Đặt theo giờ", icon: "⏰" },
                    { label: "Loại sân", value: "Sân 5 người (5v5)", icon: "⚽" },
                  ].map(({ label, value, icon }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 16px",
                        background: "var(--surface-soft)",
                        borderRadius: "14px",
                        border: "1px solid var(--surface-line)",
                      }}
                    >
                      <span style={{ fontSize: "20px", width: "28px", textAlign: "center", flexShrink: 0 }}>
                        {icon}
                      </span>
                      <div>
                        <span style={{ display: "block", fontSize: "12px", color: "#66756d", fontWeight: 600, marginBottom: "2px" }}>
                          {label}
                        </span>
                        <strong style={{ fontSize: "15px", color: "#102418" }}>{value}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Card */}
              <div className="simple-card">
                <h2 style={{ marginBottom: "14px" }}>🚀 Hành động nhanh</h2>
                <p className="section-subtitle" style={{ marginBottom: "22px" }}>
                  Đặt sân ngay hoặc khám phá thêm các sân khác trong hệ thống.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Link
                    to={`/booking/${field.id}`}
                    className="btn-primary"
                    style={{ textAlign: "center", padding: "15px", fontSize: "16px" }}
                  >
                    🏟️ Đặt sân ngay
                  </Link>

                  <Link
                    to="/fields"
                    className="btn-outline"
                    style={{ textAlign: "center", padding: "13px" }}
                  >
                    ← Quay lại danh sách sân
                  </Link>
                </div>

                {/* Pricing card */}
                <div
                  style={{
                    marginTop: "22px",
                    background: "linear-gradient(135deg, #0d2d1c, #1a6038)",
                    borderRadius: "20px",
                    padding: "22px",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ display: "block", color: "#aad8bd", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                    Giá thuê sân
                  </span>
                  <span style={{ display: "block", fontSize: "32px", fontWeight: 900, color: "#31ff69", letterSpacing: "-0.5px" }}>
                    {Number(field.price || 0).toLocaleString("vi-VN")} VNĐ
                  </span>
                  <span style={{ display: "block", color: "#7cb998", fontSize: "14px", marginTop: "4px" }}>
                    Tính theo giờ sử dụng thực tế
                  </span>
                </div>

                {/* Notice */}
                <div className="notice-box-warning" style={{ marginTop: "16px" }}>
                  <span>⚠️</span>
                  <div>Tiền cọc được xử lý thủ công bởi admin sau trận. Liên hệ admin để hoàn cọc.</div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default FieldDetail;
