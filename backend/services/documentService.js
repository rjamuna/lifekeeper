const pdfParse = require("pdf-parse");
const sharp = require("sharp");
const { fromBuffer } = require("pdf2pic");
const Tesseract = require("tesseract.js");

const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PDF_MIME = "application/pdf";

const MIN_LONGEST_SIDE = 1200; // upscale small images so Tesseract can read them

/**
 * Preprocess an image buffer for OCR:
 *  - Auto-rotate from EXIF
 *  - Upscale if shortest longest-side < MIN_LONGEST_SIDE
 *  - Grayscale
 *  - Normalise contrast
 *  - Sharpen
 *  - Output as PNG (lossless, better for OCR)
 */
const preprocessForOCR = async (buffer) => {
  const meta = await sharp(buffer).rotate().metadata();
  const longest = Math.max(meta.width || 0, meta.height || 0);

  let pipeline = sharp(buffer).rotate();

  if (longest > 0 && longest < MIN_LONGEST_SIDE) {
    const scale = Math.ceil(MIN_LONGEST_SIDE / longest);
    pipeline = pipeline.resize({
      width: (meta.width || 0) * scale,
      height: (meta.height || 0) * scale,
      kernel: sharp.kernel.nearest,
    });
  }

  const processed = await pipeline
    .grayscale()
    .normalise()
    .sharpen()
    .png()
    .toBuffer();

  const pmeta = await sharp(processed).metadata();
  return { buffer: processed, width: pmeta.width, height: pmeta.height };
};

/**
 * Run Tesseract OCR on a preprocessed image buffer.
 * Returns the extracted text string.
 */
const runOCR = async (imageBuffer) => {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng", {
    logger: () => {}, // suppress progress logs
  });
  return (text || "").trim();
};

/**
 * Process an image file: preprocess → OCR.
 * Returns { text, method: "ocr-image", width, height }
 */
const processImage = async (buffer) => {
  const { buffer: processed, width, height } = await preprocessForOCR(buffer);
  const text = await runOCR(processed);
  return { text, method: "ocr-image", width, height };
};

/**
 * Process a PDF:
 *  1. Try pdf-parse for a text layer (fast path).
 *  2. If text is too short (scanned PDF), render page 1 → image → OCR.
 * Returns { text, method: "pdf-text" | "ocr-pdf" }
 */
const processPDF = async (buffer) => {
  // Try text layer first
  let textContent = "";
  try {
    const parsed = await pdfParse(buffer, { max: 3 });
    textContent = (parsed.text || "").trim();
  } catch {
    // fall through to image render
  }

  if (textContent.length > 100) {
    return { text: textContent.slice(0, 8000), method: "pdf-text" };
  }

  // Render page 1 to image and OCR it
  const converter = fromBuffer(buffer, {
    density: 200,
    format: "jpeg",
    width: 1600,
    height: 2200,
    preserveAspectRatio: true,
  });

  const page = await converter(1, { responseType: "buffer" });
  const imgBuffer = page.buffer || page;

  const { buffer: processed, width, height } = await preprocessForOCR(imgBuffer);
  const text = await runOCR(processed);
  return { text, method: "ocr-pdf", width, height };
};

/**
 * Main entry point called by the controller.
 * Returns { text, method, width?, height? }
 */
const prepareFileForGroq = async (buffer, mimetype, originalname) => {
  const mime = mimetype.toLowerCase();

  if (IMAGE_MIMES.includes(mime)) {
    return processImage(buffer);
  }

  if (mime === PDF_MIME) {
    return processPDF(buffer);
  }

  throw new Error(
    `Unsupported file type: ${mimetype}. Please upload a JPG, PNG, WEBP, or PDF.`
  );
};

module.exports = { prepareFileForGroq };
