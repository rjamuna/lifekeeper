require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./services/db");
const errorHandler = require("./middleware/errorHandler");
const authMiddleware = require("./middleware/authMiddleware");

const healthRoute = require("./routes/health");
const authRoute = require("./routes/auth");
const remindersRoute = require("./routes/reminders");
const aiRoute = require("./routes/ai");
const documentsRoute = require("./routes/documents");

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== DATABASE ====================

connectDB();

// ==================== CORS ====================

const allowedOrigins = [
  "https://lifekeeper-delta.vercel.app",
  "https://lifekeeper-qub8dar42-rjamunas-projects.vercel.app",
  "https://lifekeeper-git-master-rjamunas-projects.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no Origin header
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ==================== MIDDLEWARE ====================

app.use(express.json());

// ==================== PUBLIC ROUTES ====================

app.use("/api/health", healthRoute);

app.use("/api/auth", authRoute);

// ==================== PROTECTED ROUTES ====================

app.use(
  "/api/reminders",
  authMiddleware,
  remindersRoute
);

app.use(
  "/api/ai",
  authMiddleware,
  aiRoute
);

app.use(
  "/api/documents",
  authMiddleware,
  documentsRoute
);

// ==================== 404 HANDLER ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==================== ERROR HANDLER ====================

app.use(errorHandler);

// ==================== START SERVER ====================

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `LifeKeeper backend running on port ${PORT}`
  );
});