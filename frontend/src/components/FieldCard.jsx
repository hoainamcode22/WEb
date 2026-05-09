import React from "react";
import { Link } from "react-router-dom";

function FieldCard({ field }) {
  return (
    <div className="field-card">
      <div className="field-image">
        <span>Sân bóng</span>
      </div>

      <div className="field-content">
        <h3 className="field-title">{field.name}</h3>

        <p className="field-info">
          <strong>Giá:</strong> {field.price} VNĐ / giờ
        </p>

        <p className="field-info">
          <strong>Khu vực:</strong> {field.location || "Chưa cập nhật"}
        </p>

        <span className="field-status">
          {field.status === "available" ? "Còn trống" : field.status}
        </span>

        <div className="field-actions">
          <Link to={`/fields/${field.id}`}>
            <button className="btn-detail">Xem chi tiết</button>
          </Link>

          <Link to={`/booking/${field.id}`}>
            <button className="btn-book">Đặt sân</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FieldCard;