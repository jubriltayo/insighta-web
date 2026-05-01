"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// Global toast store (simple event bus)
type Listener = (toast: Toast) => void;
const listeners: Listener[] = [];

export function toast(type: ToastType, message: string) {
  const t: Toast = { id: Math.random().toString(36).slice(2), type, message };
  listeners.forEach((l) => l(t));
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-signal-green" />,
  error: <AlertCircle className="w-4 h-4 text-signal-red" />,
  info: <Info className="w-4 h-4 text-signal-blue" />,
};

const borderColors = {
  success: "border-signal-green/30",
  error: "border-signal-red/30",
  info: "border-signal-blue/30",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 card px-4 py-3 shadow-xl border ${borderColors[t.type]} animate-slide-up max-w-sm`}
        >
          {icons[t.type]}
          <p className="text-sm text-cream flex-1">{t.message}</p>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-slate-light hover:text-cream transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}