import React from "react";

const STATUS_MAP = {
  // Booking status
  pending:     { label: "Chờ xác nhận", className: "status-badge status-pending" },
  confirmed:   { label: "Đã xác nhận",  className: "status-badge status-confirmed" },
  cancelled:   { label: "Đã hủy",       className: "status-badge status-cancelled" },
  completed:   { label: "Hoàn thành",   className: "status-badge status-completed" },
  no_show:     { label: "Không đến",    className: "status-badge status-noshow" },

  // Deposit status
  unpaid:      { label: "Chưa cọc",     className: "status-badge status-unpaid" },
  paid:        { label: "Đã cọc",       className: "status-badge status-paid" },
  forfeited:   { label: "Mất cọc",      className: "status-badge status-forfeited" },
  refunded:    { label: "Hoàn cọc",     className: "status-badge status-refunded" },

  // Field status
  available:   { label: "Còn trống",    className: "status-badge status-available" },
  unavailable: { label: "Không dùng",   className: "status-badge status-cancelled" },
  maintenance: { label: "Bảo trì",      className: "status-badge status-maintenance" },
  inactive:    { label: "Ngừng hoạt động", className: "status-badge status-cancelled" },

  // Match status
  open:        { label: "Đang mở",      className: "status-badge status-confirmed" },
  full:        { label: "Đủ người",     className: "status-badge status-full" },
  closed:      { label: "Đã đóng",      className: "status-badge status-cancelled" },

  // User roles
  admin:       { label: "Admin",        className: "status-badge status-admin" },
  user:        { label: "Người dùng",   className: "status-badge status-user" },
  active:      { label: "Hoạt động",    className: "status-badge status-confirmed" },
  locked:      { label: "Bị khóa",      className: "status-badge status-cancelled" },
};

function StatusBadge({ status }) {
  if (!status) return <span className="status-badge status-muted">—</span>;

  const key = String(status).toLowerCase().trim();
  const config = STATUS_MAP[key];

  if (config) {
    return <span className={config.className}>{config.label}</span>;
  }

  return <span className="status-badge status-muted">{status}</span>;
}

export default StatusBadge;
