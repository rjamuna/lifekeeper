const { prepareFileForGroq } = require("../services/documentService");
const { analyzeDocument }    = require("../services/documentGroqService");

const extractDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file received. Make sure the FormData field name is 'document'.",
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    console.log("[DOC] Upload received:", originalname, `| ${mimetype} | ${(size / 1024).toFixed(1)} KB`);

    if (size > 20 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: "File is too large. Maximum size is 20 MB." });
    }

    // ── Step 1: Preprocess + OCR ────────────────────────────────────────────
    let prepared;
    try {
      prepared = await prepareFileForGroq(buffer, mimetype, originalname);
      if (prepared.width && prepared.height) {
        console.log(`[DOC] Processed image: ${prepared.width}x${prepared.height}px`);
      }
      console.log(`[DOC] OCR method: ${prepared.method} | text length: ${prepared.text?.length ?? 0}`);
    } catch (err) {
      console.error("[DOC] Preprocessing/OCR error:", err.message);
      return res.status(422).json({
        success: false,
        message: err.message,
        canRetryManually: true,
      });
    }

    // ── OCR quality check ───────────────────────────────────────────────────
    const MIN_OCR_CHARS = 20;
    if (!prepared.text || prepared.text.length < MIN_OCR_CHARS) {
      console.log("[DOC] OCR result too short:", JSON.stringify(prepared.text));
      return res.status(422).json({
        success: false,
        stage: "ocr",
        message: "LifeKeeper could not read enough text from this document.",
        canRetryManually: true,
      });
    }

    // Log OCR text for debugging (first 300 chars)
    console.log("[DOC] OCR text preview:", prepared.text.slice(0, 300));

    // ── Step 2: Groq analysis ───────────────────────────────────────────────
    const todayISO = new Date().toISOString().slice(0, 10);
    let analysis;
    try {
      analysis = await analyzeDocument(prepared, originalname, todayISO);
      console.log("[DOC] Analysis complete, canExtract:", analysis.canExtract);
    } catch (err) {
      console.error("[DOC] Groq error:", err.message);
      return res.status(502).json({
        success: false,
        message: `LifeKeeper couldn't analyse this document. ${err.message}`,
        canRetryManually: true,
      });
    }

    return res.status(200).json({ success: true, filename: originalname, ...analysis });
  } catch (err) {
    console.error("[DOC] Unexpected error:", err.message);
    next(err);
  }
};

module.exports = { extractDocument };
