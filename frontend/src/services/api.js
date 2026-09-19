const BASE_URL = "/api";

const getToken = () => localStorage.getItem("lk_token");

const request = async (path, options = {}) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
};

export const checkHealth = () => request("/health");

// Auth
export const registerUser = (body) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(body) });

export const loginUser = (body) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(body) });

export const getMe = () => request("/auth/me");

export const updateMe = (body) =>
  request("/auth/me", { method: "PUT", body: JSON.stringify(body) });

// Reminders
export const getReminders = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/reminders${qs ? `?${qs}` : ""}`);
};

export const getReminderById = (id) => request(`/reminders/${id}`);

export const createReminder = (body) =>
  request("/reminders", { method: "POST", body: JSON.stringify(body) });

export const updateReminder = (id, body) =>
  request(`/reminders/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteReminder = (id) =>
  request(`/reminders/${id}`, { method: "DELETE" });

export const completeReminder = (id) =>
  request(`/reminders/${id}/complete`, { method: "PATCH" });

export const cancelReminder = (id) =>
  request(`/reminders/${id}/cancel`, { method: "PATCH" });

// Notifications
export const getDueNotifications = () => request("/reminders/notifications/due");

export const markNotificationSent = (id) =>
  request(`/reminders/${id}/notification-sent`, { method: "PATCH" });

// AI
export const parseReminderWithAI = (message) =>
  request("/ai/parse-reminder", { method: "POST", body: JSON.stringify({ message }) });

// Document extraction — multipart/form-data, NO Content-Type header override
export const extractFromDocument = (file) => {
  const token = getToken();
  const form = new FormData();
  form.append("document", file);
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch("/api/documents/analyze", { method: "POST", body: form, headers })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Upload failed: ${res.status}`);
      return data;
    });
};
