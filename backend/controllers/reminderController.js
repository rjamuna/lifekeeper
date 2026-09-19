const Reminder = require("../models/Reminder");
const User = require("../models/User");
const { sendReminderEmail } = require("../services/emailService");

// ── helpers ──────────────────────────────────────────────────────────────────

const computeNotificationDate = (reminderDate, daysBefore) => {
  const d = new Date(reminderDate);
  d.setUTCDate(d.getUTCDate() - (daysBefore || 0));
  return d;
};

// Ownership check — returns 404 so callers can't probe other users' IDs
const findOwned = async (id, userId) => {
  const reminder = await Reminder.findOne({ _id: id, userId });
  return reminder; // null if not found or not owned
};

const notFound = (res) =>
  res.status(404).json({ success: false, message: "Reminder not found." });

// ── CRUD ─────────────────────────────────────────────────────────────────────

// POST /api/reminders
const createReminder = async (req, res, next) => {
  try {
    // userId always comes from the verified JWT — never from req.body
    const { userId: _ignored, ...body } = req.body;
    const reminder = await Reminder.create({ ...body, userId: req.user.id });
    res.status(201).json({ success: true, data: reminder });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    next(err);
  }
};

// GET /api/reminders
const getReminders = async (req, res, next) => {
  try {
    const { status, category, priority } = req.query;
    const filter = { userId: req.user.id }; // always scoped to owner
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const reminders = await Reminder.find(filter).sort({ reminderDate: 1 });
    res.json({ success: true, count: reminders.length, data: reminders });
  } catch (err) {
    next(err);
  }
};

// GET /api/reminders/:id
const getReminderById = async (req, res, next) => {
  try {
    const reminder = await findOwned(req.params.id, req.user.id);
    if (!reminder) return notFound(res);
    res.json({ success: true, data: reminder });
  } catch (err) {
    if (err.name === "CastError") return notFound(res);
    next(err);
  }
};

// PUT /api/reminders/:id
const updateReminder = async (req, res, next) => {
  try {
    const existing = await findOwned(req.params.id, req.user.id);
    if (!existing) return notFound(res);

    const { userId: _ignored, ...body } = req.body;

    // Recompute notificationDate if date or daysBefore changed
    if (body.reminderDate !== undefined || body.reminderDaysBefore !== undefined) {
      const date = body.reminderDate ?? existing.reminderDate;
      const days = body.reminderDaysBefore ?? existing.reminderDaysBefore;
      body.notificationDate = computeNotificationDate(date, days);
      if (body.reminderDate !== undefined) {
        body.notificationSent = false;
        body.notificationSentAt = null;
      }
    }

    const reminder = await Reminder.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: reminder });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    if (err.name === "CastError") return notFound(res);
    next(err);
  }
};

// DELETE /api/reminders/:id
const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!reminder) return notFound(res);
    res.json({ success: true, message: "Reminder deleted." });
  } catch (err) {
    if (err.name === "CastError") return notFound(res);
    next(err);
  }
};

// PATCH /api/reminders/:id/complete
const completeReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "Completed" },
      { new: true }
    );
    if (!reminder) return notFound(res);
    res.json({ success: true, data: reminder });
  } catch (err) {
    if (err.name === "CastError") return notFound(res);
    next(err);
  }
};

// PATCH /api/reminders/:id/cancel
const cancelReminder = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: "Cancelled" },
      { new: true }
    );
    if (!reminder) return notFound(res);
    res.json({ success: true, data: reminder });
  } catch (err) {
    if (err.name === "CastError") return notFound(res);
    next(err);
  }
};

// ── Notification endpoints ────────────────────────────────────────────────────

// GET /api/reminders/notifications/due
const getDueNotifications = async (req, res, next) => {
  try {
    const now = new Date();
    const due = await Reminder.find({
      userId: req.user.id, // only this user's reminders — never another user's
      status: "Active",
      notificationEnabled: true,
      notificationSent: { $ne: true },
      notificationDate: { $lte: now },
    })
      .select("_id title description reminderDate reminderDaysBefore category priority notificationDate")
      .sort({ notificationDate: 1 })
      .lean();

    // Fetch owner once — email, phone, and channel prefs all come from MongoDB.
    // The recipient is always the authenticated user. Never accepted from frontend.
    if (due.length > 0) {
      const owner = await User.findById(req.user.id)
        .select("name email")
        .lean();

      if (owner) {
        for (const reminder of due) {
          sendReminderEmail(owner.email, owner.name, reminder).catch(() => {});
        }
      }
    }

    res.json({ success: true, count: due.length, data: due });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/reminders/:id/notification-sent
const markNotificationSent = async (req, res, next) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { notificationSent: true, notificationSentAt: new Date() },
      { new: true }
    );
    if (!reminder) return notFound(res);
    res.json({ success: true, data: reminder });
  } catch (err) {
    if (err.name === "CastError") return notFound(res);
    next(err);
  }
};

module.exports = {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  completeReminder,
  cancelReminder,
  getDueNotifications,
  markNotificationSent,
};
