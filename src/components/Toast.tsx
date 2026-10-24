import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/arcade';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-3 left-0 right-0 z-50 flex flex-col items-center px-4 space-y-2 pointer-events-none pt-safe">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 w-full max-w-sm px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border animate-in fade-in slide-in-from-top-4 duration-200 ${
              isSuccess
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-900/30'
                : isError
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-900/30'
                : isWarning
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-900/30'
                : 'bg-slate-900/90 border-slate-700 text-slate-100 shadow-black/40'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
              <div className="text-sm font-medium leading-tight truncate">
                {toast.title && <div className="font-semibold text-xs opacity-90">{toast.title}</div>}
                <div className="truncate">{toast.message}</div>
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition-transform text-white/70 hover:text-white shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
