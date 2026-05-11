const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = "football_app_secret_key_change_me";

// ===== MIDDLEWARE AUTH =====
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này" });
  }

  next();
};

// ===== TEST SERVER =====
app.get("/", (req, res) => {
  res.send("Football app server running ⚽");
});

// ===== AUTH: ĐĂNG KÝ =====
app.post("/auth/register", async (req, res) => {
  const { username, password, email, phone } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "username và password là bắt buộc",
    });
  }

  const checkUserSql = `
    SELECT id
    FROM users
    WHERE username = ? OR email = ?
  `;

  db.query(checkUserSql, [username, email || null], async (err, existingUsers) => {
    if (err) {
      console.log("Lỗi kiểm tra tài khoản tồn tại:", err);
      return res.status(500).json({ message: "Lỗi kiểm tra tài khoản" });
    }

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertPlayerSql = `
        INSERT INTO players (team_id, player_name, position)
        VALUES (?, ?, ?)
      `;

      db.query(insertPlayerSql, [null, username, "Chưa cập nhật"], (err, playerResult) => {
        if (err) {
          console.log("Lỗi tạo player khi đăng ký:", err);
          return res.status(500).json({ message: "Không thể tạo hồ sơ người chơi" });
        }

        const playerId = playerResult.insertId;

        const insertUserSql = `
          INSERT INTO users (username, password, phone, email, role, player_id)
          VALUES (?, ?, ?, ?, 'user', ?)
        `;

        db.query(
          insertUserSql,
          [username, hashedPassword, phone || null, email || null, playerId],
          (err, userResult) => {
            if (err) {
              console.log("Lỗi tạo user khi đăng ký:", err);
              return res.status(500).json({ message: "Không thể tạo tài khoản" });
            }

            res.json({
              message: "Đăng ký thành công",
              userId: userResult.insertId,
              playerId,
            });
          }
        );
      });
    } catch (error) {
      console.log("Lỗi hash password:", error);
      return res.status(500).json({ message: "Lỗi xử lý mật khẩu" });
    }
  });
});

// ===== AUTH: ĐĂNG NHẬP =====
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "username và password là bắt buộc",
    });
  }

  const sql = `
    SELECT id, username, password, email, phone, role, player_id
    FROM users
    WHERE username = ?
    LIMIT 1
  `;

  db.query(sql, [username], async (err, result) => {
    if (err) {
      console.log("Lỗi đăng nhập:", err);
      return res.status(500).json({ message: "Lỗi đăng nhập" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const user = result[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role,
          player_id: user.player_id,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Đăng nhập thành công",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          player_id: user.player_id,
        },
      });
    } catch (error) {
      console.log("Lỗi kiểm tra mật khẩu:", error);
      return res.status(500).json({ message: "Lỗi xác thực mật khẩu" });
    }
  });
});

// ===== AUTH: LẤY USER HIỆN TẠI =====
app.get("/auth/me", authenticateToken, (req, res) => {
  const sql = `
    SELECT id, username, email, phone, role, player_id, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) {
      console.log("Lỗi lấy thông tin user hiện tại:", err);
      return res.status(500).json({ message: "Không thể lấy thông tin người dùng" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.json(result[0]);
  });
});

// ===== LẤY DANH SÁCH USERS =====
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Lỗi lấy users:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ===== LẤY DANH SÁCH TRẬN =====
app.get("/matches", (req, res) => {
  const sql = `
    SELECT
      m.id,
      CONCAT('Trận #', m.id) AS title,
      COALESCE(f.field_name, 'Chưa xác định') AS location,
      CONCAT(
        DATE_FORMAT(COALESCE(b.booking_date, m.match_date), '%Y-%m-%d'),
        ' ',
        TIME_FORMAT(COALESCE(b.start_time, '00:00:00'), '%H:%i')
      ) AS time,
      COALESCE(m.max_players, 10) AS max_players,
      COALESCE(m.status, 'open') AS status,
      m.match_date,
      m.team1_id,
      m.team2_id,
      m.booking_id,
      (SELECT COUNT(*) FROM match_players mp WHERE mp.match_id = m.id) AS current_players
    FROM matches m
    LEFT JOIN booking b ON m.booking_id = b.id
    LEFT JOIN fields  f ON b.field_id   = f.id
    ORDER BY m.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Lỗi lấy matches:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ===== TẠO TRẬN BÓNG =====
app.post("/matches", (req, res) => {
  const { booking_id, team1_id, team2_id, match_date } = req.body;

  const sql = `
    INSERT INTO matches (booking_id, team1_id, team2_id, match_date)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [booking_id, team1_id, team2_id, match_date], (err, result) => {
    if (err) {
      console.log("Lỗi tạo match:", err);
      return res.status(500).json(err);
    }

    res.json({
      message: "Match created successfully",
      matchId: result.insertId,
    });
  });
});

// ===== THAM GIA TRẬN =====
app.post("/join", authenticateToken, (req, res) => {
  const { match_id } = req.body;
  const player_id = req.user.player_id;

  if (!player_id || !match_id) {
    return res.status(400).json({
      message: "match_id là bắt buộc và tài khoản phải được liên kết với player",
    });
  }

  const checkMatchSql = `SELECT id FROM matches WHERE id = ?`;
  const checkPlayerSql = `SELECT id FROM players WHERE id = ?`;
  const checkJoinedSql = `
    SELECT id
    FROM match_players
    WHERE match_id = ? AND player_id = ?
  `;
  const countPlayersSql = `
    SELECT COUNT(*) AS total
    FROM match_players
    WHERE match_id = ?
  `;
  const getMatchSql = `
    SELECT
      m.id,
      10 AS max_players
    FROM matches m
    WHERE m.id = ?
  `;
  const insertSql = `
    INSERT INTO match_players (match_id, player_id, goals, assists, yellow_cards, red_cards)
    VALUES (?, ?, 0, 0, 0, 0)
  `;

  db.query(checkMatchSql, [match_id], (err, matchResult) => {
    if (err) {
      console.log("Lỗi kiểm tra match:", err);
      return res.status(500).json({ message: "Lỗi kiểm tra trận đấu" });
    }

    if (matchResult.length === 0) {
      return res.status(404).json({ message: "Trận đấu không tồn tại" });
    }

    db.query(checkPlayerSql, [player_id], (err, playerResult) => {
      if (err) {
        console.log("Lỗi kiểm tra player:", err);
        return res.status(500).json({ message: "Lỗi kiểm tra cầu thủ" });
      }

      if (playerResult.length === 0) {
        return res.status(404).json({ message: "Cầu thủ không tồn tại" });
      }

      db.query(checkJoinedSql, [match_id, player_id], (err, joinedResult) => {
        if (err) {
          console.log("Lỗi kiểm tra tham gia trận:", err);
          return res.status(500).json({ message: "Lỗi kiểm tra tham gia trận" });
        }

        if (joinedResult.length > 0) {
          return res.status(400).json({ message: "Cầu thủ đã tham gia trận này rồi" });
        }

        db.query(getMatchSql, [match_id], (err, matchInfoResult) => {
          if (err) {
            console.log("Lỗi lấy thông tin match:", err);
            return res.status(500).json({ message: "Lỗi lấy thông tin trận đấu" });
          }

          const maxPlayers = Number(matchInfoResult[0]?.max_players || 10);

          db.query(countPlayersSql, [match_id], (err, countResult) => {
            if (err) {
              console.log("Lỗi đếm số người trong trận:", err);
              return res.status(500).json({ message: "Lỗi kiểm tra số lượng người chơi" });
            }

            const currentPlayers = Number(countResult[0]?.total || 0);

            if (currentPlayers >= maxPlayers) {
              return res.status(400).json({ message: "Trận đấu đã đủ số lượng người tham gia" });
            }

            db.query(insertSql, [match_id, player_id], (err, result) => {
              if (err) {
                console.log("Lỗi join match:", err);
                return res.status(500).json({ message: "Không thể tham gia trận đấu" });
              }

              // Kiểm tra nếu đủ người → đổi status sang "full"
              const newCount = currentPlayers + 1;
              if (newCount >= maxPlayers) {
                db.query(
                  `UPDATE matches SET status = 'full' WHERE id = ?`,
                  [match_id],
                  (updateErr) => {
                    if (updateErr) console.log("Lỗi cập nhật status match full:", updateErr);
                  }
                );
              }

              res.json({
                message: "Tham gia trận thành công!",
                id: result.insertId,
                currentPlayers: newCount,
                maxPlayers,
                isFull: newCount >= maxPlayers,
              });
            });
          });
        });
      });
    });
  });
});

// ===== XEM DANH SÁCH NGƯỜI TRONG TRẬN =====
app.get("/match/:id/players", (req, res) => {
  const matchId = req.params.id;

  const sql = `
    SELECT
      players.id,
      players.player_name,
      players.position,
      players.team_id
    FROM match_players
    JOIN players ON players.id = match_players.player_id
    WHERE match_players.match_id = ?
  `;

  db.query(sql, [matchId], (err, result) => {
    if (err) {
      console.log("Lỗi lấy players trong match:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ===== LẤY DANH SÁCH SÂN =====
app.get("/fields", (req, res) => {
  const sql = `
    SELECT
      id,
      field_name AS name,
      price_per_hour AS price,
      status,
      COALESCE(location, 'TP.HCM') AS location,
      description,
      field_type
    FROM fields
    ORDER BY id ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Lỗi lấy fields:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ===== LẤY CHI TIẾT 1 SÂN =====
app.get("/fields/:id", (req, res) => {
  const fieldId = req.params.id;

  const sql = `
    SELECT
      id,
      field_name AS name,
      price_per_hour AS price,
      status,
      COALESCE(location, 'TP.HCM') AS location,
      description,
      field_type
    FROM fields
    WHERE id = ?
  `;

  db.query(sql, [fieldId], (err, result) => {
    if (err) {
      console.log("Lỗi lấy chi tiết field:", err);
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Field not found" });
    }

    res.json(result[0]);
  });
});

// ===== LẤY DANH SÁCH BOOKING (user xem của mình) =====
app.get("/bookings", authenticateToken, (req, res) => {
  const sql = `
    SELECT
      b.id,
      b.user_id,
      b.field_id,
      b.booking_date,
      b.start_time,
      b.end_time,
      b.status,
      COALESCE(b.deposit_status, 'unpaid') AS deposit_status,
      COALESCE(b.deposit_amount, 0) AS deposit_amount,
      f.field_name AS field_name,
      u.username
    FROM booking b
    LEFT JOIN fields f ON b.field_id = f.id
    LEFT JOIN users  u ON b.user_id  = u.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC, b.id DESC
  `;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) {
      console.log("Lỗi lấy bookings:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ===== LẤY DANH SÁCH BOOKING CHO ADMIN =====
app.get("/admin/bookings", authenticateToken, requireAdmin, (req, res) => {
  const sql = `
    SELECT
      b.id,
      b.user_id,
      b.field_id,
      b.booking_date,
      b.start_time,
      b.end_time,
      b.status,
      COALESCE(b.deposit_status, 'unpaid') AS deposit_status,
      COALESCE(b.deposit_amount, 0) AS deposit_amount,
      f.field_name AS field_name,
      u.username
    FROM booking b
    LEFT JOIN fields f ON b.field_id = f.id
    LEFT JOIN users  u ON b.user_id  = u.id
    ORDER BY b.booking_date DESC, b.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Lỗi lấy bookings cho admin:", err);
      return res.status(500).json(err);
    }
    res.json(result);
  });
});

// ===== TẠO BOOKING =====
app.post("/bookings", authenticateToken, (req, res) => {
  const { field_id, booking_date, start_time, end_time, status } = req.body;
  const user_id = req.user.id;

  if (!field_id || !booking_date || !start_time || !end_time) {
    return res.status(400).json({
      message: "field_id, booking_date, start_time, end_time là bắt buộc",
    });
  }

  if (end_time <= start_time) {
    return res.status(400).json({
      message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
    });
  }

  const checkUserSql = `SELECT id FROM users WHERE id = ?`;
  const checkFieldSql = `SELECT id FROM fields WHERE id = ?`;
  const checkOverlapSql = `
    SELECT id
    FROM booking
    WHERE field_id = ?
      AND booking_date = ?
      AND start_time < ?
      AND end_time > ?
  `;
  const insertSql = `
    INSERT INTO booking (user_id, field_id, booking_date, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(checkUserSql, [user_id], (err, userResult) => {
    if (err) {
      console.log("Lỗi kiểm tra user:", err);
      return res.status(500).json({ message: "Lỗi kiểm tra người dùng" });
    }

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    db.query(checkFieldSql, [field_id], (err, fieldResult) => {
      if (err) {
        console.log("Lỗi kiểm tra field:", err);
        return res.status(500).json({ message: "Lỗi kiểm tra sân bóng" });
      }

      if (fieldResult.length === 0) {
        return res.status(404).json({ message: "Sân bóng không tồn tại" });
      }

      db.query(
        checkOverlapSql,
        [field_id, booking_date, end_time, start_time],
        (err, overlapResult) => {
          if (err) {
            console.log("Lỗi kiểm tra trùng lịch booking:", err);
            return res.status(500).json({ message: "Lỗi kiểm tra lịch đặt sân" });
          }

          if (overlapResult.length > 0) {
            return res.status(400).json({
              message: "Khung giờ này đã có người đặt sân",
            });
          }

          db.query(
            insertSql,
            [
              user_id,
              field_id,
              booking_date,
              start_time,
              end_time,
              status || "pending",
            ],
            (err, result) => {
              if (err) {
                console.log("Lỗi tạo booking:", err);
                return res.status(500).json({ message: "Không thể tạo booking" });
              }

              res.json({
                message: "Booking created successfully",
                bookingId: result.insertId,
              });
            }
          );
        }
      );
    });
  });
});
// ===== LẤY DANH SÁCH USERS CHO ADMIN =====
app.get("/admin/users", authenticateToken, requireAdmin, (req, res) => {
  const sql = `
    SELECT
      id,
      username,
      email,
      phone,
      role,
      player_id,
      created_at
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Lỗi lấy users cho admin:", err);
      return res.status(500).json({ message: "Không thể lấy danh sách người dùng" });
    }

    res.json(result);
  });
});
// ===== LẤY DANH SÁCH FIELDS CHO ADMIN =====
app.get("/admin/fields", authenticateToken, requireAdmin, (req, res) => {
  const sql = `
    SELECT
      id,
      field_name AS name,
      price_per_hour AS price,
      status,
      COALESCE(location, 'TP.HCM') AS location,
      description,
      field_type
    FROM fields
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Lỗi lấy fields cho admin:", err);
      return res.status(500).json({ message: "Không thể lấy danh sách sân bóng" });
    }

    res.json(result);
  });
});

// ===== THÊM SÂN MỚI =====
app.post("/admin/fields", authenticateToken, requireAdmin, (req, res) => {
  const { name, price, status, location, description, field_type } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Tên sân và giá là bắt buộc" });
  }

  const sql = `
    INSERT INTO fields (field_name, price_per_hour, status, location, description, field_type)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, price, status || "available", location || "TP.HCM", description || null, field_type || "5v5"],
    (err, result) => {
      if (err) {
        console.log("Lỗi thêm sân:", err);
        return res.status(500).json({ message: "Không thể thêm sân bóng" });
      }
      res.json({ message: "Thêm sân thành công", fieldId: result.insertId });
    }
  );
});

// ===== CẬP NHẬT SÂN =====
app.put("/admin/fields/:id", authenticateToken, requireAdmin, (req, res) => {
  const fieldId = req.params.id;
  const { name, price, status, location, description, field_type } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Tên sân và giá là bắt buộc" });
  }

  const sql = `
    UPDATE fields
    SET field_name = ?, price_per_hour = ?, status = ?, location = ?, description = ?, field_type = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, price, status || "available", location || "TP.HCM", description || null, field_type || "5v5", fieldId],
    (err, result) => {
      if (err) {
        console.log("Lỗi cập nhật sân:", err);
        return res.status(500).json({ message: "Không thể cập nhật sân bóng" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Sân bóng không tồn tại" });
      }
      res.json({ message: "Cập nhật sân thành công" });
    }
  );
});

// ===== ĐỔI TRẠNG THÁI SÂN =====
app.put("/admin/fields/:id/status", authenticateToken, requireAdmin, (req, res) => {
  const fieldId = req.params.id;
  const { status } = req.body;

  const validStatuses = ["available", "occupied", "maintenance"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  const sql = `UPDATE fields SET status = ? WHERE id = ?`;

  db.query(sql, [status, fieldId], (err, result) => {
    if (err) {
      console.log("Lỗi đổi trạng thái sân:", err);
      return res.status(500).json({ message: "Không thể cập nhật trạng thái sân" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sân bóng không tồn tại" });
    }
    res.json({ message: "Cập nhật trạng thái thành công" });
  });
});

// ===== XÓA SÂN =====
app.delete("/admin/fields/:id", authenticateToken, requireAdmin, (req, res) => {
  const fieldId = req.params.id;

  const checkBookingSql = `SELECT id FROM booking WHERE field_id = ? LIMIT 1`;

  db.query(checkBookingSql, [fieldId], (err, bookings) => {
    if (err) {
      console.log("Lỗi kiểm tra booking:", err);
      return res.status(500).json({ message: "Lỗi kiểm tra booking" });
    }
    if (bookings.length > 0) {
      return res.status(400).json({ message: "Không thể xóa sân đang có booking" });
    }

    const sql = `DELETE FROM fields WHERE id = ?`;
    db.query(sql, [fieldId], (err, result) => {
      if (err) {
        console.log("Lỗi xóa sân:", err);
        return res.status(500).json({ message: "Không thể xóa sân bóng" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Sân bóng không tồn tại" });
      }
      res.json({ message: "Xóa sân thành công" });
    });
  });
});

// ===== DUYỆT / TỪ CHỐI BOOKING =====
app.put("/admin/bookings/:id/status", authenticateToken, requireAdmin, (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "cancelled", "no_show"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  const sql = `UPDATE booking SET status = ? WHERE id = ?`;

  db.query(sql, [status, bookingId], (err, result) => {
    if (err) {
      console.log("Lỗi cập nhật trạng thái booking:", err);
      return res.status(500).json({ message: "Không thể cập nhật trạng thái booking" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking không tồn tại" });
    }
    res.json({ message: "Cập nhật trạng thái booking thành công" });
  });
});

// ===== CẬP NHẬT TRẠNG THÁI CỌC BOOKING =====
app.put("/admin/bookings/:id/deposit", authenticateToken, requireAdmin, (req, res) => {
  const bookingId = req.params.id;
  const { deposit_status } = req.body;

  const validStatuses = ["unpaid", "paid", "refunded", "forfeited"];
  if (!deposit_status || !validStatuses.includes(deposit_status)) {
    return res.status(400).json({ message: "Trạng thái cọc không hợp lệ" });
  }

  const sql = `UPDATE booking SET deposit_status = ? WHERE id = ?`;

  db.query(sql, [deposit_status, bookingId], (err, result) => {
    if (err) {
      console.log("Lỗi cập nhật deposit_status:", err);
      return res.status(500).json({ message: "Không thể cập nhật trạng thái cọc" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking không tồn tại" });
    }
    res.json({ message: "Cập nhật trạng thái cọc thành công" });
  });
});

// ===== CẬP NHẬT TRẠNG THÁI TRẬN ĐẤU =====
app.put("/admin/matches/:id/status", authenticateToken, requireAdmin, (req, res) => {
  const matchId = req.params.id;
  const { status } = req.body;

  const validStatuses = ["open", "full", "completed", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  const sql = `UPDATE matches SET status = ? WHERE id = ?`;

  db.query(sql, [status, matchId], (err, result) => {
    if (err) {
      console.log("Lỗi cập nhật trạng thái trận:", err);
      return res.status(500).json({ message: "Không thể cập nhật trạng thái trận" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Trận đấu không tồn tại" });
    }
    res.json({ message: "Cập nhật trạng thái trận thành công" });
  });
});

// ===== LẤY DANH SÁCH MATCHES CHO ADMIN =====
app.get("/admin/matches", authenticateToken, requireAdmin, (req, res) => {
  const sql = `
    SELECT
      m.id,
      CONCAT('Trận #', m.id) AS title,
      COALESCE(f.field_name, 'Chưa xác định') AS location,
      CONCAT(
        DATE_FORMAT(COALESCE(b.booking_date, m.match_date), '%Y-%m-%d'),
        ' ',
        TIME_FORMAT(COALESCE(b.start_time, '00:00:00'), '%H:%i')
      ) AS time,
      COALESCE(m.max_players, 10) AS max_players,
      COALESCE(m.status, 'open') AS status,
      m.match_date,
      m.team1_id,
      m.team2_id,
      m.booking_id,
      (SELECT COUNT(*) FROM match_players mp WHERE mp.match_id = m.id) AS current_players
    FROM matches m
    LEFT JOIN booking b ON m.booking_id = b.id
    LEFT JOIN fields  f ON b.field_id   = f.id
    ORDER BY m.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Lỗi lấy matches cho admin:", err);
      return res.status(500).json({ message: "Không thể lấy danh sách trận đấu" });
    }

    res.json(result);
  });
});

// ===== CHẠY SERVER =====
app.listen(3001, () => {
  console.log("🚀 Server running on port 3001");
});