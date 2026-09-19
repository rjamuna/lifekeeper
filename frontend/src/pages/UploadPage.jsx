import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UploadCloud, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Edit3 
} from "lucide-react";
import { extractFromDocument, createReminder } from "../services/api";
import DocumentUpload from "../components/DocumentUpload";
import DocumentExtractCard from "../components/DocumentExtractCard";
import ReminderForm from "../components/ReminderForm";
import Toast from "../components/Toast";

const STEPS = { UPLOAD: "upload", RESULT: "result", MANUAL: "manual", DONE: "done" };

const UploadPage = () => {
  const navigate = useNavigate();
  const [step, setStep]               = useState(STEPS.UPLOAD);
  const [uploading, setUploading]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [result, setResult]           = useState(null);
  const [filename, setFilename]       = useState("");
  const [uploadError, setUploadError] = useState(null);
  const [toast, setToast]             = useState(null);

  const notify = (message, type = "success") => setToast({ message, type });

  const handleUpload = async (file) => {
    setUploading(true); setUploadError(null); setFilename(file.name);
    try { const data = await extractFromDocument(file); setResult(data); setStep(STEPS.RESULT); }
    catch (err) { setUploadError(err.message); }
    finally { setUploading(false); }
  };

  const handleConfirm = async (reminderData) => {
    setSaving(true);
    try { await createReminder({ ...reminderData, source: "Document" }); setStep(STEPS.DONE); notify("Reminder saved!"); }
    catch (err) { notify(err.message, "error"); }
    finally { setSaving(false); }
  };

  const reset = () => { setStep(STEPS.UPLOAD); setResult(null); setFilename(""); setUploadError(null); };

  return (
    <div className="min-h-screen pb-16">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h1 className="page-title">Upload Document</h1>
          </div>
          <p className="text-sm text-slate-400 ml-13">
            Upload a warranty card, invoice, policy or receipt — OCR & AI will extract dates automatically.
          </p>
        </div>

        {/* Step: Upload */}
        {step === STEPS.UPLOAD && (
          <div className="flex flex-col gap-4 animate-scale-in">
            <div className="card p-6 sm:p-7 shadow-xl bg-slate-900 border-slate-800">
              <DocumentUpload onUpload={handleUpload} uploading={uploading} />
            </div>
            {uploadError && (
              <div className="card border-red-900/60 bg-red-950/40 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-900/60 text-red-300 flex items-center justify-center shrink-0 border border-red-800/60">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-red-300 text-sm mb-1">
                      {uploadError.includes("read enough text") ? "Couldn't read enough text." : "Could not process document"}
                    </p>
                    <p className="text-xs text-red-200 leading-relaxed">{uploadError}</p>
                  </div>
                </div>
                <div className="flex gap-2.5 mt-4">
                  <button onClick={reset} className="btn-secondary text-xs">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Try another file
                  </button>
                  <button onClick={() => setStep(STEPS.MANUAL)} className="btn-primary text-xs">
                    <Edit3 className="w-3.5 h-3.5" />
                    Enter manually
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Result */}
        {step === STEPS.RESULT && result && (
          <div className="flex flex-col gap-4 animate-scale-in">
            {result.canExtract === false ? (
              <div className="card border-amber-900/60 bg-amber-950/40 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-900/60 text-amber-300 flex items-center justify-center shrink-0 border border-amber-800/60">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-300 text-sm">{result.documentType || "Document uploaded"}</p>
                    <p className="text-xs text-amber-200 mt-1 leading-relaxed">{result.extractionNotes}</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <button onClick={reset} className="btn-secondary text-xs">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Try another file
                  </button>
                  <button onClick={() => setStep(STEPS.MANUAL)} className="btn-primary text-xs">
                    <Edit3 className="w-3.5 h-3.5" />
                    Enter manually
                  </button>
                </div>
              </div>
            ) : (
              <DocumentExtractCard 
                result={result} 
                filename={filename}
                onConfirm={handleConfirm} 
                onManual={() => setStep(STEPS.MANUAL)} 
                saving={saving} 
              />
            )}
            <button onClick={reset} className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-2">
              <RotateCcw className="w-3.5 h-3.5" />
              Upload a different file
            </button>
          </div>
        )}

        {/* Step: Manual */}
        {step === STEPS.MANUAL && (
          <div className="card overflow-hidden animate-scale-in shadow-xl bg-slate-900 border-slate-800">
            <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              <p className="text-xs font-bold text-slate-200">Enter reminder details manually</p>
              {filename && <span className="text-[10px] font-semibold text-slate-400 ml-auto truncate max-w-xs">{filename}</span>}
            </div>
            <div className="p-5">
              <ReminderForm
                onSave={async (data) => { await handleConfirm({ ...data, source: "Document" }); }}
                onClose={() => setStep(result ? STEPS.RESULT : STEPS.UPLOAD)}
              />
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === STEPS.DONE && (
          <div className="card p-10 text-center animate-scale-in border-emerald-900/60 bg-slate-900 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-800/80">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Reminder saved!</h2>
            <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto">
              Extracted from <span className="font-bold text-slate-200">{filename}</span> and stored.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={reset} className="btn-secondary">
                <RotateCcw className="w-4 h-4" />
                Upload another
              </button>
              <button onClick={() => navigate("/")} className="btn-primary">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {[STEPS.UPLOAD, STEPS.RESULT, STEPS.DONE].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
              step === s ? "w-8 bg-indigo-500"
              : step === STEPS.DONE ? "w-4 bg-indigo-800"
              : step === STEPS.RESULT && s === STEPS.UPLOAD ? "w-4 bg-indigo-800"
              : "w-4 bg-slate-800"
            }`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
