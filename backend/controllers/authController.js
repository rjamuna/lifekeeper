const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  preferredLanguage: user.preferredLanguage,
  timezone: user.timezone,
  phone: user.phone || "",
  smsEnabled: user.smsEnabled || false,
  callEnabled: user.callEnabled || false,
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = signToken(user._id);

    res.status(201).json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Explicitly select password since it has select:false
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    // Generic message — don't reveal whether email exists
    const invalid = () =>
      res.status(401).json({ success: false, message: "Invalid email or password." });

    if (!user) return invalid();

    const match = await user.matchPassword(password);
    if (!match) return invalid();

    const token = signToken(user._id);
    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/me  (protected) — update non-sensitive profile fields
const updateMe = async (req, res, next) => {
  try {
    const allowed = {};
    if (req.body.name)              allowed.name              = req.body.name.trim();
    if (req.body.preferredLanguage) allowed.preferredLanguage = req.body.preferredLanguage;
    if (req.body.timezone)          allowed.timezone          = req.body.timezone;
    // Phone and notification channel toggles
    if (req.body.phone      !== undefined) allowed.phone       = req.body.phone.trim();
    if (req.body.smsEnabled  !== undefined) allowed.smsEnabled  = Boolean(req.body.smsEnabled);
    if (req.body.callEnabled !== undefined) allowed.callEnabled = Boolean(req.body.callEnabled);

    const user = await User.findByIdAndUpdate(req.user.id, allowed, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe };
