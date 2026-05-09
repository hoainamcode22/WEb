const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "football_app",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Kết nối DB thất bại:", err);
  } else {
    console.log("✅ Kết nối MySQL thành công");
  }
});

module.exports = db;