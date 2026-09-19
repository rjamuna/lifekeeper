const mongoose = require("mongoose");

const healthCheck = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState];

  res.json({
    success: true,
    message: "LifeKeeper backend is running",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { healthCheck };
