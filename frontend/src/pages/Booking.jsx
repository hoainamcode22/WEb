import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createBooking, getFieldById } from "../services/api";

function Booking() {
  const { fieldId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [field, setField] = useState(null);
  const [loadingField, setLoadingField] = useState(true);

  const [formData, setFormData] = useState({
    field_id: Number(fieldId),
    booking_date: "",
    start_time: "",
    end_time: "",
    status: "pending",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }

    const fetchField = async () => {
      try {
        const data = await getFieldById(fieldId);
        setField(data);
      } catch {
        setField(null);
      } finally {
        setLoadingField(false);
      }
    };

    fetchField();
  }, [navigate, fieldId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "field_id" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
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
      const result = await createBooking(formData);
      setMessage(`Đặt sân thành công! Mã booking: #${result.bookingId}`);
      setFormData({
        field_id: Number(fieldId),
        booking_date: "",
        start_time: "",
        end_time: "",
        status: "pending",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldName = field?.name || `Sân #${fieldId}`;
  const fieldPrice = field?.price ? Number(field.price).toLocaleString("vi-VN") : "—";
  const fieldLocation = field?.location || "Chưa cập nhật";

  return (
    <div>
      <Navbar />

      <div className="container page-section">

        {/* PAGE HEADER */}
        <div className="match-page-head">
          <div>
            <span className="page-badge">🏟️ Đặt sân bóng</span>
            <h1 className="section-title" style={{ marginTop: "10px" }}>
              {loadingField ? "Đang tải thông tin sân..." : `Đặt sân: ${fieldName}`}
            </h1>
            <p className="section-subtitle">
              Chọn ngày và khung giờ phù hợp để hoàn tất đặt sân. Trạng thái booking
              sẽ là "chờ xác nhận" cho đến khi admin phê duyệt.
            </p>
          </div>
        </div>

        <div className="booking-layout">

          {/* LEFT — Field Info */}
          <div className="booking-side-card">
            <span className="hero-badge">Thông tin sân đặt</span>
            <h1>{fieldName}</h1>
            <p>
              Kiểm tra thông tin sân bên dưới trước khi xác nhận. Sau khi đặt
              thành công, bạn có thể theo dõi trạng thái trong <strong>Lịch của tôi</strong>.
            </p>

            <div className="booking-field-info">
              <div className="booking-field-row">
                <div className="booking-field-row-icon">🏟️</div>
                <div className="booking-field-row-text">
                  <span>Tên sân</span>
                  <strong>{fieldName}</strong>
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
                  <strong>{currentUser?.username || "Đang tải..."}</strong>
                </div>
              </div>

              <div className="booking-field-row">
                <div className="booking-field-row-icon">📋</div>
                <div className="booking-field-row-text">
                  <span>Trạng thái mặc định</span>
                  <strong>⏳ Chờ xác nhận</strong>
                </div>
              </div>
            </div>

            <div className="notice-box-warning" style={{ marginTop: "20px" }}>
              <span>⚠️</span>
              <div>
                <strong>Lưu ý về tiền cọc:</strong> Tiền cọc được xử lý thủ công
                bởi admin sau trận đấu. Vui lòng liên hệ admin để hoàn cọc sau
                khi kết thúc hoạt động.
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="simple-card">
            <h2 style={{ marginBottom: "8px" }}>Thông tin đặt sân</h2>
            <p className="section-subtitle" style={{ marginBottom: "22px" }}>
              Vui lòng kiểm tra kỹ ngày và khung giờ trước khi xác nhận đặt sân.
            </p>

            <form className="booking-form" onSubmit={handleSubmit}>
              <div>
                <label>Người đặt sân</label>
                <input
                  type="text"
                  value={currentUser?.username || ""}
                  disabled
                  style={{ cursor: "not-allowed" }}
                />
              </div>

              <div>
                <label>Sân đặt</label>
                <input
                  type="text"
                  value={fieldName}
                  disabled
                  style={{ cursor: "not-allowed" }}
                />
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

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", fontSize: "16px", padding: "14px" }}
                disabled={submitting}
              >
                {submitting ? "⏳ Đang xử lý..." : "✅ Xác nhận đặt sân"}
              </button>
            </form>

            {message && (
              <div className="alert-success" style={{ marginTop: "16px" }}>
                <span>✅</span>
                <div>
                  <strong>{message}</strong>
                  <div style={{ marginTop: "8px", fontSize: "14px" }}>
                    <Link to="/my-schedule" style={{ color: "#15803d", fontWeight: 700 }}>
                      → Xem trong Lịch của tôi
                    </Link>
                  </div>
                </div>
              </div>
            )}
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
