const express = require("express");
const multer  = require("multer");
const { extractDocument } = require("../controllers/documentController");

const router = express.Router();

const ALLOWED_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a JPG, PNG, WEBP, or PDF.`));
    }
  },
});

// Accept field name "document" (primary) — matches frontend FormData.append("document", file)
const handleUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File is too large. Maximum size is 20 MB." });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Primary endpoint — field name: "document"
router.post("/analyze", handleUpload("document"), extractDocument);

// Backward-compat alias — field name: "file"
router.post("/extract", handleUpload("file"), extractDocument);

module.exports = router;
