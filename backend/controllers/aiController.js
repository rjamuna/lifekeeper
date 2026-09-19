const { parseReminderText } = require("../services/groqService");

// POST /api/ai/parse-reminder
const parseReminder = async (req, res, next) => {
  try {
    // Accept both `message` and `text` field names
    const raw = req.body.message || req.body.text;

    if (!raw || typeof raw !== "string" || !raw.trim()) {
      return res.status(400).json({ success: false, message: "\"message\" (or \"text\") field is required" });
    }
    if (raw.trim().length > 500) {
      return res.status(400).json({ success: false, message: "message is too long (max 500 characters)" });
    }

    // Pass today's date dynamically — never hardcoded
    const todayISO = new Date().toISOString().slice(0, 10);

    const result = await parseReminderText(raw.trim(), todayISO);

    if (result.needsClarification) {
      return res.status(200).json({
        success: true,
        needsClarification: true,
        clarificationMessage: result.clarificationMessage,
      });
    }

    return res.status(200).json({
      success: true,
      needsClarification: false,
      data: result.data,
    });
  } catch (err) {
    // Known user-facing errors
    const knownErrors = [
      "GROQ_API_KEY",
      "Invalid Groq",
      "access denied",
      "not found",
      "rate limit",
      "Groq API",
      "unreadable response",
      "internet connection",
      "temporarily unavailable",
      "User message is empty",
    ];
    const isKnown = knownErrors.some((e) => err.message.includes(e));
    if (isKnown) {
      return res.status(502).json({ success: false, message: err.message });
    }
    next(err);
  }
};

module.exports = { parseReminder };
