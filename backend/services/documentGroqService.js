const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "openai/gpt-oss-120b";

const VALID_CATEGORIES = [
  "Home", "Vehicle", "Documents", "Finance",
  "Shopping", "Subscription", "Family", "Custom",
];

const SYSTEM_PROMPT = `You are LifeKeeper's document understanding assistant.

Analyze OCR text extracted from household documents. Extract important information that can become a reminder.

Possible information:
- document type (e.g. Warranty Card, Invoice, Insurance Policy, Vehicle Document, Service Record, Bill, Subscription Receipt, Rent Agreement)
- item/product name
- brand
- model number
- purchase date
- warranty start date
- warranty end date
- extended warranty start date / extended warranty end date
- expiry date
- service date
- renewal date
- due date
- action required
- category (one of: Home, Vehicle, Documents, Finance, Shopping, Subscription, Family, Custom)

Rules:
- Never invent information. If a value is not present or cannot be confidently determined, return null.
- If an extended warranty end date exists, use it as the warrantyEndDate.
- Convert all recognizable dates to YYYY-MM-DD format.
- Support date formats like: 22.10.2024, 22/10/2024, 22-10-2024, October 22 2024, 22 October 2024.
- Do not confuse day and month. If ambiguous, return null.
- Return ONLY a valid JSON object, no markdown, no explanation.

Return exactly this JSON structure:
{
  "documentType": null,
  "itemName": null,
  "brand": null,
  "modelNumber": null,
  "purchaseDate": null,
  "warrantyStartDate": null,
  "warrantyEndDate": null,
  "expiryDate": null,
  "serviceDate": null,
  "renewalDate": null,
  "dueDate": null,
  "actionRequired": null,
  "category": null,
  "confidence": 0,
  "suggestedReminderDaysBefore": 30,
  "extractionNotes": ""
}`;

const extractJSON = (raw) => {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const src = fenced ? fenced[1] : raw;
  const start = src.indexOf("{");
  const end = src.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in AI response");
  return JSON.parse(src.slice(start, end + 1));
};

const sanitise = (parsed) => {
  if (!VALID_CATEGORIES.includes(parsed.category)) parsed.category = "Custom";

  const dateFields = [
    "purchaseDate", "warrantyStartDate", "warrantyEndDate",
    "expiryDate", "serviceDate", "renewalDate", "dueDate",
  ];
  for (const f of dateFields) {
    if (parsed[f] && !/^\d{4}-\d{2}-\d{2}$/.test(String(parsed[f]))) {
      console.log(`[DOC] Invalid date format for ${f}: ${parsed[f]} — setting null`);
      parsed[f] = null;
    }
  }

  if (typeof parsed.confidence === "string") {
    parsed.confidence = { high: 0.9, medium: 0.6, low: 0.3 }[parsed.confidence] ?? 0.5;
  }
  if (typeof parsed.confidence !== "number" || parsed.confidence < 0 || parsed.confidence > 1) {
    parsed.confidence = 0.5;
  }

  if (typeof parsed.suggestedReminderDaysBefore !== "number" || parsed.suggestedReminderDaysBefore < 0) {
    parsed.suggestedReminderDaysBefore = 30;
  }

  parsed.primaryDate =
    parsed.warrantyEndDate  ||
    parsed.expiryDate       ||
    parsed.renewalDate      ||
    parsed.dueDate          ||
    parsed.serviceDate      ||
    parsed.warrantyStartDate ||
    parsed.purchaseDate     ||
    null;

  parsed.priority = !parsed.primaryDate ? "Low"
    : parsed.confidence >= 0.75 ? "High"
    : parsed.confidence >= 0.45 ? "Medium"
    : "Low";

  if (!parsed.title) {
    const subject = [parsed.brand, parsed.itemName].filter(Boolean).join(" ") || parsed.documentType || "Document";
    const action = parsed.actionRequired || "Reminder";
    parsed.title = `${subject} — ${action}`.slice(0, 80);
  }

  return parsed;
};

/**
 * Send OCR-extracted text to Groq and return structured document data.
 * @param {{ text: string, method: string }} prepared
 * @param {string} filename
 * @param {string} todayISO  YYYY-MM-DD
 */
const analyzeDocument = async (prepared, filename, todayISO) => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    throw new Error("GROQ_API_KEY is not configured in backend .env");
  }

  const { text } = prepared;

  console.log("[DOC] Sending OCR text to Groq...");
  console.log("[DOC] model:", MODEL);
  console.log("[DOC] OCR text length:", text.length);

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Today's date is ${todayISO}.\nFilename: ${filename}\n\nOCR extracted text:\n---\n${text.slice(0, 6000)}\n---\n\nExtract all important information and return valid JSON only.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_completion_tokens: 1000,
    });
  } catch (err) {
    console.error("[DOC] Groq error:", err.status, err.message);
    if (err.status === 401) throw new Error("Invalid Groq API key.");
    if (err.status === 403) throw new Error("Groq API access denied.");
    if (err.status === 404) throw new Error(`Groq model '${MODEL}' not found. Check console.groq.com.`);
    if (err.status === 429) throw new Error("Groq rate limit reached. Please try again in a moment.");
    if (err.status >= 500) throw new Error("Groq API is temporarily unavailable.");
    throw new Error(`Groq API error: ${err.message}`);
  }

  console.log("[DOC] Groq response received");

  const rawText = completion?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("Groq returned an empty response.");

  console.log("[DOC] Raw Groq response (first 400 chars):", rawText.slice(0, 400));

  let parsed;
  try {
    parsed = extractJSON(rawText);
  } catch (e) {
    console.error("[DOC] JSON parse failed. Full raw response:", rawText);
    throw new Error("AI returned an unreadable response for this document.");
  }

  parsed = sanitise(parsed);

  const hasUsefulData = parsed.primaryDate || parsed.itemName || parsed.documentType;
  if (!hasUsefulData) {
    return {
      canExtract: false,
      documentType: parsed.documentType || "Unknown document",
      extractionNotes: "No useful dates or reminder information found in this document.",
    };
  }

  return {
    canExtract: true,
    extractionMethod: prepared.method,
    documentType:                parsed.documentType              || "",
    itemName:                    parsed.itemName                  || "",
    brand:                       parsed.brand                     || null,
    modelNumber:                 parsed.modelNumber               || null,
    purchaseDate:                parsed.purchaseDate              || null,
    warrantyStartDate:           parsed.warrantyStartDate         || null,
    warrantyEndDate:             parsed.warrantyEndDate           || null,
    expiryDate:                  parsed.expiryDate                || null,
    serviceDate:                 parsed.serviceDate               || null,
    renewalDate:                 parsed.renewalDate               || null,
    dueDate:                     parsed.dueDate                   || null,
    actionRequired:              parsed.actionRequired            || "",
    category:                    parsed.category,
    priority:                    parsed.priority,
    title:                       parsed.title,
    suggestedReminderDate:       parsed.primaryDate,
    suggestedReminderDaysBefore: parsed.suggestedReminderDaysBefore,
    confidence:                  parsed.confidence,
    extractionNotes:             parsed.extractionNotes           || "",
  };
};

module.exports = { analyzeDocument };
