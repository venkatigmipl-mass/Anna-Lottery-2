import React from 'react';
import { Gamepad2, Coins, Clock, Volume2, VolumeX } from 'lucide-react';
import { ArcadeSounds } from '../services/soundEffects';

interface HeaderProps {
  balance: number;
  sessionSeconds: number;
  soundEnabled: boolean;
  onOpenWallet: () => void;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  balance,
  sessionSeconds,
  soundEnabled,
  onOpenWallet,
  onToggleSound
}) => {
  const formatSession = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 pt-safe flex items-center justify-between gap-2">
      {/* Brand logo & title */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
          <Gamepad2 className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
            PlayZone
            <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.5 rounded-full font-bold">
              DEMO
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Session: {formatSession(sessionSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Sound toggle */}
        <button
          onClick={() => {
            onToggleSound();
            ArcadeSounds.playClick();
          }}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Toggle Sound"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Balance chip */}
        <button
          onClick={() => {
            ArcadeSounds.playClick();
            onOpenWallet();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 hover:border-amber-400 rounded-xl text-xs font-black text-amber-400 active:scale-95 transition-all shadow-sm min-h-[40px]"
        >
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{balance.toLocaleString()}</span>
        </button>
      </div>
    </header>
  );
};
