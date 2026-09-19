import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  AlertCircle, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  BellRing, 
  Sparkles 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Field = ({ label, type = "text", placeholder, autoComplete, value, onChange, error, icon: Icon, suffix }) => (
  <div>
    <label className="label">{label}</label>
    <div className="relative">
      {Icon && <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />}
      <input 
        type={type} 
        autoComplete={autoComplete} 
        value={value} 
        onChange={onChange}
        placeholder={placeholder} 
        className={`input ${Icon ? "pl-10" : ""} ${error ? "input-error" : ""} ${suffix ? "pr-10" : ""}`} 
      />
      {suffix}
    </div>
    {error && <p className="text-xs font-medium text-red-400 mt-1">{error}</p>}
  </div>
);

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(e => ({ ...e, [f]: undefined, submit: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                        e.name     = "Full name is required.";
    if (!form.email.trim())                       e.email    = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email    = "Enter a valid email address.";
    if (!form.password)                           e.password = "Password is required.";
    else if (form.password.length < 6)            e.password = "Minimum 6 characters required.";
    if (!form.confirm)                            e.confirm  = "Please confirm your password.";
    else if (form.password !== form.confirm)      e.confirm  = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try { await register(form.name.trim(), form.email.trim(), form.password); navigate("/", { replace: true }); }
    catch (err) { setErrors({ submit: err.message }); }
    finally { setLoading(false); }
  };

  const ShowHide = (
    <button 
      type="button" 
      onClick={() => setShowPw(v => !v)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
    >
      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Left panel */}
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
            Start keeping<br />track today.
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
            Create your account to get automated notifications, document extraction, and AI reminder management.
          </p>

          <div className="flex flex-col gap-3.5 mt-8">
            {[
              { icon: ShieldCheck, t: "Private & isolated user workspace" },
              { icon: BellRing, t: "Email & browser alert engine" },
              { icon: Sparkles, t: "Powered by AI & Groq LLM" }
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-950">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-400 mt-1">Free forever. Get started in seconds.</p>
          </div>

          <div className="card p-8 shadow-xl border-slate-800 bg-slate-900">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errors.submit && (
                <div className="text-xs font-semibold text-red-300 bg-red-950/80 border border-red-800 rounded-xl p-3.5 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errors.submit}</span>
                </div>
              )}

              <Field 
                label="Full Name" 
                placeholder="Jamuna" 
                autoComplete="name"
                icon={User}
                value={form.name} 
                onChange={e => set("name", e.target.value)} 
                error={errors.name} 
              />

              <Field 
                label="Email Address" 
                placeholder="you@example.com" 
                autoComplete="email"
                icon={Mail}
                value={form.email} 
                onChange={e => set("email", e.target.value)} 
                error={errors.email} 
              />

              <Field 
                label="Password" 
                type={showPw ? "text" : "password"} 
                placeholder="Min. 6 characters"
                autoComplete="new-password" 
                icon={Lock}
                value={form.password} 
                onChange={e => set("password", e.target.value)}
                error={errors.password} 
                suffix={ShowHide} 
              />

              <Field 
                label="Confirm Password" 
                type={showPw ? "text" : "password"} 
                placeholder="Repeat password"
                autoComplete="new-password" 
                icon={Lock}
                value={form.confirm} 
                onChange={e => set("confirm", e.target.value)}
                error={errors.confirm} 
              />

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 text-sm font-bold">
                {loading && <span className="spinner" />}
                {loading ? "Creating account…" : "Create LifeKeeper Account"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 font-medium mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
