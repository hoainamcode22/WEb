-- ============================================================
-- FOOTBALL BOOKING APP - DATABASE SCHEMA
-- Database: football_app
-- ============================================================

CREATE DATABASE IF NOT EXISTS football_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE football_app;

-- ============================================================
-- TABLE: players
-- ============================================================
CREATE TABLE IF NOT EXISTS players (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  team_id    INT DEFAULT NULL,
  player_name VARCHAR(255) NOT NULL,
  position   VARCHAR(100)  DEFAULT 'Chưa cập nhật',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  email      VARCHAR(255) DEFAULT NULL,
  phone      VARCHAR(20)  DEFAULT NULL,
  role       ENUM('user','admin') DEFAULT 'user',
  player_id  INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: fields
-- ============================================================
CREATE TABLE IF NOT EXISTS fields (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  field_name     VARCHAR(255) NOT NULL,
  price_per_hour DECIMAL(10,2) DEFAULT 0,
  status         ENUM('available','occupied','maintenance') DEFAULT 'available',
  location       VARCHAR(255) DEFAULT 'TP.HCM',
  description    TEXT DEFAULT NULL,
  field_type     ENUM('5v5','7v7','11v11') DEFAULT '5v5',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: booking
-- ============================================================
CREATE TABLE IF NOT EXISTS booking (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  field_id       INT NOT NULL,
  booking_date   DATE NOT NULL,
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  status         ENUM('pending','confirmed','completed','cancelled','no_show') DEFAULT 'pending',
  deposit_status ENUM('unpaid','paid','refunded','forfeited') DEFAULT 'unpaid',
  deposit_amount DECIMAL(10,2) DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_booking_field FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: matches
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  booking_id  INT DEFAULT NULL,
  team1_id    INT DEFAULT NULL,
  team2_id    INT DEFAULT NULL,
  match_date  DATETIME DEFAULT NULL,
  status      ENUM('open','full','completed','cancelled') DEFAULT 'open',
  max_players INT DEFAULT 10,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_match_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: match_players
-- ============================================================
CREATE TABLE IF NOT EXISTS match_players (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  match_id     INT NOT NULL,
  player_id    INT NOT NULL,
  goals        INT DEFAULT 0,
  assists      INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards    INT DEFAULT 0,
  UNIQUE KEY uq_match_player (match_id, player_id),
  CONSTRAINT fk_mp_match  FOREIGN KEY (match_id)  REFERENCES matches(id) ON DELETE CASCADE,
  CONSTRAINT fk_mp_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ALTER: Thêm cột còn thiếu (chạy khi table đã tồn tại)
-- ============================================================
ALTER TABLE fields
  ADD COLUMN IF NOT EXISTS location    VARCHAR(255) DEFAULT 'TP.HCM',
  ADD COLUMN IF NOT EXISTS description TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS field_type  ENUM('5v5','7v7','11v11') DEFAULT '5v5';

ALTER TABLE booking
  ADD COLUMN IF NOT EXISTS deposit_status ENUM('unpaid','paid','refunded','forfeited') DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS status      ENUM('open','full','completed','cancelled') DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS max_players INT DEFAULT 10;

-- ============================================================
-- SAMPLE DATA: 5 sân bóng mẫu
-- ============================================================
INSERT IGNORE INTO fields (id, field_name, price_per_hour, status, location, description, field_type) VALUES
(1, 'Sân A - Tân Bình',   200000, 'available',   'Quận Tân Bình, TP.HCM',    'Sân cỏ nhân tạo, đèn cao áp, có phòng thay đồ', '5v5'),
(2, 'Sân B - Bình Thạnh', 250000, 'available',   'Quận Bình Thạnh, TP.HCM',  'Sân rộng, mặt cỏ chất lượng cao, bãi giữ xe miễn phí', '7v7'),
(3, 'Sân C - Gò Vấp',     180000, 'available',   'Quận Gò Vấp, TP.HCM',     'Sân mini phù hợp phong trào, giá hợp lý', '5v5'),
(4, 'Sân D - Thủ Đức',    300000, 'maintenance', 'TP. Thủ Đức, TP.HCM',     'Sân tiêu chuẩn thi đấu, đang bảo trì định kỳ', '11v11'),
(5, 'Sân E - Quận 7',     220000, 'available',   'Quận 7, TP.HCM',           'Sân cỏ mới, gần khu dân cư Phú Mỹ Hưng', '7v7');
