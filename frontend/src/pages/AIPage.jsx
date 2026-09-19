import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, HelpCircle, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { parseReminderWithAI, createReminder } from "../services/api";
import AIInput from "../components/AIInput";
import AIConfirmCard from "../components/AIConfirmCard";
import Toast from "../components/Toast";

const STEPS = { INPUT: "input", CLARIFY: "clarify", CONFIRM: "confirm", DONE: "done" };

const StepDots = ({ step }) => {
  const steps = [STEPS.INPUT, STEPS.CONFIRM, STEPS.DONE];
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {steps.map((s, i) => {
        const active = step === s || (step === STEPS.CLARIFY && i === 0);
        const past   = steps.indexOf(step) > i && step !== STEPS.CLARIFY;
        return (
          <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
            active ? "w-8 bg-indigo-500" : past ? "w-4 bg-indigo-800" : "w-4 bg-slate-800"
          }`} />
        );
      })}
    </div>
  );
};

const AIPage = () => {
  const navigate = useNavigate();
  const [step, setStep]                   = useState(STEPS.INPUT);
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [parsed, setParsed]               = useState(null);
  const [clarification, setClarification] = useState("");
  const [toast, setToast]                 = useState(null);
  const [lastMessage, setLastMessage]     = useState("");

  const notify = (message, type = "success") => setToast({ message, type });

  const handleParse = async (message) => {
    setLastMessage(message);
    const res = await parseReminderWithAI(message);
    if (res.needsClarification) { setClarification(res.clarificationMessage); setStep(STEPS.CLARIFY); return; }
    setParsed(res.data);
    setStep(STEPS.CONFIRM);
  };

  const handleConfirm = async (data) => {
    setSaving(true);
    try { await createReminder({ ...data, source: "AI" }); setStep(STEPS.DONE); notify("Reminder saved!"); }
    catch (err) { notify(err.message, "error"); }
    finally { setSaving(false); }
  };

  const reset = () => { setStep(STEPS.INPUT); setParsed(null); setClarification(""); setLastMessage(""); };

  return (
    <div className="min-h-screen pb-16">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="page-title">AI Reminder Assistant</h1>
          </div>
          <p className="text-sm text-slate-400 ml-13">
            Describe your reminder in plain English, Tamil, or Hindi — Groq AI will parse dates and details.
          </p>
        </div>

        {/* Step: Input */}
        {step === STEPS.INPUT && (
          <div className="card p-6 sm:p-7 animate-scale-in shadow-xl bg-slate-900 border-slate-800">
            <AIInput onResult={handleParse} loading={loading} setLoading={setLoading} />
          </div>
        )}

        {/* Step: Clarify */}
        {step === STEPS.CLARIFY && (
          <div className="flex flex-col gap-4 animate-scale-in">
            <div className="card border-amber-900/60 bg-amber-950/40 p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-900/60 text-amber-300 flex items-center justify-center shrink-0 border border-amber-800/60">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-amber-300 text-sm mb-1">More information needed</p>
                  <p className="text-xs text-amber-200 leading-relaxed">{clarification}</p>
                  {lastMessage && (
                    <p className="text-[11px] text-amber-400 mt-2 font-medium">You said: <span className="italic">"{lastMessage}"</span></p>
                  )}
                </div>
              </div>
            </div>
            <div className="card p-6 bg-slate-900 border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Try again with more details:</p>
              <AIInput onResult={handleParse} loading={loading} setLoading={setLoading} />
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === STEPS.CONFIRM && parsed && (
          <div className="animate-scale-in">
            <AIConfirmCard parsed={parsed} onConfirm={handleConfirm} onRetry={reset} saving={saving} />
          </div>
        )}

        {/* Step: Done */}
        {step === STEPS.DONE && (
          <div className="card p-10 text-center animate-scale-in border-emerald-900/60 bg-slate-900 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-800/80">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Reminder successfully created!</h2>
            <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
              Your AI reminder is active and stored in MongoDB.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-secondary">
                <Plus className="w-4 h-4" />
                Add another
              </button>
              <button onClick={() => navigate("/")} className="btn-primary">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <StepDots step={step} />
      </div>
    </div>
  );
};

export default AIPage;
