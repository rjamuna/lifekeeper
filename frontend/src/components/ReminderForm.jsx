import { useState, useEffect } from "react";
import { 
  X, 
  Home, 
  Car, 
  FileText, 
  CreditCard, 
  ShoppingBag, 
  RefreshCw, 
  Users, 
  Tag
} from "lucide-react";

const CATEGORIES = ["Home", "Vehicle", "Documents", "Finance", "Shopping", "Subscription", "Family", "Custom"];
const PRIORITIES  = ["Low", "Medium", "High"];

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

const PRIORITY_STYLES = {
  Low:    "border-emerald-700 bg-emerald-950/80 text-emerald-300 shadow-xs",
  Medium: "border-amber-700 bg-amber-950/80 text-amber-300 shadow-xs",
  High:   "border-red-700 bg-red-950/80 text-red-300 shadow-xs",
};

const empty = {
  title: "", description: "", category: "Custom", reminderDate: "",
  reminderTime: "09:00", priority: "Medium", reminderDaysBefore: 1,
};

const ReminderForm = ({ onSave, onClose, initial = null }) => {
  const [form, setForm] = useState(initial ? {
    title:              initial.title || "",
    description:        initial.description || "",
    category:           initial.category || "Custom",
    reminderDate:       initial.reminderDate?.slice(0, 10) ?? "",
    reminderTime:       initial.reminderTime || "09:00",
    priority:           initial.priority || "Medium",
    reminderDaysBefore: initial.reminderDaysBefore ?? 1,
  } : empty);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())          e.title = "Title is required";
    else if (form.title.length > 100) e.title = "Max 100 characters";
    if (!form.reminderDate)           e.reminderDate = "Date is required";
    if (form.description.length > 500) e.description = "Max 500 characters";
    if (form.reminderDaysBefore < 0)  e.reminderDaysBefore = "Cannot be negative";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({ ...form, reminderDaysBefore: Number(form.reminderDaysBefore) });
      onClose();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-xs px-0 sm:px-4 transition-all duration-200">
      <div className="bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] flex flex-col animate-scale-in border border-slate-800 text-slate-100">

        {/* Mobile handle indicator */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-800 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {initial ? "Edit Reminder" : "New Reminder"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {initial ? "Update the details below" : "Fill in the details to schedule a reminder"}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">
          {errors.submit && (
            <p className="text-xs font-semibold text-red-300 bg-red-950/80 border border-red-800 rounded-xl px-4 py-3">{errors.submit}</p>
          )}

          {/* Title Input */}
          <div>
            <label className="label">Reminder Title</label>
            <input
              type="text"
              placeholder="e.g. Car Insurance Renewal"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={`input ${errors.title ? "input-error" : ""}`}
              autoFocus
            />
            {errors.title && <p className="text-xs font-medium text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Category Chip Selector */}
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat] || Tag;
                const isSelected = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => set("category", cat)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                      isSelected
                        ? "bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-xs"
                        : "border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800 bg-slate-950/40"
                    }`}
                  >
                    <CatIcon className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                    <span className="truncate w-full text-center">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.reminderDate}
                  onChange={(e) => set("reminderDate", e.target.value)}
                  className={`input ${errors.reminderDate ? "input-error" : ""}`}
                />
              </div>
              {errors.reminderDate && <p className="text-xs font-medium text-red-400 mt-1">{errors.reminderDate}</p>}
            </div>

            <div>
              <label className="label">Time</label>
              <input
                type="time"
                value={form.reminderTime}
                onChange={(e) => set("reminderTime", e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Priority & Days Before Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => {
                  const isSelected = form.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set("priority", p)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all duration-150 ${
                        isSelected
                          ? PRIORITY_STYLES[p]
                          : "border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800 bg-slate-950/40"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label">Notify Before (Days)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={form.reminderDaysBefore}
                onChange={(e) => set("reminderDaysBefore", e.target.value)}
                className={`input ${errors.reminderDaysBefore ? "input-error" : ""}`}
              />
              {errors.reminderDaysBefore && <p className="text-xs font-medium text-red-400 mt-1">{errors.reminderDaysBefore}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              rows="3"
              placeholder="Add additional notes, policy numbers, or details…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={`input resize-none ${errors.description ? "input-error" : ""}`}
            />
            {errors.description && <p className="text-xs font-medium text-red-400 mt-1">{errors.description}</p>}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800 mt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
              {saving && <span className="spinner" />}
              {saving ? "Saving…" : initial ? "Update Reminder" : "Create Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;
