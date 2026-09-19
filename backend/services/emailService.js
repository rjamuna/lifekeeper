const nodemailer = require("nodemailer");

// Transporter is created lazily so missing env vars don't crash startup
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null; // email not configured — skip silently
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (not your login password)
    },
  });

  return _transporter;
};

/**
 * Build a human-readable notification body from a reminder.
 * Uses the actual reminderDate — nothing is hardcoded.
 */
const buildEmailBody = (userName, reminder) => {
  const eventDate = new Date(reminder.reminderDate);
  const todayIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  todayIST.setHours(0, 0, 0, 0);
  const eventIST = new Date(eventDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  eventIST.setHours(0, 0, 0, 0);

  const diffDays = Math.round((eventIST - todayIST) / (1000 * 60 * 60 * 24));

  let dueText;
  if (diffDays > 1)       dueText = `due in ${diffDays} days`;
  else if (diffDays === 1) dueText = "due tomorrow";
  else if (diffDays === 0) dueText = "due today";
  else                     dueText = `overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`;

  const formattedDate = eventDate.toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  });

  const subject = `🔔 LifeKeeper: ${reminder.title} is ${dueText}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9fafb;padding:24px;border-radius:12px;">
      <div style="background:#2563eb;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
        <h1 style="color:#fff;margin:0;font-size:20px;">🔐 LifeKeeper</h1>
        <p style="color:#bfdbfe;margin:4px 0 0;font-size:13px;">Your personal reminder</p>
      </div>

      <div style="background:#fff;border-radius:8px;padding:20px 24px;border:1px solid #e5e7eb;">
        <p style="color:#374151;font-size:15px;margin:0 0 16px;">Hi <strong>${userName}</strong>,</p>

        <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:14px 16px;border-radius:4px;margin-bottom:16px;">
          <p style="margin:0;font-size:17px;font-weight:bold;color:#1e40af;">${reminder.title}</p>
          <p style="margin:6px 0 0;font-size:14px;color:#3b82f6;">
            📅 ${formattedDate} &nbsp;·&nbsp; <strong>${dueText.charAt(0).toUpperCase() + dueText.slice(1)}</strong>
          </p>
        </div>

        ${reminder.description ? `<p style="color:#6b7280;font-size:13px;margin:0 0 12px;">${reminder.description}</p>` : ""}

        <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;color:#9ca3af;width:110px;">Category</td>
            <td style="padding:4px 0;">${reminder.category || "—"}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#9ca3af;">Priority</td>
            <td style="padding:4px 0;">${reminder.priority || "—"}</td>
          </tr>
        </table>
      </div>

      <p style="color:#9ca3af;font-size:11px;text-align:center;margin-top:16px;">
        You're receiving this because you have an active reminder in LifeKeeper.<br/>
        Open LifeKeeper to manage your reminders.
      </p>
    </div>
  `;

  const text = `Hi ${userName},\n\n${reminder.title} is ${dueText}.\nDate: ${formattedDate}\nCategory: ${reminder.category}\nPriority: ${reminder.priority}\n\nOpen LifeKeeper to manage your reminders.`;

  return { subject, html, text };
};

/**
 * Send a reminder notification email to the reminder owner.
 *
 * @param {string} toEmail   - The owner's email address (from MongoDB User, via req.user.id)
 * @param {string} userName  - The owner's name (from MongoDB User)
 * @param {object} reminder  - The reminder document
 * @returns {Promise<boolean>} true if sent, false if skipped/failed
 */
const sendReminderEmail = async (toEmail, userName, reminder) => {
  const transporter = getTransporter();
  if (!transporter) {
    // Email not configured — log once and skip
    console.log("[EMAIL] Skipping — EMAIL_USER/EMAIL_PASS not set in .env");
    return false;
  }

  const { subject, html, text } = buildEmailBody(userName, reminder);

  try {
    await transporter.sendMail({
      from: `"LifeKeeper" <${process.env.EMAIL_USER}>`,
      to: toEmail,           // always the authenticated user's own email from MongoDB
      subject,
      text,
      html,
    });
    console.log(`[EMAIL] Sent to ${toEmail} — "${reminder.title}"`);
    return true;
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${toEmail}:`, err.message);
    return false;
  }
};

module.exports = { sendReminderEmail };
