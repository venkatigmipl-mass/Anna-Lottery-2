import React from 'react';
import { Minus, Plus, Coins } from 'lucide-react';
import { ArcadeSounds } from '../services/soundEffects';

interface BetSelectorProps {
  bet: number;
  minBet: number;
  maxBet: number;
  balance: number;
  disabled?: boolean;
  onBetChange: (newBet: number) => void;
}

const CHIP_VALUES = [10, 25, 50, 100, 250];

export const BetSelector: React.FC<BetSelectorProps> = ({
  bet,
  minBet,
  maxBet,
  balance,
  disabled = false,
  onBetChange
}) => {
  const handleChipClick = (amount: number) => {
    if (disabled) return;
    ArcadeSounds.playChipBet();
    const clamped = Math.min(balance, Math.min(maxBet, amount));
    onBetChange(Math.max(minBet, clamped));
  };

  const handleStep = (delta: number) => {
    if (disabled) return;
    ArcadeSounds.playClick();
    const next = bet + delta;
    const clamped = Math.min(balance, Math.min(maxBet, Math.max(minBet, next)));
    onBetChange(clamped);
  };

  const handleMax = () => {
    if (disabled) return;
    ArcadeSounds.playChipBet();
    const maxPossible = Math.min(balance, maxBet);
    onBetChange(Math.max(minBet, maxPossible));
  };

  const handleHalf = () => {
    if (disabled) return;
    ArcadeSounds.playChipBet();
    const half = Math.floor(bet / 2);
    onBetChange(Math.max(minBet, Math.min(balance, half)));
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-amber-400" />
          Wager Amount
        </span>
        <span className="text-[11px] text-slate-400">
          Min: <span className="text-slate-200">{minBet}</span> • Max: <span className="text-slate-200">{maxBet}</span>
        </span>
      </div>

      {/* Main Bet Counter */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={disabled || bet <= minBet}
          onClick={() => handleStep(-10)}
          className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition-all min-h-[44px] min-w-[44px]"
          aria-label="Decrease bet"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl py-2 px-3 text-center">
          <div className="text-xl font-black text-amber-400 tracking-tight flex items-center justify-center gap-1">
            <span>{bet.toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-500/80 uppercase">pts</span>
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || bet >= maxBet || bet >= balance}
          onClick={() => handleStep(10)}
          className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition-all min-h-[44px] min-w-[44px]"
          aria-label="Increase bet"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Chips Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none">
        {CHIP_VALUES.map((chip) => {
          const isSelected = bet === chip;
          const isAffordable = balance >= chip;
          return (
            <button
              key={chip}
              type="button"
              disabled={disabled || !isAffordable}
              onClick={() => handleChipClick(chip)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all min-h-[38px] min-w-[48px] ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30'
              }`}
            >
              {chip}
            </button>
          );
        })}
        <button
          type="button"
          disabled={disabled}
          onClick={handleHalf}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold min-h-[38px] active:scale-95"
        >
          ½
        </button>
        <button
          type="button"
          disabled={disabled || balance < minBet}
          onClick={handleMax}
          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold min-h-[38px] active:scale-95 shadow-sm"
        >
          MAX
        </button>
      </div>
    </div>
  );
};
