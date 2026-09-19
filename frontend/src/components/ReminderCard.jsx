import { 
  Home, 
  Car, 
  FileText, 
  CreditCard, 
  ShoppingBag, 
  RefreshCw, 
  Users, 
  Tag, 
  Calendar, 
  Clock, 
  Bell, 
  Check, 
  Pencil, 
  Ban, 
  Trash2 
} from "lucide-react";

const PRIORITY_BAR = {
  High: "bg-red-500",
  Medium: "bg-amber-400",
  Low: "bg-emerald-400",
};

const PRIORITY_BADGE = {
  High:   "bg-red-950/80 text-red-300 border-red-800/80",
  Medium: "bg-amber-950/80 text-amber-300 border-amber-800/80",
  Low:    "bg-emerald-950/80 text-emerald-300 border-emerald-800/80",
};

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

const STATUS_STYLES = {
  Active:    "text-indigo-300 bg-indigo-950/80 border-indigo-800/80",
  Completed: "text-emerald-300 bg-emerald-950/80 border-emerald-800/80",
  Cancelled: "text-slate-400 bg-slate-800 border-slate-700",
};

const fmt = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const ReminderCard = ({ reminder, onEdit, onDelete, onComplete, onCancel, actionLoading }) => {
  const isActive = reminder.status === "Active";
  const isDone   = !isActive;

  const CategoryIcon = CATEGORY_ICONS[reminder.category] || Tag;

  return (
    <div className={`card overflow-hidden flex flex-col transition-all duration-200 ${
      isDone ? "bg-slate-900/60 opacity-60 border-slate-800" : "hover:-translate-y-0.5 hover:shadow-xl hover:border-slate-700"
    }`}>
      {/* Priority accent bar */}
      <div className={`h-1 w-full ${PRIORITY_BAR[reminder.priority] ?? "bg-slate-700"}`} />

      <div className="p-4.5 sm:p-5 flex flex-col gap-3.5 flex-1">
        {/* Header / Title Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDone ? "bg-slate-800 text-slate-500 border border-slate-700/50" : "bg-indigo-950/80 text-indigo-400 border border-indigo-900/80"
            }`}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 pt-0.5">
              <h3 className={`font-bold text-sm leading-snug tracking-tight ${
                isDone ? "line-through text-slate-500" : "text-white"
              }`}>
                {reminder.title}
              </h3>
              {reminder.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {reminder.description}
                </p>
              )}
            </div>
          </div>
          <span className={`badge shrink-0 font-semibold ${PRIORITY_BADGE[reminder.priority]}`}>
            {reminder.priority}
          </span>
        </div>

        {/* Metadata info row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {fmt(reminder.reminderDate)}
          </span>
          {reminder.reminderTime && (
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {reminder.reminderTime}
            </span>
          )}
          {reminder.reminderDaysBefore > 0 && (
            <span className="flex items-center gap-1 text-slate-300">
              <Bell className="w-3.5 h-3.5 text-slate-400" />
              {reminder.reminderDaysBefore}d before
            </span>
          )}
          <span className={`ml-auto badge font-semibold ${STATUS_STYLES[reminder.status]}`}>
            {reminder.status}
          </span>
        </div>

        {/* Action buttons */}
        {isActive && (
          <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-800 mt-auto">
            <button 
              onClick={() => onComplete(reminder._id)} 
              disabled={actionLoading} 
              aria-label="Mark as done"
              className="inline-flex items-center justify-center gap-1 text-xs py-2 rounded-xl bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border border-emerald-800/60 font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Done</span>
            </button>
            <button 
              onClick={() => onEdit(reminder)} 
              disabled={actionLoading} 
              aria-label="Edit reminder"
              className="inline-flex items-center justify-center gap-1 text-xs py-2 rounded-xl bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/80 border border-indigo-800/60 font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Edit</span>
            </button>
            <button 
              onClick={() => onCancel(reminder._id)} 
              disabled={actionLoading} 
              aria-label="Cancel reminder"
              className="inline-flex items-center justify-center gap-1 text-xs py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cancel</span>
            </button>
            <button 
              onClick={() => onDelete(reminder._id)} 
              disabled={actionLoading} 
              aria-label="Delete reminder"
              className="inline-flex items-center justify-center gap-1 text-xs py-2 rounded-xl bg-red-950/60 text-red-300 hover:bg-red-900/80 border border-red-800/60 font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Delete</span>
            </button>
          </div>
        )}
        {isDone && (
          <div className="flex justify-end pt-3 border-t border-slate-800 mt-auto">
            <button 
              onClick={() => onDelete(reminder._id)} 
              disabled={actionLoading} 
              aria-label="Delete reminder"
              className="inline-flex items-center gap-1 text-xs py-1.5 px-3 rounded-xl bg-red-950/60 text-red-300 hover:bg-red-900/80 border border-red-800/60 font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderCard;
