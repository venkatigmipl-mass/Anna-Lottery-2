import React from 'react';
import { Clock, Coffee, HeartHandshake } from 'lucide-react';

interface ResponsiblePlayModalProps {
  isOpen: boolean;
  minutesPlayed: number;
  onResume: () => void;
}

export const ResponsiblePlayModal: React.FC<ResponsiblePlayModalProps> = ({
  isOpen,
  minutesPlayed,
  onResume
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
          <Coffee className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            Session Break Check-in
          </div>
          <h3 className="text-xl font-bold text-white">Time for a Quick Break?</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            You've been enjoying PlayZone Arcade for <span className="font-bold text-amber-400">{minutesPlayed} minutes</span>.
          </p>
        </div>

        <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/50 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            Healthy Arcade Play Habits
          </div>
          <p className="text-slate-400 leading-relaxed">
            Remember, PlayZone Arcade is strictly for fun. Virtual points have no real monetary value. Consider resting your eyes and drinking some water!
          </p>
        </div>

        <button
          onClick={onResume}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all min-h-[44px]"
        >
          I'm Good, Resume Playing
        </button>
      </div>
    </div>
  );
};
