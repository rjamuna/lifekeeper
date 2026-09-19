import { useState } from "react";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  Bell, 
  Check, 
  Pencil, 
  RotateCcw,
  Home, 
  Car, 
  FileText, 
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

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
};

const Detail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5">
    <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
      <p className="text-xs font-bold text-slate-100 mt-0.5">{value}</p>
    </div>
  </div>
);

const AIConfirmCard = ({ parsed, onConfirm, onRetry, saving }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(parsed);

  const handleConfirm = () => onConfirm(editData);

  const handleEditSave = async (updated) => {
    setEditData(updated);
    setShowEdit(false);
    await onConfirm(updated);
  };

  const CategoryIcon = CATEGORY_ICONS[editData.category] || Tag;

  return (
    <>
      {showEdit && (
        <ReminderForm
          initial={{ ...editData, reminderDate: editData.reminderDate }}
          onSave={handleEditSave}
          onClose={() => setShowEdit(false)}
        />
      )}

      <div className="card border-indigo-900/80 overflow-hidden shadow-xl bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 to-slate-900 px-5 py-3 flex items-center gap-2 border-b border-indigo-900/60">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <p className="text-xs font-bold text-indigo-200">AI Parsed Details</p>
          <span className="ml-auto text-[10px] font-bold text-indigo-300 bg-indigo-900/80 px-2.5 py-0.5 rounded-full border border-indigo-700/60">
            {editData.language === "ta" ? "Tamil" : editData.language === "hi" ? "Hindi" : "English"}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-900/80">
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg leading-tight">{editData.title}</h3>
              {editData.description && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{editData.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Detail icon={Calendar} label="Date" value={formatDate(editData.reminderDate)} />
            <Detail icon={Clock} label="Time" value={editData.reminderTime || "09:00"} />
            <Detail icon={Tag} label="Category" value={editData.category} />
            <Detail
              icon={Bell}
              label="Remind before"
              value={editData.reminderDaysBefore === 0 ? "On the day" : `${editData.reminderDaysBefore} day${editData.reminderDaysBefore !== 1 ? "s" : ""} before`}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400">Priority:</span>
            <span className={`badge font-bold ${PRIORITY_COLORS[editData.priority]}`}>{editData.priority}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-800 flex gap-2 bg-slate-950/40">
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="btn-primary flex-1 py-2.5"
          >
            {saving ? (
              <><span className="spinner" /> Saving…</>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm & Save
              </>
            )}
          </button>
          <button onClick={() => setShowEdit(true)} disabled={saving} className="btn-secondary px-4">
            <Pencil className="w-4 h-4 text-slate-400" />
            Edit
          </button>
          <button onClick={onRetry} disabled={saving} className="btn-ghost px-4">
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </>
  );
};

export default AIConfirmCard;
