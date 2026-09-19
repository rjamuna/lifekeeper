import { useState } from "react";
import { 
  FileText, 
  AlertTriangle, 
  Check, 
  Pencil, 
  Edit3, 
  Bell, 
  Calendar, 
  Tag, 
  Home, 
  Car, 
  CreditCard, 
  ShoppingBag, 
  RefreshCw, 
  Users 
} from "lucide-react";
import ReminderForm from "./ReminderForm";

const CATEGORY_ICONS = {
  Home: Home,
  Vehicle: Car,
  Documents: FileText,
  Finance: CreditCard,
  Shopping: ShoppingBag,
  Subscription: RefreshCw,
  Family: Users,
  Custom: Tag,
};

const PRIORITY_COLORS = {
  High:   "text-red-300 bg-red-950/80 border-red-800/80",
  Medium: "text-amber-300 bg-amber-950/80 border-amber-800/80",
  Low:    "text-emerald-300 bg-emerald-950/80 border-emerald-800/80",
};

const METHOD_LABELS = {
  "ocr-image": "OCR",
  "ocr-pdf":   "OCR (PDF)",
  "pdf-text":  "PDF text",
};

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
};

const confidenceInfo = (c) => {
  const pct = Math.round((c ?? 0.5) * 100);
  if (c >= 0.75) return { label: `High confidence (${pct}%)`, bar: "bg-emerald-500", text: "text-emerald-400", warn: false };
  if (c >= 0.45) return { label: `Medium confidence (${pct}%) — verify`, bar: "bg-amber-400", text: "text-amber-300", warn: true };
  return { label: `Low confidence (${pct}%) — review carefully`, bar: "bg-red-400", text: "text-red-300", warn: true };
};

const DateRow = ({ icon: Icon, label, value, highlight }) => {
  if (!value) return null;
  return (
    <div className={`flex items-center gap-3 py-2 border-b border-slate-800 last:border-0 ${highlight ? "bg-indigo-950/60 -mx-4 px-4 rounded-lg" : ""}`}>
      <Icon className={`w-4 h-4 shrink-0 ${highlight ? "text-indigo-400" : "text-slate-400"}`} />
      <span className="text-xs font-semibold text-slate-400 w-36 shrink-0">{label}</span>
      <span className={`text-xs font-bold ${highlight ? "text-indigo-200" : "text-slate-100"}`}>{formatDate(value)}</span>
    </div>
  );
};

const DocumentExtractCard = ({ result, filename, onConfirm, onManual, saving }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [editData] = useState({
    title: result.title || "",
    description: [result.itemName, result.brand, result.actionRequired].filter(Boolean).join(" · "),
    category: result.category || "Custom",
    reminderDate: result.suggestedReminderDate || "",
    reminderTime: "09:00",
    priority: result.priority || "Medium",
    reminderDaysBefore: result.suggestedReminderDaysBefore ?? 7,
  });

  const conf = confidenceInfo(result.confidence);

  const handleEditSave = async (updated) => {
    setShowEdit(false);
    await onConfirm({ ...updated, source: "Document" });
  };

  const handleConfirm = () => onConfirm({ ...editData, source: "Document" });

  const reminderDateLabel = result.suggestedReminderDate
    ? (() => {
        const eventDate = result.warrantyEndDate || result.expiryDate || result.renewalDate || result.dueDate;
        if (eventDate && result.suggestedReminderDaysBefore > 0) {
          return `${formatDate(result.suggestedReminderDate)} (${result.suggestedReminderDaysBefore} days before)`;
        }
        return formatDate(result.suggestedReminderDate);
      })()
    : null;

  const CategoryIcon = CATEGORY_ICONS[result.category] || Tag;

  return (
    <>
      {showEdit && (
        <ReminderForm initial={editData} onSave={handleEditSave} onClose={() => setShowEdit(false)} />
      )}

      <div className="card border-indigo-900/80 overflow-hidden shadow-xl bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-950 to-indigo-950 px-5 py-3.5 border-b border-indigo-900/60 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-violet-900/80 text-violet-300 flex items-center justify-center shrink-0 border border-violet-700/60">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">Document Extracted</p>
              <p className="text-[11px] text-violet-300 font-medium truncate mt-0.5">{filename}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-[11px] font-bold ${conf.text}`}>{conf.label}</span>
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${conf.bar}`} style={{ width: `${Math.round((result.confidence ?? 0.5) * 100)}%` }} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{METHOD_LABELS[result.extractionMethod] || "AI"}</span>
          </div>
        </div>

        {conf.warn && (
          <div className="bg-amber-950/50 border-b border-amber-900/60 px-5 py-2.5 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300 font-semibold">
              {result.confidence < 0.45
                ? "Low confidence — please review and edit all fields before saving."
                : "Please verify the extracted details before saving."}
            </p>
          </div>
        )}

        <div className="px-5 py-5 flex flex-col gap-4">
          {/* Identity */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-900/80">
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-white text-lg leading-tight">{result.title}</h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {result.documentType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded-md border border-indigo-800/80">{result.documentType}</span>
                )}
                {result.brand && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">{result.brand}</span>
                )}
                {result.modelNumber && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md font-mono border border-slate-700">{result.modelNumber}</span>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted Document Dates</p>
            <DateRow icon={Calendar} label="Purchase date"   value={result.purchaseDate} />
            <DateRow icon={Calendar} label="Warranty start"  value={result.warrantyStartDate} />
            <DateRow icon={AlertTriangle} label="Warranty end"    value={result.warrantyEndDate} highlight />
            <DateRow icon={Calendar} label="Expiry date"     value={result.expiryDate} highlight={!result.warrantyEndDate} />
            <DateRow icon={Calendar} label="Renewal date"    value={result.renewalDate} />
            <DateRow icon={Calendar} label="Due date"        value={result.dueDate} />
            <DateRow icon={Calendar} label="Service date"    value={result.serviceDate} />
            {!result.purchaseDate && !result.warrantyStartDate && !result.warrantyEndDate &&
             !result.expiryDate && !result.renewalDate && !result.dueDate && !result.serviceDate && (
              <p className="text-xs text-slate-500 italic py-1">No specific dates extracted</p>
            )}
          </div>

          {/* Suggested reminder */}
          <div className="bg-indigo-950/50 border border-indigo-900/60 rounded-2xl p-4 flex flex-col gap-1.5">
            {result.actionRequired && (
              <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">{result.actionRequired}</p>
            )}
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Suggested Reminder Date</p>
                <p className="text-sm font-extrabold text-white">
                  {reminderDateLabel || "No date — please set manually"}
                </p>
              </div>
              <span className={`ml-auto badge font-bold ${PRIORITY_COLORS[result.priority]}`}>{result.priority}</span>
            </div>
          </div>

          {result.extractionNotes && (
            <p className="text-xs text-amber-300 bg-amber-950/40 border border-amber-900/60 rounded-xl px-3.5 py-2.5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{result.extractionNotes}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-800 flex gap-2 bg-slate-950/40">
          <button
            onClick={handleConfirm}
            disabled={saving || !result.suggestedReminderDate}
            className="btn-primary flex-1 py-2.5"
          >
            {saving ? (
              <><span className="spinner" /> Saving…</>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Reminder
              </>
            )}
          </button>
          <button onClick={() => setShowEdit(true)} disabled={saving} className="btn-secondary px-4">
            <Pencil className="w-4 h-4 text-slate-400" />
            Edit Details
          </button>
          <button onClick={onManual} disabled={saving} className="btn-ghost px-4" title="Enter manually">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {!result.suggestedReminderDate && (
          <p className="px-5 pb-4 text-xs font-semibold text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            No reminder date extracted. Click Edit Details to set a date before saving.
          </p>
        )}
      </div>
    </>
  );
};

export default DocumentExtractCard;
