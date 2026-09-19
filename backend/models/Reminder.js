const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    category: {
      type: String,
      enum: ["Home", "Vehicle", "Documents", "Finance", "Shopping", "Subscription", "Family", "Custom"],
      default: "Custom",
    },
    reminderDate: {
      type: Date,
      required: [true, "Reminder date is required"],
    },
    reminderTime: {
      type: String,
      default: "09:00",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    reminderDaysBefore: {
      type: Number,
      min: [0, "Days before cannot be negative"],
      default: 1,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
    source: {
      type: String,
      enum: ["Manual", "Voice", "Document", "AI"],
      default: "Manual",
    },
    language: {
      type: String,
      default: "en",
    },

    // ── Owner ────────────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      index: true,
    },

    // ── Notification fields ──────────────────────────────────────────────────
    notificationEnabled: {
      type: Boolean,
      default: true,
    },
    // Computed: reminderDate minus reminderDaysBefore days (start of that day, IST midnight = UTC 18:30 prev day)
    notificationDate: {
      type: Date,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/**
 * Compute notificationDate before every save.
 * We store dates as UTC midnight of the IST date.
 * IST = UTC+5:30, so IST midnight = UTC 18:30 of the previous day.
 * To get "start of IST day" for a Date stored as UTC midnight:
 *   notificationDate = reminderDate - reminderDaysBefore days (same UTC midnight logic).
 */
reminderSchema.pre("save", function (next) {
  if (this.isModified("reminderDate") || this.isModified("reminderDaysBefore")) {
    if (this.reminderDate) {
      const d = new Date(this.reminderDate);
      d.setUTCDate(d.getUTCDate() - (this.reminderDaysBefore || 0));
      this.notificationDate = d;
    }
  }
  next();
});

// Also recompute on findOneAndUpdate
reminderSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  const date = update.reminderDate || update.$set?.reminderDate;
  const days = update.reminderDaysBefore ?? update.$set?.reminderDaysBefore;
  if (date !== undefined || days !== undefined) {
    // We need both values — fetch from update or fall back to existing (handled in controller)
    // Controller sets notificationDate explicitly when updating, so just pass through here.
  }
  next();
});

module.exports = mongoose.model("Reminder", reminderSchema);
