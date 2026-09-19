import { useEffect, useState } from "react";
import { Check, AlertCircle, Info, X } from "lucide-react";

const CONF = {
  success: { bg: "bg-slate-900 text-white border-slate-800", icon: Check, iconBg: "bg-emerald-500/20 text-emerald-400" },
  error:   { bg: "bg-red-900 text-white border-red-800",       icon: AlertCircle, iconBg: "bg-red-500/20 text-red-400" },
  info:    { bg: "bg-indigo-900 text-white border-indigo-800", icon: Info, iconBg: "bg-indigo-500/20 text-indigo-400" },
};

const Toast = ({ message, type = "success", onClose }) => {
  const [visible, setVisible] = useState(false);
  const { bg, icon: Icon, iconBg } = CONF[type] ?? CONF.info;

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 3200);
    return () => { cancelAnimationFrame(show); clearTimeout(hide); };
  }, [onClose]);

  return (
    <div 
      role="alert" 
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4.5 py-3.5 rounded-2xl text-xs font-semibold shadow-xl border backdrop-blur-md transition-all duration-300 ${bg} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <span className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <span className="flex-1 text-slate-100 font-medium">{message}</span>
      <button 
        onClick={onClose} 
        aria-label="Dismiss notification" 
        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Toast;
