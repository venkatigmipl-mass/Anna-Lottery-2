import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, Square, AlertCircle, Gamepad2 } from 'lucide-react';

interface GateModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const GateModal: React.FC<GateModalProps> = ({ isOpen, onAccept }) => {
  const [is18Checked, setIs18Checked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  if (!isOpen) return null;

  const canProceed = is18Checked && isTermsChecked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto pt-safe pb-safe">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 mb-1">
            <Gamepad2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">PlayZone Arcade</h1>
          <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
            100% Free Demo Simulation
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200 leading-relaxed font-medium">
            <strong className="block text-rose-300 font-bold mb-0.5">Strictly Free Entertainment Demo</strong>
            All points, tokens, and chips in this app are fictional virtual counters. There are NO deposits, NO withdrawals, NO real money, and NO cash prizes. Demo only - virtual points have no real value.
          </div>
        </div>

        {/* Community & Safety Rules */}
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 text-xs space-y-2.5 text-slate-300 text-left">
          <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Arcade Fair Play & Safety Code
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-400 pl-1 leading-relaxed">
            <li>Unbiased cryptographically secure random number outcomes.</li>
            <li>Free +1,000 refill available whenever your points balance reaches zero.</li>
            <li>Automatic session break reminders every 15 minutes of play.</li>
            <li>Designed exclusively for age-appropriate casual arcade entertainment.</li>
          </ul>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-1 text-left">
          <button
            type="button"
            onClick={() => setIs18Checked(!is18Checked)}
            className="flex items-start gap-3 w-full p-2.5 rounded-xl hover:bg-slate-800/50 active:bg-slate-800 transition-colors text-left min-h-[44px]"
          >
            {is18Checked ? (
              <CheckSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            )}
            <span className="text-xs text-slate-200 font-medium leading-snug">
              I certify that I am 18 years of age or older (required for simulated arcade gaming themes).
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsTermsChecked(!isTermsChecked)}
            className="flex items-start gap-3 w-full p-2.5 rounded-xl hover:bg-slate-800/50 active:bg-slate-800 transition-colors text-left min-h-[44px]"
          >
            {isTermsChecked ? (
              <CheckSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Square className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            )}
            <span className="text-xs text-slate-200 font-medium leading-snug">
              I understand that PlayZone Arcade is a free entertainment demo with fictional virtual points that have NO monetary value.
            </span>
          </button>
        </div>

        {/* Action Button */}
        <button
          disabled={!canProceed}
          onClick={onAccept}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl min-h-[48px] ${
            canProceed
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/25 active:scale-[0.98] cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          Enter PlayZone Arcade
        </button>
      </div>
    </div>
  );
};
