import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Sparkles, AlertCircle, X } from "lucide-react";
import VoiceButton from "./VoiceButton";

const EXAMPLES = [
  "Remind me about AC service on December 10",
  "My bike insurance expires on March 20 2027, remind 7 days before",
  "Pay electricity bill next Monday",
  "எங்க வீட்டோட AC service December 10-ம் தேதி. ஞாபகப்படுத்து.",
];

const AIInput = ({ onResult, loading, setLoading }) => {
  const [text, setText]         = useState("");
  const [error, setError]       = useState(null);
  const [lang, setLang]         = useState("en-US");
  const [heardText, setHeardText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleTranscript = useCallback((transcript) => {
    setHeardText(transcript);
    setText(transcript);
    setError(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) { setError("Please type or speak a reminder first."); return; }
    if (trimmed.length > 500) { setError("Message is too long (max 500 characters)."); return; }
    setError(null);
    setHeardText("");
    setLoading(true);
    try { await onResult(trimmed); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const useExample = (ex) => {
    setText(ex); setHeardText(""); setError(null);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Voice */}
      <div className="pb-5 border-b border-slate-800">
        <p className="section-title mb-3">Voice Input</p>
        <VoiceButton onTranscript={handleTranscript} lang={lang} onLangChange={setLang} disabled={loading} />
      </div>

      {heardText && (
        <div className="flex items-start gap-3 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl px-4 py-3">
          <Mic className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-0.5">I heard:</p>
            <p className="text-xs text-emerald-200 italic break-words">"{heardText}"</p>
          </div>
          <button 
            type="button" 
            onClick={() => setHeardText("")} 
            className="text-emerald-400 hover:text-emerald-200 p-1 rounded-lg shrink-0 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Text */}
      <div>
        <p className="section-title mb-3">Or Type Description</p>

        <div className="flex flex-wrap gap-2 mb-3">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => useExample(ex)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-xl border border-indigo-800/80 text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 font-medium transition-colors text-left disabled:opacity-50"
            >
              {ex.length > 42 ? ex.slice(0, 42) + "…" : ex}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => { setText(e.target.value); setError(null); setHeardText(""); }}
              placeholder={"Type your reminder in plain English, Tamil, or Hindi…\ne.g. \"Remind me about AC service on December 10\""}
              rows={3}
              maxLength={500}
              disabled={loading}
              className={`input resize-none ${error ? "input-error" : ""} disabled:bg-slate-950 disabled:text-slate-500`}
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] font-semibold text-slate-500 select-none">
              {text.length}/500
            </span>
          </div>

          {error && (
            <p className="text-xs font-semibold text-red-300 bg-red-950/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2 border border-red-800/80">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="btn-primary w-full py-3"
          >
            {loading ? (
              <><span className="spinner" /> Analysing with Groq AI…</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Parse with AI
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIInput;
