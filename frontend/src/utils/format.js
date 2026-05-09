export const formatDateVN = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  return date.toLocaleDateString("vi-VN");
};

export const formatTimeVN = (timeString) => {
  if (!timeString) return "";
  return String(timeString).slice(0, 5);
};

export const formatDateTimeVN = (dateTimeString) => {
  if (!dateTimeString) return "";

  const date = new Date(dateTimeString);
  if (isNaN(date)) return dateTimeString;

  const ngay = date.toLocaleDateString("vi-VN");
  const gio = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${ngay} ${gio}`;
};