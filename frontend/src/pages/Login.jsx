import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const DEMO_ACCOUNTS = {
  testuser: {
    password: "123456",
    user: { id: 1, username: "testuser", role: "user",  email: "user@demo.com",  phone: "0901234567", player_id: 1 },
  },
  admin: {
    password: "admin123",
    user: { id: 2, username: "admin", role: "admin", email: "admin@demo.com", phone: "0909999888", player_id: 2 },
  },
};

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");

    if (!formData.username || !formData.password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    const demo = DEMO_ACCOUNTS[formData.username];
    if (demo && demo.password === formData.password) {
      localStorage.setItem("token", "demo-token-" + demo.user.role);
      localStorage.setItem("user", JSON.stringify(demo.user));
      setMessage("Đăng nhập thành công!");
      setTimeout(() => navigate("/"), 500);
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(formData);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      setMessage("Đăng nhập thành công!");
      setTimeout(() => navigate("/"), 600);
    } catch {
      setError("Sai tên đăng nhập hoặc mật khẩu.");
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

        <h1 className="auth-card-title">Chào mừng trở lại!</h1>
        <p className="auth-card-subtitle">
          Đăng nhập để đặt sân, tham gia trận đấu và quản lý lịch cá nhân.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username" type="text" name="username"
              value={formData.username} onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
            />
          </div>
          <div className="auth-form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password" type="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "🚀 Đăng nhập"}
          </button>
        </form>

        {message && (
          <div className="auth-alert-success" style={{ marginTop: 14 }}>✅ {message}</div>
        )}
        {error && (
          <div className="auth-alert-error" style={{ marginTop: 14 }}>⚠️ {error}</div>
        )}

        {/* Demo hint */}
        <div className="auth-demo-hint">
          <span>Demo nhanh:</span>
          <button onClick={() => setFormData({ username: "testuser", password: "123456" })}>
            👤 User
          </button>
          <button onClick={() => setFormData({ username: "admin", password: "admin123" })}>
            🛡️ Admin
          </button>
        </div>

        <div className="auth-card-footer">
          Chưa có tài khoản?{" "}
          <Link to="/register">Đăng ký miễn phí →</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
