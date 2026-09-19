import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  AlertCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Calendar, 
  Sparkles, 
  FileText, 
  ShieldCheck 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || "/";

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) { setError("Email and password are required."); return; }
    setLoading(true);
    try { await login(form.email.trim(), form.password); navigate(from, { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Left panel - Branding */}
      <div 
        className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 p-12 text-white relative overflow-hidden border-r border-slate-800/80"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-indigo-400/20 blur-2xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-xl shadow-inner">
            L
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight leading-none text-white">LifeKeeper</p>
            <p className="text-[11px] text-indigo-300 leading-none mt-1">You live. We remember.</p>
          </div>
        </div>

        <div className="relative my-auto py-12">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight mb-4 text-white">
            Your intelligent<br />reminder vault.
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
            Never miss a warranty expiration, renewal date, or personal milestone again.
          </p>

          <div className="flex flex-col gap-3.5 mt-8">
            {[
              { icon: Calendar, t: "Smart scheduled alerts" },
              { icon: Sparkles, t: "AI natural language parsing" },
              { icon: FileText, t: "Instant document OCR parsing" },
              { icon: ShieldCheck, t: "Secure & private data isolation" }
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="flex items-center gap-3 text-xs font-semibold text-indigo-100">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Icon className="w-3.5 h-3.5 text-indigo-300" />
                </div>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px] text-indigo-300">
          © {new Date().getFullYear()} LifeKeeper. All rights reserved.
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-950">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your LifeKeeper account.</p>
          </div>

          <div className="card p-8 shadow-xl border-slate-800 bg-slate-900">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
              {error && (
                <div className="text-xs font-semibold text-red-300 bg-red-950/80 border border-red-800 rounded-xl p-3.5 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="email" 
                    autoComplete="email" 
                    value={form.email}
                    onChange={e => set("email", e.target.value)} 
                    placeholder="you@example.com" 
                    className="input pl-10" 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type={showPw ? "text" : "password"} 
                    autoComplete="current-password"
                    value={form.password} 
                    onChange={e => set("password", e.target.value)}
                    placeholder="••••••••" 
                    className="input pl-10 pr-10" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 text-sm font-bold">
                {loading && <span className="spinner" />}
                {loading ? "Signing in…" : "Sign in to Dashboard"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 font-medium mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
