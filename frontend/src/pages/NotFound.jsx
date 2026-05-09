import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function NotFound() {
  return (
    <div>
      <Navbar />

      <div className="container page-section">
        <div
          className="simple-card"
          style={{
            textAlign: "center",
            padding: "60px 24px",
            maxWidth: "720px",
            margin: "0 auto",
          }}
        >
          <span className="hero-badge">404</span>
          <h1 style={{ marginTop: "18px", marginBottom: "12px" }}>
            Không tìm thấy trang
          </h1>
          <p className="section-subtitle" style={{ marginBottom: "24px" }}>
            Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Link to="/" className="btn-primary">
              Về trang chủ
            </Link>

            <Link to="/fields" className="btn-outline">
              Xem sân bóng
            </Link>

            <Link to="/matches" className="btn-outline">
              Tìm trận bóng
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default NotFound;