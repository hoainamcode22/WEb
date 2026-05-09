import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getBookings, getMatches, getMatchPlayers } from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    id: "",
    name: "",
    role: "",
    joinedMatches: 0,
    bookings: 0,
    noShowCount: 1,
    penaltyTotal: 10000,
    status: "Hoạt động",
    player_id: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !savedUser) {
      navigate("/login");
      return;
    }

    let parsedUser = null;

    try {
      parsedUser = JSON.parse(savedUser);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const [bookingData, matchData] = await Promise.all([
          getBookings(),
          getMatches(),
        ]);

        const myBookings = bookingData.filter(
          (booking) => Number(booking.user_id) === Number(parsedUser.id)
        );

        let joinedCount = 0;
        for (const match of matchData) {
          try {
            const players = await getMatchPlayers(match.id);
            const joined = players.some(
              (player) => Number(player.id) === Number(parsedUser.player_id)
            );
            if (joined) joinedCount += 1;
          } catch (error) {
            console.error("Lỗi lấy danh sách người chơi:", error);
          }
        }

        setUser({
          id: parsedUser.id,
          name: parsedUser.username,
          role: parsedUser.role === "admin" ? "Quản trị viên" : "Người dùng",
          rawRole: parsedUser.role,
          joinedMatches: joinedCount,
          bookings: myBookings.length,
          noShowCount: 1,
          penaltyTotal: 10000,
          status: "Hoạt động",
          player_id: parsedUser.player_id,
          email: parsedUser.email,
          phone: parsedUser.phone,
        });
      } catch (error) {
        console.error("Lỗi tải dữ liệu hồ sơ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  return (
    <div>
      <Navbar />

      <div className="container page-section">
        <div className="match-page-head">
          <div>
            <span className="page-badge">👤 Thông tin cá nhân</span>
            <h1 className="section-title" style={{ marginTop: "10px" }}>Hồ sơ của tôi</h1>
            <p className="section-subtitle">
              Theo dõi hồ sơ người dùng, lịch sử tham gia và trạng thái hoạt động.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin hồ sơ...</p>
          </div>
        ) : (
          <div className="profile-layout">
            <div className="profile-card-main">
              <div className="profile-header">
                <div className="profile-avatar">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h2>{user.name}</h2>
                  <p style={{ marginBottom: "8px", color: "#64748b" }}>
                    ID người dùng: #{user.id}
                    {user.player_id && ` · Player #${user.player_id}`}
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span className={`status-badge status-${user.rawRole || "user"}`}>
                      {user.role}
                    </span>
                    <span className="status-badge status-confirmed">
                      ✅ {user.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat Row */}
              <div className="profile-stat-row">
                <div className="profile-stat-chip">
                  <strong className="stat-number">{user.joinedMatches}</strong>
                  <span className="stat-label">Trận tham gia</span>
                </div>
                <div className="profile-stat-chip">
                  <strong className="stat-number">{user.bookings}</strong>
                  <span className="stat-label">Lần đặt sân</span>
                </div>
                <div className="profile-stat-chip">
                  <strong className="stat-number" style={{ color: user.noShowCount > 0 ? "#dc2626" : "#16944c" }}>
                    {user.noShowCount}
                  </strong>
                  <span className="stat-label">Vắng mặt</span>
                </div>
              </div>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span>Tên đăng nhập</span>
                  <strong>{user.name}</strong>
                </div>
                <div className="profile-info-item">
                  <span>Vai trò hệ thống</span>
                  <strong>{user.role}</strong>
                </div>
                <div className="profile-info-item">
                  <span>Email</span>
                  <strong>{user.email || "Chưa cập nhật"}</strong>
                </div>
                <div className="profile-info-item">
                  <span>Số điện thoại</span>
                  <strong>{user.phone || "Chưa cập nhật"}</strong>
                </div>
              </div>
            </div>

            <div className="profile-side-card">
              <h3>🏆 Uy tín tham gia</h3>
              <p style={{ marginBottom: "18px" }}>
                Người dùng cần tham gia đúng lịch đã đăng ký để tránh bị giảm uy tín
                và bị trừ phí vi phạm.
              </p>

              <div className="profile-penalty-box">
                <span>💸 Tổng tiền bị phạt</span>
                <strong>{user.penaltyTotal.toLocaleString("vi-VN")} VNĐ</strong>
              </div>

              {user.noShowCount > 0 && (
                <div className="notice-box-warning" style={{ marginTop: "18px" }}>
                  ⚠️ Bạn có <strong>{user.noShowCount} lần</strong> vắng mặt. Mỗi lần vắng mặt bị trừ <strong>10.000 VNĐ</strong>.
                </div>
              )}

              <div style={{ marginTop: "18px", padding: "18px", background: "var(--surface-soft)", borderRadius: "16px", border: "1px solid var(--surface-line)" }}>
                <h4 style={{ marginBottom: "12px", fontSize: "16px", color: "#102418" }}>📋 Quy định tham gia</h4>
                <ul style={{ paddingLeft: "18px", display: "grid", gap: "8px", color: "#64748b", fontSize: "14px" }}>
                  <li>Đăng ký tham gia trận phải đến đúng giờ.</li>
                  <li>Nếu không đến sẽ bị trừ 10.000 VNĐ.</li>
                  <li>Tiền cọc đặt sân được xử lý thủ công bởi admin.</li>
                  <li>Liên hệ admin để hoàn cọc sau trận.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
