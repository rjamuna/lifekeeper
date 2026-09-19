import { useState, useRef, useEffect } from "react";
import { 
  Bell, 
  BellOff, 
  Settings, 
  X, 
  Check, 
  AlertCircle, 
  Send 
} from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

const formatRelative = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata",
  });
};

const PRIORITY_DOT = { High: "bg-red-500", Medium: "bg-amber-400", Low: "bg-emerald-500" };

const NotificationCenter = () => {
  const {
    permission, isSupported, inAppNotifications, lastChecked,
    requestPermission, sendTestNotification, dismissNotification, dismissAll,
  } = useNotifications();

  const [open, setOpen]               = useState(false);
  const [activeTab, setActiveTab]     = useState("notifications");
  const [testStatus, setTestStatus]   = useState(null);
  const [permLoading, setPermLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleEnable = async () => { setPermLoading(true); await requestPermission(); setPermLoading(false); };

  const handleTest = () => {
    const r = sendTestNotification();
    setTestStatus(r);
    setTimeout(() => setTestStatus(null), 3000);
  };

  const unread = inAppNotifications.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative ${
          open ? "bg-indigo-50 text-indigo-600" : ""
        }`}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5 shadow-xs">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-84 card shadow-xl z-50 overflow-hidden border-slate-200/80 animate-scale-in">
          {/* Tabs */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-colors flex items-center gap-1.5 ${
                  activeTab === "notifications" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notifications{unread > 0 ? ` (${unread})` : ""}</span>
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition-colors flex items-center gap-1.5 ${
                  activeTab === "settings" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>
            {unread > 0 && activeTab === "notifications" && (
              <button onClick={dismissAll} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
                Clear all
              </button>
            )}
          </div>

          {/* Notifications tab */}
          {activeTab === "notifications" && (
            <div className="max-h-80 overflow-y-auto">
              {inAppNotifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <BellOff className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No new notifications</p>
                  {lastChecked && (
                    <p className="text-[10px] text-slate-400 mt-1">Checked {formatRelative(lastChecked)}</p>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {inAppNotifications.map((n) => (
                    <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/80 transition-colors">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[n.priority] ?? "bg-indigo-500"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-snug">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1">{formatDate(n.reminderDate)} · {formatRelative(n.receivedAt)}</p>
                      </div>
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="text-slate-300 hover:text-slate-500 p-1 rounded-lg transition-colors shrink-0"
                        aria-label="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Settings tab */}
          {activeTab === "settings" && (
            <div className="px-4 py-4 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Browser Push Notifications</p>
                {!isSupported ? (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2">
                    Not supported in this browser. In-app notifications are active.
                  </p>
                ) : permission === "granted" ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2">
                    <Check className="w-4 h-4 text-emerald-600" /> Push Notifications Enabled
                  </div>
                ) : permission === "denied" ? (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200/80 rounded-xl px-3 py-2">
                    <p className="font-bold mb-0.5">Permission denied</p>
                    <p className="text-[11px] text-red-500">Enable notification permissions in browser settings.</p>
                  </div>
                ) : (
                  <button onClick={handleEnable} disabled={permLoading} className="btn-primary w-full text-xs py-2">
                    {permLoading && <span className="spinner" />}
                    {permLoading ? "Requesting…" : "Enable Push Notifications"}
                  </button>
                )}
              </div>

              {isSupported && permission === "granted" && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Test Notification</p>
                  <button onClick={handleTest} className="btn-secondary w-full text-xs py-2">
                    <Send className="w-3.5 h-3.5 text-indigo-500" />
                    Send Test Alert
                  </button>
                  {testStatus && (
                    <p className={`text-[11px] font-semibold mt-1.5 text-center ${testStatus === "sent" ? "text-emerald-600" : "text-red-500"}`}>
                      {testStatus === "sent" && "Test notification delivered!"}
                      {testStatus === "not-granted" && "Permission not granted."}
                      {testStatus === "unsupported" && "Not supported."}
                      {testStatus === "error" && "Failed to send test notification."}
                    </p>
                  )}
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                LifeKeeper monitors active reminders in real time.
                {lastChecked && ` Checked ${formatRelative(lastChecked)}.`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
