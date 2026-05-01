"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  loading,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" />
      <div
        className="relative card p-6 w-full max-w-sm animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-light hover:text-cream"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-signal-red/10 border border-signal-red/20 flex items-center justify-center mb-4">
          <AlertTriangle className="w-5 h-5 text-signal-red" />
        </div>

        <h3 className="text-cream font-semibold mb-1.5">{title}</h3>
        <p className="text-slate-light text-sm mb-5">{description}</p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-danger flex-1"
          >
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}