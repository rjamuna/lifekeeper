import { useState } from "react";
import { Plus, Search, AlertCircle, Filter, X } from "lucide-react";
import { useReminders } from "../hooks/useReminders";
import ReminderForm from "../components/ReminderForm";
import ReminderCard from "../components/ReminderCard";
import Toast from "../components/Toast";

const STATUSES   = ["All", "Active", "Completed", "Cancelled"];
const CATEGORIES = ["All", "Home", "Vehicle", "Documents", "Finance", "Shopping", "Subscription", "Family", "Custom"];
const PRIORITIES = ["All", "High", "Medium", "Low"];

const Chips = ({ label, options, value, onChange }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs font-semibold text-slate-400 w-16 shrink-0 uppercase tracking-wider">{label}</span>
    <div className="flex flex-wrap gap-1.5 flex-1">
      {options.map((opt) => (
        <button 
          key={opt} 
          onClick={() => onChange(opt)}
          className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all duration-150 ${
            value === opt
              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
              : "border-slate-700/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800 bg-slate-900"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const RemindersPage = () => {
  const { reminders, loading, error, addReminder, editReminder, removeReminder, markComplete, markCancelled } = useReminders();

  const [showForm, setShowForm]           = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]                 = useState(null);
  const [filters, setFilters]             = useState({ status: "All", category: "All", priority: "All", search: "" });

  const notify = (message, type = "success") => setToast({ message, type });

  const filtered = reminders.filter((r) => {
    if (filters.status   !== "All" && r.status   !== filters.status)   return false;
    if (filters.category !== "All" && r.category !== filters.category) return false;
    if (filters.priority !== "All" && r.priority !== filters.priority) return false;
    if (filters.search && !r.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleSave = async (body) => {
    if (editTarget) { await editReminder(editTarget._id, body); notify("Reminder updated"); }
    else            { await addReminder(body); notify("Reminder saved"); }
    setEditTarget(null);
  };

  const handleEdit = (r) => { setEditTarget(r); setShowForm(true); };

  const wrap = async (fn, msg) => {
    setActionLoading(true);
    try { await fn(); notify(msg); }
    catch (e) { notify(e.message, "error"); }
    finally { setActionLoading(false); }
  };

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const hasActiveFilters = filters.status !== "All" || filters.category !== "All" || filters.priority !== "All" || filters.search;

  return (
    <div className="min-h-screen pb-16">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {(showForm || editTarget) && (
        <ReminderForm 
          initial={editTarget} 
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }} 
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="page-title">All Reminders</h1>
            <p className="text-sm text-slate-400 mt-1">
              {reminders.length} total reminder{reminders.length !== 1 ? "s" : ""}
              {hasActiveFilters && filtered.length !== reminders.length && ` · ${filtered.length} matching filters`}
            </p>
          </div>
          <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>

        {/* Filters Card */}
        <div className="card p-5 mb-8 flex flex-col gap-4 shadow-sm border-slate-800 bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search reminders by title…" 
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)} 
              className="input pl-10" 
            />
            {filters.search && (
              <button 
                onClick={() => setFilter("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
            <Chips label="Status"   options={STATUSES}   value={filters.status}   onChange={(v) => setFilter("status", v)} />
            <Chips label="Priority" options={PRIORITIES} value={filters.priority} onChange={(v) => setFilter("priority", v)} />
            <Chips label="Category" options={CATEGORIES} value={filters.category} onChange={(v) => setFilter("category", v)} />
          </div>
          {hasActiveFilters && (
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setFilters({ status: "All", category: "All", priority: "All", search: "" })}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton" />)}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card border-red-900/60 bg-red-950/50 p-4 text-red-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>Failed to load reminders: {error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="card p-12 flex flex-col items-center justify-center text-center animate-fade-up border-dashed border-slate-800 bg-slate-900 my-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
              <Filter className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-white text-base">
              {reminders.length === 0 ? "No reminders yet" : "No reminders match your filters"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {reminders.length === 0 ? "Create your first reminder to get started." : "Try adjusting your filter options or search query."}
            </p>
            {reminders.length === 0 && (
              <button onClick={() => setShowForm(true)} className="btn-primary mt-5">
                <Plus className="w-4 h-4" />
                Add your first reminder
              </button>
            )}
          </div>
        )}

        {/* Reminders 2-Column Desktop Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 animate-fade-up">
            {filtered.map((r) => (
              <ReminderCard 
                key={r._id} 
                reminder={r} 
                onEdit={handleEdit}
                onDelete={(id) => wrap(() => removeReminder(id), "Reminder deleted")}
                onComplete={(id) => wrap(() => markComplete(id), "Marked as completed")}
                onCancel={(id) => wrap(() => markCancelled(id), "Reminder cancelled")}
                actionLoading={actionLoading} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;
