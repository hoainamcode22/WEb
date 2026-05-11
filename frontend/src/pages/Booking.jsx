import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createBooking, getFieldById } from "../services/api";

// QR code VietQR demo — thay BANK_ID, ACCOUNT_NO cho thực tế
const QR_BANK_ID      = "MB";        // Mã ngân hàng MB Bank
const QR_ACCOUNT_NO   = "0123456789"; // Số tài khoản (demo)
const QR_ACCOUNT_NAME = "CHU SAN BONG DA";
const DEPOSIT_RATE    = 0.3;          // 30% tổng tiền = tiền cọc

function calcDepositAmount(price, startTime, endTime) {
  if (!price || !startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const hours = (eh * 60 + em - sh * 60 - sm) / 60;
  if (hours <= 0) return 0;
  return Math.round(price * hours * DEPOSIT_RATE);
}

function buildVietQR(amount, info) {
  const encoded = encodeURIComponent(info);
  const name    = encodeURIComponent(QR_ACCOUNT_NAME);
  return `https://img.vietqr.io/image/${QR_BANK_ID}-${QR_ACCOUNT_NO}-compact2.jpg?amount=${amount}&addInfo=${encoded}&accountName=${name}`;
}

function Booking() {
  const { fieldId } = useParams();
  const navigate    = useNavigate();

  const [currentUser,   setCurrentUser]   = useState(null);
  const [field,         setField]         = useState(null);
  const [loadingField,  setLoadingField]  = useState(true);

  const [formData, setFormData] = useState({
    field_id:     Number(fieldId),
    booking_date: "",
    start_time:   "",
    end_time:     "",
    status:       "pending",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  // Kết quả sau khi đặt thành công
  const [booking, setBooking] = useState(null); // { bookingId, depositAmount, qrUrl }

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token     = localStorage.getItem("token");

    if (!token || !savedUser) { navigate("/login"); return; }

    try {
      setCurrentUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    getFieldById(fieldId)
      .then(setField)
      .catch(() => setField(null))
      .finally(() => setLoadingField(false));
  }, [navigate, fieldId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "field_id" ? Number(value) : value,
    }));
  };

  const depositAmount = calcDepositAmount(
    field?.price,
    formData.start_time,
    formData.end_time
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.booking_date || !formData.start_time || !formData.end_time) {
      setError("Vui lòng nhập đầy đủ ngày và khung giờ đặt sân.");
      return;
    }
    if (formData.end_time <= formData.start_time) {
      setError("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBooking({
        ...formData,
        deposit_amount: depositAmount,
      });

      const qrInfo = `Coc dat san - Booking #${result.bookingId} - ${field?.name || "San bong"}`;
      setBooking({
        bookingId:     result.bookingId,
        depositAmount,
        qrUrl: buildVietQR(depositAmount, qrInfo),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldName     = field?.name     || `Sân #${fieldId}`;
  const fieldPrice    = field?.price    ? Number(field.price).toLocaleString("vi-VN") : "—";
  const fieldLocation = field?.location || "TP.HCM";
  const fieldType     = field?.field_type || "5v5";

  // ============================================================
  // BƯỚC 2: Hiển thị QR code sau khi đặt thành công
  // ============================================================
  if (booking) {
    return (
      <div>
        <Navbar />
        <div className="container page-section">
          <div className="booking-success-wrap">
            {/* Left: thông tin */}
            <div className="booking-success-info">
              <div className="success-icon">🎉</div>
              <h1 className="section-title" style={{ marginTop: "12px", color: "#102418" }}>
                Đặt sân thành công!
              </h1>
              <p className="section-subtitle">
                Booking <strong>#{booking.bookingId}</strong> đã được tạo và đang chờ xác nhận từ admin.
              </p>

              <div className="booking-confirm-rows">
                <div className="booking-confirm-row">
                  <span>🏟️ Sân</span>
                  <strong>{fieldName}</strong>
                </div>
                <div className="booking-confirm-row">
                  <span>📅 Ngày đặt</span>
                  <strong>{formData.booking_date}</strong>
                </div>
                <div className="booking-confirm-row">
                  <span>🕐 Khung giờ</span>
                  <strong>{formData.start_time} – {formData.end_time}</strong>
                </div>
                <div className="booking-confirm-row">
                  <span>💰 Giá thuê</span>
                  <strong>{fieldPrice} VNĐ/giờ</strong>
                </div>
                <div className="booking-confirm-row booking-confirm-highlight">
                  <span>💳 Tiền cọc (30%)</span>
                  <strong style={{ color: "#16944c", fontSize: "18px" }}>
                    {booking.depositAmount.toLocaleString("vi-VN")} VNĐ
                  </strong>
                </div>
              </div>

              <div className="notice-box-warning" style={{ marginTop: "16px" }}>
                <span>⚠️</span>
                <div>
                  <strong>Lưu ý quan trọng:</strong>
                  <ul style={{ marginTop: "8px", paddingLeft: "16px", lineHeight: "1.7" }}>
                    <li>Chuyển cọc qua QR code bên cạnh để xác nhận booking</li>
                    <li>Nếu không đến → mất toàn bộ tiền cọc</li>
                    <li>Tiền còn lại thanh toán trực tiếp tại sân</li>
                    <li>Admin sẽ xác nhận booking sau khi nhận cọc</li>
                  </ul>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
                <Link to="/my-schedule">
                  <button className="btn-primary">📅 Xem lịch của tôi</button>
                </Link>
                <Link to="/fields">
                  <button className="btn-secondary">🏟️ Xem sân khác</button>
                </Link>
              </div>
            </div>

            {/* Right: QR code */}
            <div className="booking-qr-card">
              <h3>💳 Thanh toán cọc</h3>
              <p>Quét mã QR để chuyển khoản nhanh</p>

              <div className="qr-frame">
                <img
                  src={booking.qrUrl}
                  alt="QR thanh toán cọc"
                  className="qr-image"
                  onError={(e) => {
                    // Fallback nếu VietQR không load
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="qr-fallback" style={{ display: "none" }}>
                  <div style={{ fontSize: "48px" }}>📱</div>
                  <p>QR Code demo</p>
                  <p style={{ fontSize: "12px", color: "#888" }}>Cấu hình ngân hàng thực tế trong Booking.jsx</p>
                </div>
              </div>

              <div className="qr-bank-info">
                <div className="qr-bank-row">
                  <span>Ngân hàng</span>
                  <strong>MB Bank</strong>
                </div>
                <div className="qr-bank-row">
                  <span>Số tài khoản</span>
                  <strong>{QR_ACCOUNT_NO}</strong>
                </div>
                <div className="qr-bank-row">
                  <span>Chủ tài khoản</span>
                  <strong>{QR_ACCOUNT_NAME}</strong>
                </div>
                <div className="qr-bank-row qr-amount-row">
                  <span>Số tiền cọc</span>
                  <strong className="qr-amount">
                    {booking.depositAmount.toLocaleString("vi-VN")} VNĐ
                  </strong>
                </div>
                <div className="qr-bank-row">
                  <span>Nội dung CK</span>
                  <strong style={{ wordBreak: "break-all" }}>
                    COC BOOKING #{booking.bookingId}
                  </strong>
                </div>
              </div>

              <p className="qr-note">
                Sau khi chuyển khoản, admin sẽ xác nhận trong vòng 30 phút.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ============================================================
  // BƯỚC 1: Form đặt sân
  // ============================================================
  return (
    <div>
      <Navbar />

      <div className="container page-section">
        <div className="match-page-head">
          <div>
            <span className="page-badge">🏟️ Đặt sân bóng</span>
            <h1 className="section-title" style={{ marginTop: "10px" }}>
              {loadingField ? "Đang tải thông tin sân..." : `Đặt sân: ${fieldName}`}
            </h1>
            <p className="section-subtitle">
              Chọn ngày và khung giờ phù hợp. Tiền cọc 30% sẽ được tính sau khi chọn giờ.
            </p>
          </div>
        </div>

        <div className="booking-layout">

          {/* LEFT — Field Info */}
          <div className="booking-side-card">
            <span className="hero-badge">Thông tin sân</span>
            <h1>{fieldName}</h1>
            <p>Kiểm tra thông tin sân trước khi đặt. Sau khi xác nhận, QR code thanh toán cọc sẽ được hiển thị.</p>

            <div className="booking-field-info">
              <div className="booking-field-row">
                <div className="booking-field-row-icon">🏟️</div>
                <div className="booking-field-row-text">
                  <span>Tên sân</span>
                  <strong>{fieldName}</strong>
                </div>
              </div>
              <div className="booking-field-row">
                <div className="booking-field-row-icon">⚽</div>
                <div className="booking-field-row-text">
                  <span>Loại sân</span>
                  <strong>{fieldType === "5v5" ? "5 vs 5" : fieldType === "7v7" ? "7 vs 7" : "11 vs 11"}</strong>
                </div>
              </div>
              <div className="booking-field-row">
                <div className="booking-field-row-icon">📍</div>
                <div className="booking-field-row-text">
                  <span>Khu vực</span>
                  <strong>{fieldLocation}</strong>
                </div>
              </div>
              <div className="booking-field-row">
                <div className="booking-field-row-icon">💰</div>
                <div className="booking-field-row-text">
                  <span>Giá thuê</span>
                  <strong>{fieldPrice} VNĐ / giờ</strong>
                </div>
              </div>
              <div className="booking-field-row">
                <div className="booking-field-row-icon">👤</div>
                <div className="booking-field-row-text">
                  <span>Người đặt</span>
                  <strong>{currentUser?.username || "—"}</strong>
                </div>
              </div>
              {depositAmount > 0 && (
                <div className="booking-field-row" style={{ background: "rgba(22,148,76,0.08)", borderRadius: "10px", padding: "10px" }}>
                  <div className="booking-field-row-icon" style={{ background: "linear-gradient(135deg,#22c55e,#16944c)" }}>💳</div>
                  <div className="booking-field-row-text">
                    <span>Tiền cọc (30%)</span>
                    <strong style={{ color: "#16944c" }}>
                      {depositAmount.toLocaleString("vi-VN")} VNĐ
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div className="notice-box-warning" style={{ marginTop: "20px" }}>
              <span>💳</span>
              <div>
                <strong>Thanh toán cọc qua QR:</strong> Sau khi đặt sân thành công, mã QR thanh toán cọc 30% sẽ hiện ra. Không cọc = booking bị hủy.
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="simple-card">
            <h2 style={{ marginBottom: "8px" }}>Thông tin đặt sân</h2>
            <p className="section-subtitle" style={{ marginBottom: "22px" }}>
              Kiểm tra kỹ ngày và khung giờ. Tiền cọc = 30% × giá × số giờ.
            </p>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div>
                <label>Người đặt sân</label>
                <input type="text" value={currentUser?.username || ""} disabled />
              </div>

              <div>
                <label>Sân đặt</label>
                <input type="text" value={fieldName} disabled />
              </div>

              <div>
                <label>📅 Ngày đặt sân</label>
                <input
                  type="date"
                  name="booking_date"
                  value={formData.booking_date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="time-grid">
                <div>
                  <label>🕐 Giờ bắt đầu</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label>🕔 Giờ kết thúc</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {depositAmount > 0 && (
                <div className="deposit-preview">
                  <span>💳 Tiền cọc cần thanh toán:</span>
                  <strong>{depositAmount.toLocaleString("vi-VN")} VNĐ</strong>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", fontSize: "16px", padding: "14px" }}
                disabled={submitting}
              >
                {submitting ? "⏳ Đang xử lý..." : "✅ Xác nhận đặt sân → Xem QR cọc"}
              </button>
            </form>

            {error && (
              <div className="alert-error" style={{ marginTop: "16px" }}>
                <span>⚠️</span> {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Booking;
