const express = require("express");
const {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  completeReminder,
  cancelReminder,
  getDueNotifications,
  markNotificationSent,
} = require("../controllers/reminderController");

const router = express.Router();

// Notification routes — MUST be before /:id to avoid "notifications" being treated as an id
router.get("/notifications/due", getDueNotifications);
router.patch("/:id/notification-sent", markNotificationSent);

router.route("/").get(getReminders).post(createReminder);
router.route("/:id").get(getReminderById).put(updateReminder).delete(deleteReminder);
router.patch("/:id/complete", completeReminder);
router.patch("/:id/cancel", cancelReminder);

module.exports = router;
