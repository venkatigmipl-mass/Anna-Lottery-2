import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className={`mx-auto w-12 h-12 rounded-2xl flex items-center justify-center ${
          isDestructive ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm active:scale-95 transition-all min-h-[44px]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg active:scale-95 transition-all min-h-[44px] ${
              isDestructive
                ? 'bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-900/40 hover:from-rose-500 hover:to-red-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-900/40 hover:from-amber-400 hover:to-orange-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
