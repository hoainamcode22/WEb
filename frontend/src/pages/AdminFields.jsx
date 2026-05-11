import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminSidebar from "../components/AdminSidebar";
import StatusBadge from "../components/StatusBadge";
import {
  getAdminFields,
  createField,
  updateField,
  deleteField,
  updateFieldStatus,
} from "../services/api";

const EMPTY_FORM = {
  name: "",
  price: "",
  status: "available",
  location: "TP.HCM",
  description: "",
  field_type: "5v5",
};

function AdminFields() {
  const [fields, setFields] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editField, setEditField] = useState(null); // null = thêm mới
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Confirm xóa
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchFields = async () => {
    setLoading(true);
    try {
      const data = await getAdminFields();
      setFields(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const stats = useMemo(() => {
    const total = fields.length;
    const available = fields.filter(
      (f) => String(f.status).toLowerCase() === "available"
    ).length;
    const occupied = fields.filter(
      (f) => String(f.status).toLowerCase() === "occupied"
    ).length;
    const maintenance = fields.filter(
      (f) => String(f.status).toLowerCase() === "maintenance"
    ).length;
    return { total, available, occupied, maintenance };
  }, [fields]);

  const filtered = useMemo(() => {
    if (!search.trim()) return fields;
    const q = search.toLowerCase();
    return fields.filter(
      (f) =>
        (f.name || "").toLowerCase().includes(q) ||
        (f.location || "").toLowerCase().includes(q) ||
        (f.status || "").toLowerCase().includes(q) ||
        (f.field_type || "").toLowerCase().includes(q)
    );
  }, [fields, search]);

  // ===== MỞ MODAL THÊM =====
  const openAdd = () => {
    setEditField(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  // ===== MỞ MODAL SỬA =====
  const openEdit = (field) => {
    setEditField(field);
    setForm({
      name: field.name || "",
      price: field.price || "",
      status: field.status || "available",
      location: field.location || "TP.HCM",
      description: field.description || "",
      field_type: field.field_type || "5v5",
    });
    setFormError("");
    setShowModal(true);
  };

  // ===== ĐÓNG MODAL =====
  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditField(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  // ===== XỬ LÝ FORM CHANGE =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ===== LƯU SÂN (thêm hoặc sửa) =====
  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Vui lòng nhập tên sân.");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setFormError("Vui lòng nhập giá hợp lệ (lớn hơn 0).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        status: form.status,
        location: form.location.trim() || "TP.HCM",
        description: form.description.trim() || null,
        field_type: form.field_type,
      };

      if (editField) {
        await updateField(editField.id, payload);
        showToast("Cập nhật sân thành công!");
      } else {
        await createField(payload);
        showToast("Thêm sân mới thành công!");
      }

      closeModal();
      fetchFields();
    } catch (err) {
      setFormError(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  // ===== ĐỔI TRẠNG THÁI NHANH =====
  const handleStatusToggle = async (field) => {
    const nextStatus =
      field.status === "available"
        ? "maintenance"
        : field.status === "maintenance"
        ? "available"
        : "available";

    try {
      await updateFieldStatus(field.id, nextStatus);
      showToast(`Đổi trạng thái sân "${field.name}" thành công!`);
      fetchFields();
    } catch (err) {
      showToast("Lỗi: " + err.message);
    }
  };

  // ===== XÓA SÂN =====
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteField(deleteTarget.id);
      showToast(`Đã xóa sân "${deleteTarget.name}".`);
      setDeleteTarget(null);
      fetchFields();
    } catch (err) {
      showToast("Lỗi: " + err.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const fieldTypeLabel = (t) => {
    if (t === "7v7") return "7 vs 7";
    if (t === "11v11") return "11 vs 11";
    return "5 vs 5";
  };

  return (
    <div>
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className="toast-notify">{toast}</div>
      )}

      <div className="container page-section admin-page-layout">
        <AdminSidebar />

        <div className="admin-page-main">
          <div className="match-page-head">
            <div>
              <span className="page-badge">🏟️ Quản lý sân bóng</span>
              <h1 className="section-title" style={{ marginTop: "10px" }}>
                Quản lý sân bóng
              </h1>
              <p className="section-subtitle">
                Thêm, sửa, xóa và quản lý trạng thái sân bóng trong hệ thống.
              </p>
            </div>
            <button className="btn-primary" onClick={openAdd}>
              + Thêm sân mới
            </button>
          </div>

          {/* THỐNG KÊ */}
          <div
            className="admin-stat-grid"
            style={{ gridTemplateColumns: "repeat(4,1fr)" }}
          >
            <div className="admin-stat-card admin-stat-green">
              <div className="admin-stat-icon">🏟️</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Tổng sân</span>
                <strong className="admin-stat-value">{stats.total}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-blue">
              <div className="admin-stat-icon">✅</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Sân trống</span>
                <strong className="admin-stat-value">{stats.available}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-orange">
              <div className="admin-stat-icon">⚽</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Đang sử dụng</span>
                <strong className="admin-stat-value">{stats.occupied}</strong>
              </div>
            </div>
            <div className="admin-stat-card admin-stat-red">
              <div className="admin-stat-icon">🔧</div>
              <div className="admin-stat-body">
                <span className="admin-stat-label">Bảo trì</span>
                <strong className="admin-stat-value">{stats.maintenance}</strong>
              </div>
            </div>
          </div>

          {/* THANH TÌM KIẾM */}
          <div className="match-toolbar" style={{ marginBottom: "18px" }}>
            <div className="match-search-box">
              <input
                type="text"
                placeholder="🔍 Tìm theo tên sân, khu vực, loại sân, trạng thái..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu sân bóng...</p>
            </div>
          )}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-box">
              {search
                ? "Không tìm thấy sân phù hợp."
                : "Chưa có sân bóng nào. Hãy thêm sân đầu tiên!"}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="table-wrap">
              <div className="table-wrap-header">
                <h3>Danh sách sân bóng ({filtered.length})</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên sân</th>
                    <th>Loại</th>
                    <th>Giá / giờ</th>
                    <th>Khu vực</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((field) => (
                    <tr key={field.id}>
                      <td>
                        <strong>#{field.id}</strong>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>🏟️</span>
                          <div>
                            <div style={{ fontWeight: 700 }}>{field.name}</div>
                            {field.description && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#888",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {field.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-type">
                          {fieldTypeLabel(field.field_type)}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: "#16944c" }}>
                          {Number(field.price || 0).toLocaleString("vi-VN")} VNĐ
                        </strong>
                      </td>
                      <td>📍 {field.location || "TP.HCM"}</td>
                      <td>
                        <StatusBadge status={field.status} />
                      </td>
                      <td>
                        <div
                          style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                        >
                          <button
                            className="btn-sm btn-edit"
                            onClick={() => openEdit(field)}
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            className="btn-sm btn-status"
                            onClick={() => handleStatusToggle(field)}
                            title={
                              field.status === "available"
                                ? "Chuyển sang Bảo trì"
                                : "Chuyển sang Sẵn sàng"
                            }
                          >
                            🔄 Trạng thái
                          </button>
                          <button
                            className="btn-sm btn-delete"
                            onClick={() => setDeleteTarget(field)}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* ===== MODAL THÊM / SỬA SÂN ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editField ? "✏️ Chỉnh sửa sân" : "➕ Thêm sân mới"}</h2>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="form-row">
                <label>Tên sân *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Sân A - Tân Bình"
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-row">
                  <label>Loại sân</label>
                  <select name="field_type" value={form.field_type} onChange={handleChange}>
                    <option value="5v5">5 vs 5</option>
                    <option value="7v7">7 vs 7</option>
                    <option value="11v11">11 vs 11</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Trạng thái</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="available">Sẵn sàng</option>
                    <option value="occupied">Đang sử dụng</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2col">
                <div className="form-row">
                  <label>Giá thuê / giờ (VNĐ) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Ví dụ: 200000"
                    min="0"
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Khu vực</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Ví dụ: Quận 1, TP.HCM"
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Mô tả sân</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Mô tả tiện ích, dịch vụ đi kèm..."
                  rows={3}
                />
              </div>

              {formError && <p className="form-error">{formError}</p>}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Đang lưu..." : editField ? "Lưu thay đổi" : "Thêm sân"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL XÁC NHẬN XÓA ===== */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div
            className="modal-box modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🗑️ Xác nhận xóa sân</h2>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa sân{" "}
                <strong>"{deleteTarget.name}"</strong>?
              </p>
              <p className="warning-text">
                Lưu ý: Không thể xóa sân đang có booking. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                className="btn-danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Đang xóa..." : "Xóa sân"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFields;
