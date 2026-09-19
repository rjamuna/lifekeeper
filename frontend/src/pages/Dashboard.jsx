import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Inbox,
  AlertTriangle 
} from "lucide-react";
import { useReminders } from "../hooks/useReminders";
import { useHealth } from "../hooks/useHealth";
import { useAuth } from "../context/AuthContext";
import ReminderForm from "../components/ReminderForm";
import ReminderCard from "../components/ReminderCard";
import Toast from "../components/Toast";
import StatusBadge from "../components/StatusBadge";

const today     = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening"; };
const fmtDay = () => new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

const STATS = [
  { key: "overdue",   label: "Overdue",   icon: AlertCircle,  num: "text-red-400",     bg: "bg-red-950/40",     border: "border-red-900/60",     iconBg: "bg-red-900/60 text-red-300" },
  { key: "today",     label: "Today",     icon: Calendar,     num: "text-indigo-400",  bg: "bg-indigo-950/40",  border: "border-indigo-900/60",  iconBg: "bg-indigo-900/60 text-indigo-300" },
  { key: "upcoming",  label: "Upcoming",  icon: Clock,        num: "text-amber-400",   bg: "bg-amber-950/40",   border: "border-amber-900/60",   iconBg: "bg-amber-900/60 text-amber-300" },
  { key: "completed", label: "Completed", icon: CheckCircle2, num: "text-emerald-400", bg: "bg-emerald-950/40", border: "border-emerald-900/60", iconBg: "bg-emerald-900/60 text-emerald-300" },
];

/* ── Section heading with count badge & line divider ──────────────────── */
const SectionHead = ({ label, count, accent, badgeBg }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className={`text-xs font-bold uppercase tracking-wider ${accent}`}>{label}</h2>
    <div className="flex-1 h-px bg-slate-800" />
    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full tabular-nums border ${badgeBg}`}>
      {count}
    </span>
  </div>
);

const Dashboard = () => {
  const { data: health } = useHealth();
  const { user }         = useAuth();
  const { reminders, loading, error, addReminder, editReminder, removeReminder, markComplete, markCancelled } = useReminders();
  const navigate = useNavigate();

  const [showForm, setShowForm]           = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]                 = useState(null);

  const notify = (msg, type = "success") => setToast({ message: msg, type });

  const todayDate = today();
  const active    = reminders.filter(r => r.status === "Active");
  const todayList = active.filter(r => startOfDay(new Date(r.reminderDate)).getTime() === todayDate.getTime());
  const overdue   = active.filter(r => startOfDay(new Date(r.reminderDate)) < todayDate);
  const upcoming  = active.filter(r => startOfDay(new Date(r.reminderDate)) > todayDate);
  const completed = reminders.filter(r => r.status === "Completed");
  const counts    = { overdue: overdue.length, today: todayList.length, upcoming: upcoming.length, completed: completed.length };

  const handleSave = async (body) => {
    if (editTarget) { await editReminder(editTarget._id, body); notify("Reminder updated"); }
    else            { await addReminder(body); notify("Reminder saved"); }
    setEditTarget(null);
  };

  const wrap = async (fn, msg) => {
    setActionLoading(true);
    try { await fn(); notify(msg); }
    catch (e) { notify(e.message, "error"); }
    finally { setActionLoading(false); }
  };

  const cardProps = r => ({
    reminder: r,
    onEdit:     (r) => { setEditTarget(r); setShowForm(true); },
    onDelete:   id  => wrap(() => removeReminder(id), "Reminder deleted"),
    onComplete: id  => wrap(() => markComplete(id),   "Marked as completed"),
    onCancel:   id  => wrap(() => markCancelled(id),  "Reminder cancelled"),
    actionLoading,
  });

  const Section = ({ label, items, emptyText, accent, badgeBg }) => (
    <div className="animate-fade-up">
      <SectionHead label={label} count={items.length} accent={accent} badgeBg={badgeBg} />
      {items.length === 0
        ? <p className="text-xs text-slate-500 italic pl-1 pb-2">{emptyText}</p>
        : <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
            {items.map(r => <ReminderCard key={r._id} {...cardProps(r)} />)}
          </div>
      }
    </div>
  );

  const firstName = user?.name?.split(" ")[0] || "there";

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

      {/* ── Hero / Greeting ───────────────────────────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">

          {/* Top row: Greeting + Action buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{fmtDay()}</span>
                {health && <StatusBadge status={health.database} />}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Good {getGreeting()}, {firstName} 👋
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {active.length === 0
                  ? "No active reminders — you're all caught up!"
                  : `You have ${active.length} active reminder${active.length !== 1 ? "s" : ""}.`}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
              <button onClick={() => navigate("/ai")} className="btn-secondary flex-1 sm:flex-none">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Reminder</span>
              </button>
              <button onClick={() => { setEditTarget(null); setShowForm(true); }} className="btn-primary flex-1 sm:flex-none">
                <Plus className="w-4 h-4" />
                <span>Add Reminder</span>
              </button>
            </div>
          </div>

          {/* Stat cards grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {STATS.map(({ key, label, icon: Icon, num, bg, border, iconBg }) => (
              <div key={key} className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-200 hover:border-slate-700`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-700/50 ${iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-2xl sm:text-3xl font-black leading-none tracking-tight ${num}`}>{counts[key]}</p>
                  <p className="text-xs text-slate-300 font-semibold mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-10">

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton" />)}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="card border-red-900/60 bg-red-950/50 p-4 text-red-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <span>Failed to load reminders: {error}</span>
          </div>
        )}

        {/* Reminders Lists */}
        {!loading && !error && (
          <>
            {overdue.length > 0 && (
              <Section 
                label="Overdue" 
                items={overdue} 
                emptyText="" 
                accent="text-red-400" 
                badgeBg="bg-red-950/80 text-red-300 border-red-800" 
              />
            )}
            
            <Section 
              label="Today" 
              items={todayList} 
              emptyText="Nothing due today — enjoy your day!" 
              accent="text-indigo-400" 
              badgeBg="bg-indigo-950/80 text-indigo-300 border-indigo-800" 
            />
            
            <Section 
              label="Upcoming" 
              items={upcoming} 
              emptyText="No upcoming reminders scheduled." 
              accent="text-amber-400" 
              badgeBg="bg-amber-950/80 text-amber-300 border-amber-800" 
            />
            
            {completed.length > 0 && (
              <Section 
                label="Completed" 
                items={completed} 
                emptyText="" 
                accent="text-emerald-400" 
                badgeBg="bg-emerald-950/80 text-emerald-300 border-emerald-800" 
              />
            )}

            {/* Empty state when no reminders exist at all */}
            {reminders.length === 0 && (
              <div className="card p-12 flex flex-col items-center justify-center text-center animate-fade-up max-w-lg mx-auto my-8 border-dashed border-slate-800 bg-slate-900">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-900/60">
                  <Inbox className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-white">No reminders yet</h2>
                <p className="text-sm text-slate-400 mt-1 mb-6 max-w-xs leading-relaxed">
                  Add your first reminder manually, create one using AI, or upload a document.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => navigate("/ai")} className="btn-secondary">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    Try AI
                  </button>
                  <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Add Reminder
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
