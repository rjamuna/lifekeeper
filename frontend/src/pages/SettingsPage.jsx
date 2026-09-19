import { useState } from "react";
import { 
  Save, 
  Mail, 
  LogOut, 
  User 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ta", label: "தமிழ்" },
  { value: "hi", label: "हिन्दी" },
];
const TIMEZONES = ["Asia/Kolkata", "UTC", "America/New_York", "Europe/London", "Asia/Singapore"];

const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();

  const [form, setForm] = useState({
    name:              user?.name              || "",
    preferredLanguage: user?.preferredLanguage || "en",
    timezone:          user?.timezone          || "Asia/Kolkata",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast]   = useState(null);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try { await updateProfile(form); setToast({ message: "Settings saved successfully.", type: "success" }); }
    catch (err) { setToast({ message: err.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="min-h-screen pb-16">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">
        {/* Header */}
        <div className="mb-7">
          <h1 className="page-title">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your profile, language, and notification preferences.</p>
        </div>

        {/* User Profile Summary Card */}
        <div className="card p-6 mb-6 flex items-center gap-4.5 shadow-xl border-slate-800 bg-slate-900">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-xl font-extrabold flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 border border-indigo-500/30">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-white text-lg tracking-tight truncate">{user?.name}</h2>
            <p className="text-xs font-medium text-slate-400 truncate mt-0.5">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Profile Section */}
          <div className="card p-6 shadow-xl border-slate-800 bg-slate-900">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Profile Settings
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Full Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => set("name", e.target.value)} 
                  className="input" 
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ""} 
                  disabled
                  className="input bg-slate-950 text-slate-500 cursor-not-allowed border-slate-800" 
                />
                <p className="text-[11px] font-medium text-slate-500 mt-1">Account email address cannot be modified.</p>
              </div>

              <div>
                <label className="label">Preferred Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((l) => (
                    <button 
                      key={l.value} 
                      type="button" 
                      onClick={() => set("preferredLanguage", l.value)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all duration-150 ${
                        form.preferredLanguage === l.value
                          ? "border-indigo-500 bg-indigo-950/80 text-indigo-300 shadow-xs"
                          : "border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800 bg-slate-950/40"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Timezone</label>
                <div className="relative">
                  <select 
                    value={form.timezone} 
                    onChange={(e) => set("timezone", e.target.value)} 
                    className="input appearance-none pr-8"
                  >
                    {TIMEZONES.map((tz) => <option key={tz} className="bg-slate-900 text-slate-100">{tz}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="card p-6 shadow-xl border-slate-800 bg-slate-900">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-900/80">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Email Alerts</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">{user?.email}</p>
                </div>
              </div>
              <span className="badge text-emerald-300 bg-emerald-950/80 border-emerald-800/80 font-bold">Always On</span>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? (
              <><span className="spinner" /> Saving preferences…</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </form>

        {/* Danger zone / Sign out */}
        <div className="card p-6 mt-6 border-slate-800 bg-slate-900 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Account Security</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">Sign out of LifeKeeper</p>
              <p className="text-xs font-medium text-slate-400 mt-0.5">End your current session on this device.</p>
            </div>
            <button type="button" onClick={logout} className="btn-danger shrink-0">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
