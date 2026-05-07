"use client";

import { useRef, useState } from "react";
import { profilesApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { redirect } from "next/navigation";
import { UploadCloud, FileText, CheckCircle, XCircle } from "lucide-react";

interface ImportResult {
  total_rows: number;
  inserted: number;
  skipped: number;
  reasons: Record<string, number>;
}

const REASON_LABELS: Record<string, string> = {
  duplicate_name: "Duplicate name",
  invalid_age: "Invalid age",
  invalid_gender: "Invalid gender",
  invalid_probability: "Invalid probability",
  missing_fields: "Missing fields",
  malformed_row: "Malformed row",
};

export default function ImportPage() {
  const { user, loading } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user?.role !== "admin") redirect("/dashboard");

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".csv")) {
      setError("Only CSV files are accepted.");
      return;
    }
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const data = await profilesApi.importCsv(file);
      setResult(data);
      setFile(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl text-cream">Import Profiles</h1>
        <p className="text-slate-light mt-1 text-sm">
          Upload a CSV file with up to 500,000 rows.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`card p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all border-dashed
          ${dragging ? "border-accent bg-accent/5" : "border-slate-edge hover:border-slate-mid"}`}
      >
        <UploadCloud className="w-10 h-10 text-slate-light" />
        <p className="text-cream text-sm font-medium">
          {file ? file.name : "Drop a CSV here or click to browse"}
        </p>
        <p className="text-slate-light text-xs">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB`
            : "Accepted format: .csv"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {/* Selected file pill */}
      {file && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-ink-muted border border-slate-edge text-sm text-cream">
          <FileText className="w-4 h-4 text-accent shrink-0" />
          <span className="flex-1 truncate">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="text-slate-light hover:text-signal-red transition-colors text-xs"
          >
            Remove
          </button>
        </div>
      )}

      {error && (
        <p className="text-signal-red text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" /> {error}
        </p>
      )}

      <button
        className="btn btn-primary w-full justify-center"
        disabled={!file || uploading}
        onClick={handleSubmit}
      >
        {uploading ? "Uploading…" : "Upload & Import"}
      </button>

      {/* Result summary */}
      {result && (
        <div className="card p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2 text-signal-green">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">Import complete</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total rows", value: result.total_rows },
              { label: "Inserted", value: result.inserted, green: true },
              { label: "Skipped", value: result.skipped, amber: result.skipped > 0 },
            ].map(({ label, value, green, amber }) => (
              <div key={label} className="bg-ink-muted rounded-xl p-4 border border-slate-edge">
                <div className={`text-2xl font-display ${green ? "text-signal-green" : amber ? "text-signal-amber" : "text-cream"}`}>
                  {value.toLocaleString()}
                </div>
                <div className="text-xs text-slate-light mt-1">{label}</div>
              </div>
            ))}
          </div>

          {Object.keys(result.reasons).length > 0 && (
            <div>
              <p className="text-xs text-slate-light uppercase tracking-wider mb-2">
                Skip reasons
              </p>
              <div className="space-y-1.5">
                {Object.entries(result.reasons).map(([key, count]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-light">
                      {REASON_LABELS[key] ?? key.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono text-signal-amber">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}