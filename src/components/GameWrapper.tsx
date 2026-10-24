import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Volume2, VolumeX, Coins } from 'lucide-react';
import { GameMeta } from '../types/arcade';
import { GameRulesModal } from './GameRulesModal';
import { ArcadeSounds } from '../services/soundEffects';

interface GameWrapperProps {
  game: GameMeta;
  balance: number;
  soundEnabled: boolean;
  onBack: () => void;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  children: React.ReactNode;
}

export const GameWrapper: React.FC<GameWrapperProps> = ({
  game,
  balance,
  soundEnabled,
  onBack,
  onToggleSound,
  onOpenWallet,
  children
}) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-2 pt-safe flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              ArcadeSounds.playClick();
              onBack();
            }}
            className="p-2 -ml-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Back to Lobby"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5 truncate max-w-[150px] xs:max-w-[180px]">
              {game.name}
            </h1>
            <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
              {game.isSkillNoBet ? 'Skill Arcade (Free)' : game.category.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Balance Pill */}
          <button
            onClick={() => {
              ArcadeSounds.playClick();
              onOpenWallet();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-400 active:scale-95 transition-all min-h-[40px]"
            title="Open Wallet"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{balance.toLocaleString()}</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => {
              onToggleSound();
              ArcadeSounds.playClick();
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Rules info button */}
          <button
            onClick={() => {
              ArcadeSounds.playClick();
              setShowRules(true);
            }}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-colors active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Game Rules & Odds"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Surface */}
      <main className="flex-1 overflow-y-auto px-3 py-3 pb-safe space-y-3">
        {children}
      </main>

      {/* Rules Modal */}
      <GameRulesModal game={showRules ? game : null} onClose={() => setShowRules(false)} />
    </div>
  );
};
