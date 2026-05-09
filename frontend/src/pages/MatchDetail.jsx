import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMatches, getMatchPlayers, joinMatch } from "../services/api";
import { formatDateTimeVN } from "../utils/format";

function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
      return;
    }

    const fetchData = async () => {
      try {
        const [allMatches, playerData] = await Promise.all([
          getMatches(),
          getMatchPlayers(id),
        ]);
        const foundMatch = allMatches.find((m) => String(m.id) === String(id));
        setMatch(foundMatch || null);
        setPlayers(playerData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleJoin = async () => {
    setMessage("");
    setError("");

    if (!currentUser?.player_id) {
      setError("Tài khoản của bạn chưa được liên kết với hồ sơ cầu thủ.");
      return;
    }

    const isJoined = players.some(
      (player) => Number(player.id) === Number(currentUser.player_id)
    );

    if (isJoined) {
      setError("Bạn đã tham gia trận này rồi.");
      return;
    }

    if (match && players.length >= Number(match.max_players)) {
      setError("Trận đấu đã đủ số lượng người tham gia.");
      return;
    }

    try {
      const result = await joinMatch({ match_id: Number(id) });
      setMessage(result.message || "Tham gia trận thành công");

      const playerData = await getMatchPlayers(id);
      setPlayers(playerData);
    } catch (err) {
      setError(err.message);
    }
  };

  const getPlayerName = (player) => {
    return (
      player.player_name ||
      player.name ||
      player.full_name ||
      player.username ||
      `Cầu thủ #${player.id}`
    );
  };

  const spotsLeft = match ? Number(match.max_players) - players.length : 0;
  const isFull = match ? players.length >= Number(match.max_players) : false;
  const isAlreadyJoined = currentUser
    ? players.some((p) => Number(p.id) === Number(currentUser.player_id))
    : false;

  return (
    <div>
      <Navbar />

      <div className="container page-section">
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải chi tiết trận đấu...</p>
          </div>
        )}

        {!loading && error && !match && (
          <div className="empty-box">{error}</div>
        )}

        {!loading && match && (
          <>
            <div className="detail-hero">
              <div className="detail-hero-left">
                <span className="page-badge">⚽ Chi tiết trận đấu</span>
                <h1>{match.title}</h1>
                <p>
                  Xem thông tin trận, kiểm tra số lượng người tham gia và đăng ký
                  ngay nếu còn chỗ trống.
                </p>

                <div className="quick-stat-row">
                  <div className="quick-stat-chip">
                    <strong>{players.length}</strong>
                    <span>Đã tham gia</span>
                  </div>
                  <div className="quick-stat-chip">
                    <strong>{match.max_players}</strong>
                    <span>Tối đa</span>
                  </div>
                  <div className="quick-stat-chip">
                    <strong style={{ color: spotsLeft > 0 ? "#31ff69" : "#f87171" }}>
                      {spotsLeft}
                    </strong>
                    <span>Còn trống</span>
                  </div>
                </div>

                <div className="detail-tags" style={{ marginTop: "16px" }}>
                  {isFull ? (
                    <span style={{ background: "#fee2e2", color: "#991b1b", padding: "7px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: 800 }}>
                      ❌ Đã đủ người
                    </span>
                  ) : (
                    <span className="match-badge">🟢 Đang mở đăng ký</span>
                  )}
                  <span className="detail-tag">{spotsLeft} chỗ còn lại</span>
                </div>
              </div>

              <div className="detail-hero-right">
                <div className="detail-info-box">
                  <h3>📋 Thông tin nhanh</h3>
                  <p>📍 <strong>Địa điểm:</strong> {match.location}</p>
                  <p>🕐 <strong>Thời gian:</strong> {formatDateTimeVN(match.time) || match.time}</p>
                  <p>👥 <strong>Số người tối đa:</strong> {match.max_players}</p>
                  <p>✅ <strong>Đã tham gia:</strong> {players.length} người</p>
                </div>
              </div>
            </div>

            <div className="detail-layout">
              <div className="simple-card">
                <h2 style={{ marginBottom: "16px" }}>Đăng ký tham gia</h2>

                <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
                  <p className="match-info">📍 <strong>Địa điểm:</strong> {match.location}</p>
                  <p className="match-info">🕐 <strong>Thời gian:</strong> {formatDateTimeVN(match.time) || match.time}</p>
                  <p className="match-info">👥 <strong>Tối đa:</strong> {match.max_players} người</p>
                  <p className="match-info">✅ <strong>Đã tham gia:</strong> {players.length} người</p>
                  <p className="match-info">
                    🔢 <strong>Còn trống:</strong>{" "}
                    <span style={{ color: spotsLeft > 0 ? "#16944c" : "#dc2626", fontWeight: 800 }}>
                      {spotsLeft} chỗ
                    </span>
                  </p>
                </div>

                <div className="notice-box-warning">
                  ⚠️ Nếu đã đăng ký nhưng không đến, bạn sẽ bị trừ <strong>10.000 VNĐ</strong>.
                </div>

                <div className="join-form-section">
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 800, color: "#264534" }}>
                      Tài khoản tham gia
                    </label>
                    <input
                      type="text"
                      value={currentUser?.username || ""}
                      className="single-input"
                      disabled
                      style={{ width: "100%" }}
                    />
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: "100%" }}
                    onClick={handleJoin}
                    disabled={isFull || isAlreadyJoined}
                  >
                    {isAlreadyJoined ? "✅ Đã tham gia trận này" : isFull ? "❌ Đã đủ người" : "⚽ Tham gia trận ngay"}
                  </button>
                </div>

                {message && (
                  <div className="alert-success">✅ {message}</div>
                )}
                {error && (
                  <div className="alert-error">⚠️ {error}</div>
                )}
              </div>

              <div className="simple-card">
                <h2 style={{ marginBottom: "16px" }}>
                  Danh sách tham gia ({players.length}/{match.max_players})
                </h2>

                {players.length === 0 ? (
                  <div className="players-table-empty">
                    Chưa có ai tham gia trận này.
                  </div>
                ) : (
                  <div className="table-wrap" style={{ boxShadow: "none", padding: 0, background: "transparent", border: "none" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Tên cầu thủ</th>
                          <th>ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((player, idx) => (
                          <tr key={player.id}>
                            <td style={{ fontWeight: 700, color: "#16944c" }}>{idx + 1}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{
                                  width: "28px", height: "28px", borderRadius: "50%",
                                  background: "linear-gradient(135deg,#22c55e,#16944c)",
                                  color: "white", fontWeight: 900, fontSize: "12px",
                                  display: "grid", placeItems: "center", flexShrink: 0
                                }}>
                                  {getPlayerName(player).charAt(0).toUpperCase()}
                                </div>
                                {getPlayerName(player)}
                              </div>
                            </td>
                            <td>#{player.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default MatchDetail;
