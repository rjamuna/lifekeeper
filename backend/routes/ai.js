const express = require("express");
const { parseReminder } = require("../controllers/aiController");

const router = express.Router();

router.post("/parse-reminder", parseReminder);

module.exports = router;
