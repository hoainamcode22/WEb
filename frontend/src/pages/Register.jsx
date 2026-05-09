import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");

    if (!formData.username || !formData.password) {
      setError("Tên đăng nhập và mật khẩu là bắt buộc.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(formData);
      setMessage(result.message || "Đăng ký thành công! Đang chuyển đến đăng nhập...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-full-bg">
      {/* Floating shapes */}
      <div className="auth-shape auth-shape-1" />
      <div className="auth-shape auth-shape-2" />
      <div className="auth-shape auth-shape-3" />

      <div className="auth-center-card">
        {/* Logo */}
        <Link to="/" className="auth-card-logo">
          <span className="auth-card-logo-icon">⚽</span>
          <span className="auth-card-logo-text">
            Đặt <span>Sân Bóng</span>
          </span>
        </Link>

        <h1 className="auth-card-title">Tạo tài khoản mới</h1>
        <p className="auth-card-subtitle">
          Đăng ký miễn phí để đặt sân, tham gia trận đấu và kết nối cộng đồng bóng đá.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="username">
              Tên đăng nhập <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="username" type="text" name="username"
              value={formData.username} onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password">
              Mật khẩu <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="password" type="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="example@email.com (không bắt buộc)"
              autoComplete="email"
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              id="phone" type="tel" name="phone"
              value={formData.phone} onChange={handleChange}
              placeholder="0901234567 (không bắt buộc)"
              autoComplete="tel"
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "🎉 Đăng ký miễn phí"}
          </button>
        </form>

        {message && (
          <div className="auth-alert-success" style={{ marginTop: 14 }}>✅ {message}</div>
        )}
        {error && (
          <div className="auth-alert-error" style={{ marginTop: 14 }}>⚠️ {error}</div>
        )}

        <div className="auth-card-footer">
          Đã có tài khoản?{" "}
          <Link to="/login">Đăng nhập ngay →</Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <Link to="/" style={{ color: "#9dbdaa", fontSize: "13px", textDecoration: "none" }}>
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
