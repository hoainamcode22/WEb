import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/api";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      setCurrentUser(null);
      return;
    }

    // Demo tokens: use saved user directly, skip API call
    if (token.startsWith("demo-token-") && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        setCurrentUser(null);
      }
      return;
    }

    const loadCurrentUser = async () => {
      // Optimistic: show saved user immediately
      if (savedUser) {
        try { setCurrentUser(JSON.parse(savedUser)); } catch {}
      }
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      } catch (error) {
        console.error("Lỗi lấy user hiện tại:", error);
        // Don't remove token/user on API failure — keep session
      }
    };

    loadCurrentUser();
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const getAvatarLetter = (username) => {
    if (!username) return "U";
    return username.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar sidebar-navbar">
      <div className="container navbar-inner sidebar-inner">
        <Link to="/" className="logo sidebar-logo">
          <span className="logo-mark">⚽</span>
          <div className="sidebar-brand">
            <span className="logo-text">
              Đặt <span className="logo-highlight">Sân Bóng</span>
            </span>
            <span className="sidebar-brand-subtitle">Football booking platform</span>
          </div>
        </Link>

        <div className="nav-search sidebar-search">
          <input
            type="text"
            placeholder="🔍 Tìm sân bóng hoặc trận bóng..."
            readOnly
          />
        </div>

        <div className="nav-links sidebar-links">
          <Link className={isActive("/") ? "nav-link active" : "nav-link"} to="/">
            <span className="nav-icon">🏠</span>
            <span>Trang chủ</span>
          </Link>

          <Link
            className={isActive("/matches") ? "nav-link active" : "nav-link"}
            to="/matches"
          >
            <span className="nav-icon">⚽</span>
            <span>Tìm trận</span>
          </Link>

          <Link
            className={isActive("/fields") ? "nav-link active" : "nav-link"}
            to="/fields"
          >
            <span className="nav-icon">🏟️</span>
            <span>Sân bóng</span>
          </Link>

          {currentUser && (
            <>
              <div className="sidebar-separator"></div>

              <Link
                className={isActive("/my-schedule") ? "nav-link active" : "nav-link"}
                to="/my-schedule"
              >
                <span className="nav-icon">📅</span>
                <span>Lịch của tôi</span>
              </Link>

              <Link
                className={isActive("/profile") ? "nav-link active" : "nav-link"}
                to="/profile"
              >
                <span className="nav-icon">👤</span>
                <span>Hồ sơ</span>
              </Link>
            </>
          )}

          {currentUser?.role === "admin" && (
            <>
              <div className="sidebar-separator"></div>
              <div className="sidebar-admin-title">Quản trị viên</div>

              <Link
                className={isActive("/admin") && location.pathname === "/admin" ? "nav-link active" : "nav-link"}
                to="/admin"
              >
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </Link>

              <Link
                className={isActive("/admin/bookings") ? "nav-link active" : "nav-link"}
                to="/admin/bookings"
              >
                <span className="nav-icon">📋</span>
                <span>Quản lý booking</span>
              </Link>

              <Link
                className={isActive("/admin/users") ? "nav-link active" : "nav-link"}
                to="/admin/users"
              >
                <span className="nav-icon">👥</span>
                <span>Quản lý người dùng</span>
              </Link>

              <Link
                className={isActive("/admin/fields") ? "nav-link active" : "nav-link"}
                to="/admin/fields"
              >
                <span className="nav-icon">🏟️</span>
                <span>Quản lý sân</span>
              </Link>

              <Link
                className={isActive("/admin/matches") ? "nav-link active" : "nav-link"}
                to="/admin/matches"
              >
                <span className="nav-icon">⚽</span>
                <span>Quản lý trận</span>
              </Link>
            </>
          )}
        </div>

        <div className="nav-user sidebar-user">
          {currentUser ? (
            <div className="sidebar-user-card">
              <div className="sidebar-user-info">
                <div className="sidebar-user-avatar">
                  {getAvatarLetter(currentUser.username)}
                </div>
                <div className="sidebar-user-info-text">
                  <span className="sidebar-user-name">{currentUser.username}</span>
                  <span className="sidebar-user-role">
                    {currentUser.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </span>
                </div>
              </div>

              <button
                className="btn-outline nav-logout-btn"
                onClick={handleLogout}
                type="button"
                style={{ width: "100%", justifyContent: "center" }}
              >
                🚪 Đăng xuất
              </button>
            </div>
          ) : (
            <div className="sidebar-user-card">
              <Link to="/login" className="btn-outline nav-auth-btn" style={{ display: "block", textAlign: "center" }}>
                Đăng nhập
              </Link>
              <Link to="/register" className="nav-user-btn nav-auth-btn" style={{ display: "block", textAlign: "center", padding: "13px 14px", borderRadius: "16px", background: "linear-gradient(135deg, #22c55e, #16944c)", color: "#fff", fontWeight: 800 }}>
                Đăng ký miễn phí
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
