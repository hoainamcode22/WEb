import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getFields, getMatches } from "../services/api";
import { formatDateTimeVN } from "../utils/format";

const DEMO_FIELDS = [
  { id: 1, name: "Sân Xanh Tân Bình", location: "Tân Bình, TP.HCM", price: 150000, status: "available" },
  { id: 2, name: "Sân Mini Gò Vấp",   location: "Gò Vấp, TP.HCM",   price: 120000, status: "available" },
  { id: 3, name: "Sân Futsal Bình Thạnh", location: "Bình Thạnh, TP.HCM", price: 180000, status: "unavailable" },
];

const DEMO_MATCHES = [
  { id: 1, title: "Giao lưu thứ 7 sáng", location: "Sân Xanh Tân Bình", time: "2026-05-10T08:00:00", max_players: 10 },
  { id: 2, title: "Đá bóng chiều Chủ Nhật", location: "Sân Mini Gò Vấp",  time: "2026-05-11T16:00:00", max_players: 14 },
  { id: 3, title: "Phong trào Q.Bình Thạnh", location: "Sân Futsal Bình Thạnh", time: "2026-05-12T18:30:00", max_players: 10 },
];

function Home() {
  const [allFields, setAllFields] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldData, matchData] = await Promise.all([
          getFields(),
          getMatches(),
        ]);
        if (fieldData.length === 0 && matchData.length === 0) {
          setAllFields(DEMO_FIELDS);
          setAllMatches(DEMO_MATCHES);
          setUsingDemo(true);
        } else {
          setAllFields(fieldData);
          setAllMatches(matchData);
        }
      } catch (error) {
        setAllFields(DEMO_FIELDS);
        setAllMatches(DEMO_MATCHES);
        setUsingDemo(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featuredFields = allFields.slice(0, 3);
  const featuredMatches = allMatches.slice(0, 3);

  const availableFields = allFields.filter(
    (f) => String(f.status).toLowerCase() === "available"
  ).length;

  const openMatches = allMatches.filter(
    (m) => !m.status || String(m.status).toLowerCase() === "open"
  ).length;

  return (
    <div>
      <Navbar />

      <main className="page-section">
        <div className="container">

          {/* HERO */}
          <section className="hero hero-premium">
            <div className="hero-content">
              <span className="hero-badge">🏆 Nền tảng bóng đá cộng đồng số 1</span>
              <h1>
                Đặt sân thông minh —<br />
                Tìm trận nhanh &amp; kết nối đồng đội
              </h1>
              <p>
                Một không gian dành cho người yêu bóng đá: dễ tìm sân, dễ tham gia
                trận đấu và dễ quản lý lịch hoạt động trong cùng một hệ thống trực quan.
              </p>

              <div className="hero-buttons">
                <Link to="/fields" className="btn-primary">
                  🏟️ Đặt sân ngay
                </Link>
                <Link to="/matches" className="btn-outline">
                  ⚽ Tìm trận bóng
                </Link>
              </div>

              <div className="hero-cta-strip">
                <span className="hero-cta-item">
                  <span className="hero-cta-item-dot"></span>
                  Đặt sân theo giờ
                </span>
                <span className="hero-cta-item">
                  <span className="hero-cta-item-dot"></span>
                  Tham gia trận cộng đồng
                </span>
                <span className="hero-cta-item">
                  <span className="hero-cta-item-dot"></span>
                  Quản lý lịch cá nhân
                </span>
              </div>
            </div>

            <div className="hero-card hero-card-premium">
              <div className="hero-card-top">
                <span className="hero-card-chip">⚽ Football Platform</span>
                <span className="hero-card-chip muted">🟢 Đang hoạt động</span>
              </div>

              <h2>Thống kê hệ thống</h2>
              <p className="hero-card-desc">
                Số liệu thực tế từ hệ thống, cập nhật theo dữ liệu mới nhất.
              </p>

              <div className="hero-stats">
                <div className="stat-box motion-delay-1">
                  <h3>{loading ? "..." : allFields.length}</h3>
                  <p>🏟️ Tổng số sân</p>
                </div>
                <div className="stat-box motion-delay-2">
                  <h3>{loading ? "..." : availableFields}</h3>
                  <p>✅ Sân còn trống</p>
                </div>
                <div className="stat-box motion-delay-3">
                  <h3>{loading ? "..." : allMatches.length}</h3>
                  <p>⚽ Tổng trận đấu</p>
                </div>
                <div className="stat-box motion-delay-4">
                  <h3>10K</h3>
                  <p>💸 Phí vắng mặt (VNĐ)</p>
                </div>
              </div>
            </div>
          </section>

          {/* DEMO MODE NOTICE */}
          {!loading && usingDemo && (
            <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "14px", padding: "12px 18px", marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span style={{ fontSize: "14px", color: "#92400e", fontWeight: 600 }}>
                Đang hiển thị dữ liệu mẫu (database chưa kết nối). Tính năng đặt sân và tham gia trận vẫn hoạt động với tài khoản demo.
              </span>
            </div>
          )}

          {/* STATS ROW */}
          {!loading && (
            <div className="home-stats-row">
              <div className="home-stat-card motion-delay-1">
                <div className="home-stat-icon">🏟️</div>
                <div className="home-stat-number">{allFields.length}</div>
                <div className="home-stat-label">Sân bóng trong hệ thống</div>
              </div>
              <div className="home-stat-card motion-delay-2">
                <div className="home-stat-icon">✅</div>
                <div className="home-stat-number">{availableFields}</div>
                <div className="home-stat-label">Sân còn trống hôm nay</div>
              </div>
              <div className="home-stat-card motion-delay-3">
                <div className="home-stat-icon">⚽</div>
                <div className="home-stat-number">{openMatches}</div>
                <div className="home-stat-label">Trận đang tuyển người</div>
              </div>
              <div className="home-stat-card motion-delay-4">
                <div className="home-stat-icon">👥</div>
                <div className="home-stat-number">{allMatches.length}</div>
                <div className="home-stat-label">Tổng trận đấu đã tạo</div>
              </div>
            </div>
          )}

          {/* BANNER NOTICE */}
          <div className="football-banner football-banner-premium motion-delay-2">
            <div className="football-banner-inner">
              <span className="badge-warning">
                ⚠️ Lưu ý: Người đăng ký nhưng không đến sẽ bị phạt 10.000 VNĐ.
              </span>
              <h2>Tập trung vào trải nghiệm tổ chức và tham gia trận đấu</h2>
              <p>
                Tìm trận, tìm người chơi cùng, đặt sân, quản lý lịch và xử lý
                trạng thái tham gia trong một giao diện thống nhất và chuyên nghiệp.
              </p>
            </div>
          </div>

          {/* TÍNH NĂNG NỔI BẬT */}
          <section className="home-block" style={{ paddingBottom: 0 }}>
            <div className="section-head">
              <div>
                <h2 className="section-title">Tính năng nổi bật</h2>
                <p className="section-subtitle">
                  Hướng đến một nền tảng bóng đá thực tế, trực quan và dễ sử dụng.
                </p>
              </div>
            </div>

            <div className="feature-grid home-feature-grid">
              <div className="feature-card motion-delay-1">
                <div className="feature-icon">⚽</div>
                <h3>Tìm trận phù hợp</h3>
                <p>
                  Xem các trận đang mở, địa điểm thi đấu và số lượng người còn thiếu
                  để tham gia nhanh hơn. Lọc theo trình độ, thời gian hoặc khu vực.
                </p>
              </div>

              <div className="feature-card motion-delay-2">
                <div className="feature-icon">🏟️</div>
                <h3>Đặt sân nhanh chóng</h3>
                <p>
                  Chọn sân, chọn ngày và khung giờ phù hợp để hoàn tất booking chỉ
                  trong vài bước đơn giản. Xem lịch đặt sân trực tiếp.
                </p>
              </div>

              <div className="feature-card motion-delay-3">
                <div className="feature-icon">🛡️</div>
                <h3>Quản trị tập trung</h3>
                <p>
                  Theo dõi dữ liệu booking, người dùng, sân bóng và trận đấu với khu
                  quản trị tách biệt, đầy đủ thống kê và bảng điều hành chi tiết.
                </p>
              </div>
            </div>
          </section>

          {/* SÂN BÓNG NỔI BẬT */}
          <section className="home-block" style={{ paddingBottom: 0 }}>
            <div className="section-head">
              <div>
                <h2 className="section-title">Sân bóng nổi bật</h2>
                <p className="section-subtitle">
                  {allFields.length > 0
                    ? `${allFields.length} sân đang có trong hệ thống · ${availableFields} sân còn trống`
                    : "Danh sách sân bóng đang có trong hệ thống."}
                </p>
              </div>
              <Link to="/fields" className="section-link">
                Xem tất cả →
              </Link>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải sân bóng...</p>
              </div>
            ) : featuredFields.length === 0 ? (
              <div className="empty-box">
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>🏟️</div>
                Hiện chưa có sân nào để hiển thị.
              </div>
            ) : (
              <div className="match-card-grid">
                {featuredFields.map((field, index) => (
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
                        {field.status === "available" && <span style={{ background: "rgba(47,255,99,0.15)", color: "#2fff63" }}>Còn trống</span>}
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
          </section>

          {/* TRẬN ĐANG TUYỂN NGƯỜI */}
          <section className="home-block">
            <div className="section-head">
              <div>
                <h2 className="section-title">Trận đang tuyển người</h2>
                <p className="section-subtitle">
                  {allMatches.length > 0
                    ? `${allMatches.length} trận đang mở đăng ký · Chọn trận phù hợp để tham gia cùng cộng đồng.`
                    : "Chọn trận phù hợp để tham gia cùng cộng đồng bóng đá."}
                </p>
              </div>
              <Link to="/matches" className="section-link">
                Xem tất cả →
              </Link>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải trận đấu...</p>
              </div>
            ) : featuredMatches.length === 0 ? (
              <div className="empty-box">
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>⚽</div>
                Hiện chưa có trận nào để hiển thị.
              </div>
            ) : (
              <div className="match-card-grid">
                {featuredMatches.map((match, index) => (
                  <div
                    key={match.id}
                    className={`modern-match-card motion-delay-${(index % 5) + 1}`}
                  >
                    <div className="modern-match-image">
                      <span className="modern-match-badge">OPEN MATCH</span>
                      <span className="modern-match-level">Phong trào</span>
                    </div>

                    <div className="modern-match-content">
                      <h3>{match.title}</h3>
                      <p className="modern-match-location">📍 {match.location}</p>

                      <div className="modern-match-meta">
                        <div>
                          <span>THỜI GIAN</span>
                          <strong>{formatDateTimeVN(match.time) || match.time}</strong>
                        </div>
                        <div>
                          <span>SỨC CHỨA</span>
                          <strong>{match.max_players} người</strong>
                        </div>
                      </div>

                      <div className="modern-match-footer">
                        <div className="modern-match-status">
                          <span className="status-dot"></span>
                          Đang tuyển người
                        </div>
                        <Link to={`/matches/${match.id}`}>
                          <button className="modern-match-btn">Xem chi tiết</button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
