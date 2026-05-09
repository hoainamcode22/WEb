/**
 * Script tạo tài khoản nhanh — chạy: node create-user.js
 * Tạo 1 tài khoản user + 1 tài khoản admin
 */

const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "football_app",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Kết nối DB thất bại:", err.message);
    console.log("\n📌 Hãy kiểm tra:");
    console.log("   1. MySQL đã được khởi động chưa?");
    console.log("   2. Database 'football_app' đã tồn tại chưa?");
    process.exit(1);
  }
  console.log("✅ Kết nối MySQL thành công\n");
  createAccounts();
});

async function createAccounts() {
  const accounts = [
    { username: "testuser", password: "123456", email: "user@test.com", phone: "0901234567", role: "user" },
    { username: "admin",    password: "admin123", email: "admin@test.com", phone: "0909999888", role: "admin" },
  ];

  for (const acc of accounts) {
    await createAccount(acc);
  }

  console.log("\n🎉 Hoàn tất! Thông tin đăng nhập:");
  console.log("─────────────────────────────────────────");
  console.log("👤 User thường:");
  console.log("   Tên đăng nhập : testuser");
  console.log("   Mật khẩu      : 123456");
  console.log("");
  console.log("🛡️  Admin:");
  console.log("   Tên đăng nhập : admin");
  console.log("   Mật khẩu      : admin123");
  console.log("─────────────────────────────────────────");
  console.log("🌐 Truy cập: http://localhost:3000/login\n");

  db.end();
}

function createAccount({ username, password, email, phone, role }) {
  return new Promise(async (resolve) => {
    // Kiểm tra tồn tại
    db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
      async (err, rows) => {
        if (err) {
          console.error(`❌ Lỗi kiểm tra '${username}':`, err.message);
          return resolve();
        }

        if (rows.length > 0) {
          console.log(`⚠️  Tài khoản '${username}' đã tồn tại — bỏ qua`);
          return resolve();
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo player record trước
        db.query(
          "INSERT INTO players (team_id, player_name, position) VALUES (?, ?, ?)",
          [null, username, "Chưa cập nhật"],
          (err, playerResult) => {
            if (err) {
              console.error(`❌ Lỗi tạo player cho '${username}':`, err.message);
              return resolve();
            }

            const playerId = playerResult.insertId;

            // Tạo user
            db.query(
              "INSERT INTO users (username, password, phone, email, role, player_id) VALUES (?, ?, ?, ?, ?, ?)",
              [username, hashedPassword, phone, email, role, playerId],
              (err, userResult) => {
                if (err) {
                  console.error(`❌ Lỗi tạo user '${username}':`, err.message);
                  return resolve();
                }

                console.log(
                  `✅ Tạo thành công: '${username}' (${role}) — user_id=${userResult.insertId}, player_id=${playerId}`
                );
                resolve();
              }
            );
          }
        );
      }
    );
  });
}
