import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import StatusBadge from "../components/StatusBadge";
import { getBookings, getMatches, getMatchPlayers } from "../services/api";
import { formatDateVN, formatTimeVN, formatDateTimeVN } from "../utils/format";

function MySchedule() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");

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
      setCurrentUser(parsedUser);
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [bookingData, matchData] = await Promise.all([
          getBookings(),
          getMatches(),
        ]);

        setBookings(bookingData);

        const joinedMatches = [];
        for (const match of matchData) {
          try {
            const players = await getMatchPlayers(match.id);
            const joined = players.some(
              (player) => Number(player.id) === Number(parsedUser.player_id)
            );
            if (joined) {
              joinedMatches.push({ ...match, playersCount: players.length });
            }
          } catch (error) {
            console.error("Lỗi lấy danh sách người chơi:", error);
          }
        }

        setMyMatches(joinedMatches);
      } catch (error) {
        console.error("Lỗi tải dữ liệu lịch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter(
      (booking) => Number(booking.user_id) === Number(currentUser.id)
    );
  }, [bookings, currentUser]);

  return (
    <div>
      <Navbar />

      <div className="container page-section">
        <div className="match-page-head">
          <div>
            <span className="page-badge">📅 Lịch cá nhân</span>
            <h1 className="section-title" style={{ marginTop: "10px" }}>Lịch của tôi</h1>
            <p className="section-subtitle">
              Theo dõi các sân đã đặt và các trận bóng bạn đã đăng ký tham gia.
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="tab-bar">
          <button
            className={`tab-btn${activeTab === "bookings" ? " active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            🏟️ Sân đã đặt
            {!loading && <span style={{ marginLeft: "6px", background: "rgba(22,148,76,0.12)", borderRadius: "999px", padding: "1px 8px", fontSize: "12px" }}>{myBookings.length}</span>}
          </button>
          <button
            className={`tab-btn${activeTab === "matches" ? " active" : ""}`}
            onClick={() => setActiveTab("matches")}
          >
            ⚽ Trận đã tham gia
            {!loading && <span style={{ marginLeft: "6px", background: "rgba(22,148,76,0.12)", borderRadius: "999px", padding: "1px 8px", fontSize: "12px" }}>{myMatches.length}</span>}
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải lịch của bạn...</p>
          </div>
        ) : (
          <>
            {activeTab === "bookings" && (
              <section>
                <div className="section-head" style={{ marginBottom: "16px" }}>
                  <div>
                    <h2 className="section-title">Sân đã đặt</h2>
                    <p className="section-subtitle">
                      Danh sách các lịch đặt sân gắn với tài khoản của bạn.
                    </p>
                  </div>
                </div>

                {myBookings.length === 0 ? (
                  <div className="empty-box">
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏟️</div>
                    Bạn chưa có booking nào. Hãy{" "}
                    <a href="/fields" style={{ color: "var(--primary-dark)", fontWeight: 800 }}>
                      khám phá sân bóng
                    </a>{" "}
                    và đặt sân ngay!
                  </div>
                ) : (
                  <div className="schedule-grid">
                    {myBookings.map((booking, index) => (
                      <div
                        key={booking.id}
                        className={`schedule-card motion-delay-${(index % 5) + 1}`}
                      >
                        <div className="schedule-card-top" style={{ flexWrap: "wrap", gap: "6px" }}>
                          <span className="schedule-badge">🏟️ Đặt sân</span>
                          <StatusBadge status={booking.status} />
                        </div>

                        <h3>{booking.field_name || `Sân #${booking.field_id}`}</h3>

                        <p>📅 <strong>Ngày:</strong> {formatDateVN(booking.booking_date) || "—"}</p>
                        <p>
                          🕐 <strong>Khung giờ:</strong>{" "}
                          {formatTimeVN(booking.start_time)} – {formatTimeVN(booking.end_time)}
                        </p>
                        <p>🔖 <strong>Mã booking:</strong> #{booking.id}</p>
                        <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "#66756d", fontWeight: 600 }}>Cọc:</span>
                          <StatusBadge status={booking.deposit_status || "unpaid"} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "matches" && (
              <section>
                <div className="section-head" style={{ marginBottom: "16px" }}>
                  <div>
                    <h2 className="section-title">Trận đã tham gia</h2>
                    <p className="section-subtitle">
                      Những trận đấu mà bạn đã đăng ký tham gia.
                    </p>
                  </div>
                </div>

                {myMatches.length === 0 ? (
                  <div className="empty-box">
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚽</div>
                    Bạn chưa tham gia trận nào. Hãy{" "}
                    <a href="/matches" style={{ color: "var(--primary-dark)", fontWeight: 800 }}>
                      tìm trận phù hợp
                    </a>{" "}
                    và đăng ký ngay!
                  </div>
                ) : (
                  <div className="schedule-grid">
                    {myMatches.map((match, index) => (
                      <div
                        key={match.id}
                        className={`schedule-card schedule-card-dark motion-delay-${(index % 5) + 1}`}
                      >
                        <div className="schedule-card-top">
                          <span className="schedule-badge schedule-badge-green">⚽ Trận bóng</span>
                          <span className="schedule-status schedule-status-light">Đã đăng ký</span>
                        </div>

                        <h3>{match.title}</h3>

                        <p>📍 <strong>Địa điểm:</strong> {match.location}</p>
                        <p>🕐 <strong>Thời gian:</strong> {formatDateTimeVN(match.time) || match.time}</p>
                        <p>👥 <strong>Số người:</strong> {match.playersCount}/{match.max_players}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default MySchedule;
