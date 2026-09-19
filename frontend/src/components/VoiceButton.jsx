import { useCallback } from "react";
import { Mic, Square, Loader2, AlertTriangle, X } from "lucide-react";
import useSpeechRecognition, { isSpeechSupported } from "../hooks/useSpeechRecognition";

export const LANGUAGES = [
  { code: "en-US", label: "English",  short: "EN" },
  { code: "ta-IN", label: "தமிழ்",    short: "TA" },
  { code: "hi-IN", label: "हिन्दी",   short: "HI" },
];

const VoiceButton = ({ onTranscript, lang, onLangChange, disabled }) => {
  const handleTranscript = useCallback(
    (text) => { onTranscript(text); },
    [onTranscript]
  );

  const {
    state, isListening, isProcessing,
    interimText, error, start, stop, clearError, STATES,
  } = useSpeechRecognition({ lang, onTranscript: handleTranscript });

  if (!isSpeechSupported()) {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200/80 rounded-2xl px-4 py-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Voice input unavailable</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Your browser does not support Web Speech API. Try Chrome or Edge, or type your message below.
          </p>
        </div>
      </div>
    );
  }

  if (state === STATES.ERROR && error) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3 bg-red-50 border border-red-200/80 rounded-2xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Microphone Error</p>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 p-1 rounded-lg"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center">You can still type your reminder below.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Language selector + mic button row */}
      <div className="flex items-center gap-3">
        {/* Language pills */}
        <div className="flex gap-1.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onLangChange(l.code)}
              disabled={isListening || isProcessing}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all disabled:opacity-50 ${
                lang === l.code
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 bg-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Mic button */}
        <button
          type="button"
          onClick={isListening ? stop : start}
          disabled={disabled || isProcessing}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
          className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${
            isListening
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/20 shadow-md text-white"
              : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/20 shadow-md text-white"
          }`}
        >
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-2xl bg-red-400 animate-ping opacity-40" />
              <span className="absolute inset-[-4px] rounded-2xl border-2 border-red-400/60 animate-pulse" />
            </>
          )}
          {isListening ? (
            <Square className="w-4 h-4 fill-current relative z-10" />
          ) : isProcessing ? (
            <Loader2 className="w-5 h-5 animate-spin relative z-10" />
          ) : (
            <Mic className="w-5 h-5 relative z-10" />
          )}
        </button>

        {/* Status label */}
        <div className="flex flex-col">
          {isListening && (
            <span className="text-xs font-bold text-red-600 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Listening…
            </span>
          )}
          {isProcessing && (
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              Parsing voice…
            </span>
          )}
          {state === STATES.IDLE && !isListening && !isProcessing && (
            <span className="text-xs font-medium text-slate-400">Tap mic to speak</span>
          )}
        </div>
      </div>

      {/* Live interim transcript */}
      {(isListening || isProcessing) && (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 min-h-[48px]">
          {interimText ? (
            <p className="text-xs text-slate-700 font-medium italic">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-0.5">Hearing:</span>
              "{interimText}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              {isListening ? "Speak clearly now…" : "Finalising transcript…"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceButton;
