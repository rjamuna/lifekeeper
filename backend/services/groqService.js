const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "openai/gpt-oss-120b";

const VALID_CATEGORIES = ["Home", "Vehicle", "Documents", "Finance", "Shopping", "Subscription", "Family", "Custom"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];

const SYSTEM_PROMPT = `You are LifeKeeper, an AI reminder extraction assistant.
Convert the user's natural-language reminder into structured JSON.

Supported categories: Home, Vehicle, Documents, Finance, Shopping, Subscription, Family, Custom
Supported priorities: Low, Medium, High

If the user speaks Tamil or Tanglish, understand it and return structured information with the title translated to English.

Return ONLY a valid JSON object — no explanation, no markdown, no extra text.

JSON shape:
{
  "title": "short clear English title (max 60 chars)",
  "description": "optional extra detail or empty string",
  "category": "one of the supported categories",
  "reminderDate": "YYYY-MM-DD",
  "reminderTime": "HH:MM in 24h format or null if not mentioned",
  "priority": "Low | Medium | High",
  "reminderDaysBefore": 1,
  "language": "en | ta | hi",
  "clarificationNeeded": false,
  "clarificationMessage": ""
}

Rules:
- reminderDate: resolve relative dates (today, tomorrow, next Monday, in 7 days, next month) using the current date provided by the user message context.
- If the date is ambiguous (e.g. "December 10" with no year), use the next upcoming occurrence.
- reminderDaysBefore: default 1. If user says "7 days before", use 7.
- clarificationNeeded: true ONLY if you genuinely cannot determine the title OR the date. false otherwise.
- Do NOT invent dates. If truly unknown, set clarificationNeeded to true.
- language: "ta" for Tamil/Tanglish input, "hi" for Hindi, "en" otherwise.`;

const buildUserMessage = (userMessage, todayISO) =>
  `Today's date is ${todayISO}.\n\nUser message: "${userMessage}"`;

const extractJSON = (text) => {
  // Strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const braceStart = raw.indexOf("{");
  const braceEnd = raw.lastIndexOf("}");
  if (braceStart === -1 || braceEnd === -1) throw new Error("No JSON object found in AI response");
  return JSON.parse(raw.slice(braceStart, braceEnd + 1));
};

const validateParsed = (parsed) => {
  const errors = [];
  if (!parsed.title || typeof parsed.title !== "string" || !parsed.title.trim()) {
    errors.push("title is missing");
  }
  if (!parsed.reminderDate || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.reminderDate)) {
    errors.push("reminderDate is missing or invalid (expected YYYY-MM-DD)");
  }
  if (!VALID_CATEGORIES.includes(parsed.category)) {
    parsed.category = "Custom"; // safe fallback
  }
  if (!VALID_PRIORITIES.includes(parsed.priority)) {
    parsed.priority = "Medium"; // safe fallback
  }
  if (typeof parsed.reminderDaysBefore !== "number" || parsed.reminderDaysBefore < 0) {
    parsed.reminderDaysBefore = 1;
  }
  return errors;
};

const parseReminderText = async (userMessage, todayISO) => {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your_groq_api_key_here") {
    throw new Error("GROQ_API_KEY is not configured in backend .env");
  }
  if (!userMessage || !userMessage.trim()) {
    throw new Error("User message is empty.");
  }

  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: buildUserMessage(userMessage, todayISO) },
      ],
      temperature: 0.1,
      max_tokens: 400,
    });
  } catch (err) {
    if (err.status === 401) throw new Error("Invalid Groq API key. Check your backend .env file.");
    if (err.status === 403) throw new Error("Groq API access denied. Check your API key permissions.");
    if (err.status === 404) throw new Error(`Groq model '${MODEL}' not found. Check your Groq account access at console.groq.com.`);
    if (err.status === 429) throw new Error("Groq API rate limit reached. Please try again in a moment.");
    if (err.status >= 500) throw new Error("Groq API is temporarily unavailable. Please try again shortly.");
    if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT" || err.code === "ENOTFOUND") throw new Error("Could not reach Groq API. Check your internet connection.");
    throw new Error(`Groq API error: ${err.message}`);
  }

  const rawText = completion.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("Groq returned an empty response.");

  let parsed;
  try {
    parsed = extractJSON(rawText);
  } catch {
    throw new Error("AI returned an unreadable response. Please rephrase your reminder.");
  }

  // If AI itself flagged it needs clarification
  if (parsed.clarificationNeeded === true) {
    return { needsClarification: true, clarificationMessage: parsed.clarificationMessage || "Could you provide more details about the reminder?" };
  }

  const validationErrors = validateParsed(parsed);
  if (validationErrors.length > 0) {
    return {
      needsClarification: true,
      clarificationMessage: `I couldn't extract: ${validationErrors.join(", ")}. Could you rephrase with a clear title and date?`,
    };
  }

  return {
    needsClarification: false,
    data: {
      title: parsed.title.trim(),
      description: (parsed.description || "").trim(),
      category: parsed.category,
      reminderDate: parsed.reminderDate,
      reminderTime: parsed.reminderTime || "09:00",
      priority: parsed.priority,
      reminderDaysBefore: parsed.reminderDaysBefore,
      language: parsed.language || "en",
      source: "AI",
    },
  };
};

module.exports = { parseReminderText };
