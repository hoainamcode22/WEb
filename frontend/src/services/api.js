const BASE_URL = "";

const getAuthToken = () => {
  return localStorage.getItem("token") || "";
};

const getAuthHeaders = (includeJson = false) => {
  const token = getAuthToken();

  const headers = {};

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (res, defaultMessage) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || defaultMessage);
  }

  return res.json();
};

// ===== AUTH =====
export const registerUser = async (registerData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(registerData),
  });

  return handleResponse(res, "Đăng ký thất bại");
};

export const loginUser = async (loginData) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(loginData),
  });

  return handleResponse(res, "Đăng nhập thất bại");
};

export const getCurrentUser = async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(res, "Không lấy được thông tin người dùng");
};

// ===== FIELDS =====
export const getFields = async () => {
  const res = await fetch(`${BASE_URL}/fields`);
  return handleResponse(res, "Không lấy được danh sách sân");
};

export const getFieldById = async (id) => {
  const res = await fetch(`${BASE_URL}/fields/${id}`);
  return handleResponse(res, "Không lấy được chi tiết sân");
};

// ===== BOOKINGS =====
export const getBookings = async () => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res, "Không lấy được danh sách booking");
};

export const createBooking = async (bookingData) => {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(bookingData),
  });

  return handleResponse(res, "Tạo booking thất bại");
};

// ===== MATCHES =====
export const getMatches = async () => {
  const res = await fetch(`${BASE_URL}/matches`);
  return handleResponse(res, "Không lấy được danh sách trận");
};

export const getMatchPlayers = async (matchId) => {
  const res = await fetch(`${BASE_URL}/match/${matchId}/players`);
  return handleResponse(res, "Không lấy được danh sách người tham gia");
};

export const joinMatch = async (joinData) => {
  const res = await fetch(`${BASE_URL}/join`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(joinData),
  });

  return handleResponse(res, "Tham gia trận thất bại");
};

// ===== ADMIN =====
export const getAdminBookings = async () => {
  const res = await fetch(`${BASE_URL}/admin/bookings`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(res, "Không lấy được danh sách booking quản trị");
};
export const getAdminUsers = async () => {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(res, "Không lấy được danh sách người dùng");
};
export const getAdminFields = async () => {
  const res = await fetch(`${BASE_URL}/admin/fields`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(res, "Không lấy được danh sách sân bóng");
};
export const getAdminMatches = async () => {
  const res = await fetch(`${BASE_URL}/admin/matches`, {
    headers: getAuthHeaders(),
  });

  return handleResponse(res, "Không lấy được danh sách trận đấu");
};

export const updateBookingStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/admin/bookings/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res, "Cập nhật trạng thái thất bại");
};

export const updateDepositStatus = async (id, deposit_status) => {
  const res = await fetch(`${BASE_URL}/admin/bookings/${id}/deposit`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ deposit_status }),
  });
  return handleResponse(res, "Cập nhật trạng thái cọc thất bại");
};

export const updateFieldStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/admin/fields/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res, "Cập nhật trạng thái sân thất bại");
};

export const updateMatchStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/admin/matches/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ status }),
  });
  return handleResponse(res, "Cập nhật trạng thái trận thất bại");
};