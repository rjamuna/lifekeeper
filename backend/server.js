require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./services/db");
const errorHandler = require("./middleware/errorHandler");
const authMiddleware = require("./middleware/authMiddleware");

const healthRoute    = require("./routes/health");
const authRoute      = require("./routes/auth");
const remindersRoute = require("./routes/reminders");
const aiRoute        = require("./routes/ai");
const documentsRoute = require("./routes/documents");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Public routes
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoute);

// Protected routes — authMiddleware applied here so every sub-route is covered
app.use("/api/reminders", authMiddleware, remindersRoute);
app.use("/api/ai",        authMiddleware, aiRoute);
app.use("/api/documents", authMiddleware, documentsRoute);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`LifeKeeper backend running on port ${PORT}`);
});
