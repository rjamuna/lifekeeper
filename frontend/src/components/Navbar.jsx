import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CheckSquare, 
  UploadCloud, 
  Sparkles, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";

const LINKS = [
  { to: "/",          label: "Dashboard",   icon: LayoutDashboard },
  { to: "/reminders", label: "Reminders",   icon: CheckSquare     },
  { to: "/upload",    label: "Upload",      icon: UploadCloud     },
  { to: "/ai",        label: "AI Reminder", icon: Sparkles        },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 transition-all duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group focus:outline-none focus:ring-2 focus:ring-indigo-500/30 rounded-xl p-1 -ml-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="text-white text-base font-extrabold tracking-wider select-none">L</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-extrabold text-white tracking-tight leading-none block">LifeKeeper</span>
            <span className="text-[10px] font-semibold text-slate-400 leading-none tracking-wide mt-0.5 block">You live. We remember.</span>
          </div>
        </Link>

        {isAuthenticated && (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800" aria-label="Main navigation">
              {LINKS.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-150 ${
                      active
                        ? "bg-slate-800 text-indigo-400 shadow-sm border border-slate-700/80"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"}`} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions / Right Side */}
            <div className="flex items-center gap-2">
              <NotificationCenter />

              <Link
                to="/settings"
                aria-label="Settings"
                title="Settings"
                className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
                  pathname === "/settings" ? "bg-indigo-950/80 text-indigo-400 border border-indigo-900/60" : ""
                }`}
              >
                <Settings className="w-5 h-5" />
              </Link>

              <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <Link
                  to="/settings"
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white text-xs font-bold flex items-center justify-center select-none shadow-sm hover:opacity-90 transition-opacity border border-indigo-500/30"
                  title={user?.name || "Profile"}
                >
                  {initials}
                </Link>
                <button
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign out"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/50 px-3 py-2 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile navigation bar */}
      {isAuthenticated && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-3 py-2 flex items-center justify-around gap-1">
          {LINKS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-colors ${
                  active ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
