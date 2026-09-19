import { useState, useEffect, useCallback, useRef } from "react";
import { getDueNotifications, markNotificationSent } from "../services/api";

const POLL_INTERVAL_MS = 60_000; // 60 seconds

/**
 * Build a human-readable notification body from a reminder.
 * Uses the actual reminderDate from MongoDB — no hardcoding.
 */
export const buildNotificationBody = (reminder) => {
  const now = new Date();
  // Compare using IST-aware date strings to avoid UTC off-by-one
  const todayIST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  todayIST.setHours(0, 0, 0, 0);

  const eventDate = new Date(reminder.reminderDate);
  const eventIST = new Date(eventDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  eventIST.setHours(0, 0, 0, 0);

  const diffMs = eventIST - todayIST;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return `${reminder.title} is due in ${diffDays} days.`;
  if (diffDays === 1) return `${reminder.title} is due tomorrow.`;
  if (diffDays === 0) return `${reminder.title} is due today.`;
  const overdueDays = Math.abs(diffDays);
  return `${reminder.title} is overdue by ${overdueDays} day${overdueDays !== 1 ? "s" : ""}.`;
};

const isSupported = () => typeof window !== "undefined" && "Notification" in window;

export const useNotifications = () => {
  const [permission, setPermission] = useState(() =>
    isSupported() ? Notification.permission : "unsupported"
  );
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);
  // Track IDs we've already processed this session to prevent double-firing
  // before the backend marks them sent (race condition guard)
  const processedIds = useRef(new Set());

  // ── Request browser permission ────────────────────────────────────────────
  const requestPermission = useCallback(async () => {
    if (!isSupported()) return "unsupported";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // ── Fire a single browser notification ───────────────────────────────────
  const fireBrowserNotification = useCallback((title, body) => {
    if (!isSupported() || Notification.permission !== "granted") return false;
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
      return true;
    } catch {
      return false;
    }
  }, []);

  // ── Test notification (does NOT touch MongoDB) ────────────────────────────
  const sendTestNotification = useCallback(() => {
    if (!isSupported()) return "unsupported";
    if (Notification.permission !== "granted") return "not-granted";
    try {
      new Notification("LifeKeeper", { body: "This is a test notification.", icon: "/favicon.ico" });
      return "sent";
    } catch {
      return "error";
    }
  }, []);

  // ── Poll for due notifications ────────────────────────────────────────────
  const checkDueNotifications = useCallback(async () => {
    try {
      const res = await getDueNotifications();
      setLastChecked(new Date());

      if (!res.data || res.data.length === 0) return;

      for (const reminder of res.data) {
        // Skip if already processed this session
        if (processedIds.current.has(reminder._id)) continue;
        processedIds.current.add(reminder._id);

        const body = buildNotificationBody(reminder);

        // Add to in-app list immediately (works even if browser permission denied)
        setInAppNotifications((prev) => [
          {
            id: reminder._id,
            title: reminder.title,
            body,
            reminderDate: reminder.reminderDate,
            category: reminder.category,
            priority: reminder.priority,
            receivedAt: new Date(),
            dismissed: false,
          },
          ...prev,
        ]);

        // Attempt browser notification
        fireBrowserNotification("🔔 LifeKeeper", body);

        // Mark as sent in MongoDB — do this regardless of browser permission
        // so the same reminder doesn't re-appear on next poll
        try {
          await markNotificationSent(reminder._id);
        } catch {
          // If marking fails, processedIds prevents duplicate in this session
        }
      }
    } catch {
      // Backend unavailable — silently skip, will retry next interval
    }
  }, [fireBrowserNotification]);

  // ── Dismiss in-app notification ───────────────────────────────────────────
  const dismissNotification = useCallback((id) => {
    setInAppNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    );
  }, []);

  const dismissAll = useCallback(() => {
    setInAppNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true })));
  }, []);

  // ── Polling loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Run immediately on mount, then every 60s
    checkDueNotifications();
    const interval = setInterval(checkDueNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkDueNotifications]);

  const activeNotifications = inAppNotifications.filter((n) => !n.dismissed);

  return {
    permission,
    isSupported: isSupported(),
    inAppNotifications: activeNotifications,
    lastChecked,
    requestPermission,
    sendTestNotification,
    dismissNotification,
    dismissAll,
    checkDueNotifications, // expose for manual refresh
  };
};
