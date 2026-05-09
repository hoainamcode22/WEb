import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer footer-fade">
      <div className="container footer-top">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-mark">⚽</span>
            <span className="footer-logo-text">
              Đặt <span>Sân Bóng</span>
            </span>
          </div>

          <p className="footer-desc">
            Nền tảng dành cho người yêu bóng đá: tìm trận phù hợp, đặt sân dễ hơn
            và quản lý hoạt động chơi bóng trong cùng một hệ thống hiện đại, trực quan.
          </p>

          <div className="footer-badges">
            <span>⚡ Đặt sân nhanh</span>
            <span>🔍 Tìm trận dễ</span>
            <span>🛡️ Quản lý tập trung</span>
          </div>

          <div className="footer-contact-row">
            <div className="footer-contact-item">
              <span>📧</span>
              <span>support@datsanbong.vn</span>
            </div>
            <div className="footer-contact-item">
              <span>📞</span>
              <span>0909 123 456</span>
            </div>
            <div className="footer-contact-item">
              <span>📍</span>
              <span>TP. Hồ Chí Minh, Việt Nam</span>
            </div>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="footer-col">
          <h4>Điều hướng nhanh</h4>
          <div className="footer-links">
            <Link to="/">🏠 Trang chủ</Link>
            <Link to="/matches">⚽ Tìm trận bóng</Link>
            <Link to="/fields">🏟️ Danh sách sân</Link>
            <Link to="/my-schedule">📅 Lịch của tôi</Link>
            <Link to="/profile">👤 Hồ sơ cá nhân</Link>
          </div>
        </div>

        {/* System Info */}
        <div className="footer-col">
          <h4>Hệ thống</h4>
          <div className="footer-links footer-text-list">
            <p>📋 Đặt sân theo khung giờ linh hoạt</p>
            <p>🤝 Tham gia trận bóng cộng đồng</p>
            <p>📊 Quản lý lịch đặt sân cá nhân</p>
            <p>👥 Theo dõi hoạt động người chơi</p>
            <p>🛡️ Khu quản trị dành cho admin</p>
          </div>
        </div>

      </div>

      <div className="container footer-bottom">
        <span>© {year} ĐặtSânBóng · Nền tảng bóng đá cộng đồng hiện đại.</span>
        <span>Xây dựng với ❤️ dành cho cộng đồng bóng đá Việt Nam</span>
      </div>
    </footer>
  );
}

export default Footer;
