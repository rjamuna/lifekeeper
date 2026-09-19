import { useState, useRef, useCallback } from "react";
import { UploadCloud, FileText, Check, X, AlertCircle, Info } from "lucide-react";

const ACCEPTED = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MAX_MB = 15;

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentUpload = ({ onUpload, uploading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [error, setError]       = useState(null);
  const inputRef = useRef(null);

  const validate = (f) => {
    if (!Object.keys(ACCEPTED).includes(f.type.toLowerCase()))
      return `Unsupported file type (${f.type}). Please upload a PDF or image.`;
    if (f.size > MAX_MB * 1024 * 1024)
      return `File is too large (${formatSize(f.size)}). Maximum is ${MAX_MB} MB.`;
    return null;
  };

  const pick = useCallback((f) => {
    const err = validate(f);
    if (err) { setError(err); setFile(null); setPreview(null); return; }
    setError(null);
    setFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); const d = e.dataTransfer.files[0]; if (d) pick(d); };
  const onInputChange = (e) => { const c = e.target.files[0]; if (c) pick(c); e.target.value = ""; };
  const clear = () => { setFile(null); setPreview(null); setError(null); if (preview) URL.revokeObjectURL(preview); };

  return (
    <div className="flex flex-col gap-5">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragOver
            ? "border-indigo-500 bg-indigo-950/40 scale-[1.01]"
            : file
            ? "border-emerald-700 bg-emerald-950/30 cursor-default"
            : "border-slate-700 bg-slate-950/60 hover:border-indigo-500 hover:bg-indigo-950/20"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={Object.values(ACCEPTED).join(",")}
          onChange={onInputChange}
          className="hidden"
        />

        {!file ? (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-indigo-900 text-indigo-300" : "bg-slate-800 border border-slate-700 text-slate-400"}`}>
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Drop your document here</p>
              <p className="text-xs text-slate-400 mt-0.5">or click to browse from device</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {["PDF", "JPG", "PNG", "WEBP"].map((t) => (
                <span key={t} className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-300">{t}</span>
              ))}
            </div>
            <p className="text-[10px] font-semibold text-slate-500">Max size {MAX_MB} MB</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {preview ? (
              <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded-xl border border-slate-700 shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                <FileText className="w-7 h-7" />
              </div>
            )}
            <div className="text-left flex-1 min-w-0">
              <p className="font-bold text-white truncate text-xs">{file.name}</p>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{formatSize(file.size)}</p>
              <p className="text-[11px] font-bold text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Ready to extract
              </p>
            </div>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors shrink-0" 
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-300 bg-red-950/80 border border-red-800 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          {error}
        </p>
      )}

      {/* Hint */}
      <div className="bg-amber-950/40 border border-amber-900/60 rounded-2xl p-4">
        <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          Supported Documents
        </p>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          Warranty cards · Invoices & Bills · Insurance policies · Vehicle RC · Service records · Subscriptions
        </p>
      </div>

      <button
        type="button"
        onClick={() => file && onUpload(file)}
        disabled={!file || uploading}
        className="btn-primary w-full py-3"
      >
        {uploading ? (
          <><span className="spinner" /> Extracting details with OCR & Groq AI…</>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" />
            Extract & Analyze Document
          </>
        )}
      </button>
    </div>
  );
};

export default DocumentUpload;
