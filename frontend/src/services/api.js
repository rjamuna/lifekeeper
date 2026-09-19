const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const getToken = () => localStorage.getItem("lk_token");

const request = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle non-JSON responses safely
  const contentType = res.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    throw new Error(
      `Server returned a non-JSON response (${res.status}): ${text.slice(0, 150)}`
    );
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
};

export const checkHealth = () => request("/health");

// ==================== AUTH ====================

export const registerUser = (body) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const loginUser = (body) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const getMe = () => request("/auth/me");

export const updateMe = (body) =>
  request("/auth/me", {
    method: "PUT",
    body: JSON.stringify(body),
  });

// ==================== REMINDERS ====================

export const getReminders = (params = {}) => {
  const qs = new URLSearchParams(params).toString();

  return request(`/reminders${qs ? `?${qs}` : ""}`);
};

export const getReminderById = (id) =>
  request(`/reminders/${id}`);

export const createReminder = (body) =>
  request("/reminders", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const updateReminder = (id, body) =>
  request(`/reminders/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const deleteReminder = (id) =>
  request(`/reminders/${id}`, {
    method: "DELETE",
  });

export const completeReminder = (id) =>
  request(`/reminders/${id}/complete`, {
    method: "PATCH",
  });

export const cancelReminder = (id) =>
  request(`/reminders/${id}/cancel`, {
    method: "PATCH",
  });

// ==================== NOTIFICATIONS ====================

export const getDueNotifications = () =>
  request("/reminders/notifications/due");

export const markNotificationSent = (id) =>
  request(`/reminders/${id}/notification-sent`, {
    method: "PATCH",
  });

// ==================== AI ====================

export const parseReminderWithAI = (message) =>
  request("/ai/parse-reminder", {
    method: "POST",
    body: JSON.stringify({ message }),
  });

// ==================== DOCUMENT OCR ====================

export const extractFromDocument = async (file) => {
  const token = getToken();

  const form = new FormData();
  form.append("document", file);

  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/documents/analyze`, {
    method: "POST",
    body: form,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";

  let data;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();

    throw new Error(
      `Server returned a non-JSON response (${res.status}): ${text.slice(0, 150)}`
    );
  }

  if (!res.ok) {
    throw new Error(data.message || `Upload failed: ${res.status}`);
  }

  return data;
};