import React, { useState, useEffect, useRef } from 'react';
import { Disc, History, ShieldCheck } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoInt } from '../../utils/random';

interface RouletteProps {
  game: GameMeta;
  balance: number;
  soundEnabled: boolean;
  onBack: () => void;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  onWin: (amount: number, gameId: string, gameName: string) => void;
  onBet: (amount: number, gameId: string, gameName: string) => boolean;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

type BetOption =
  | 'red'
  | 'black'
  | 'even'
  | 'odd'
  | 'low' // 1-18
  | 'high' // 19-36
  | '1st12'
  | '2nd12'
  | '3rd12'
  | number; // straight number 0-36

export const Roulette: React.FC<RouletteProps> = ({
  game,
  balance,
  soundEnabled,
  onBack,
  onToggleSound,
  onOpenWallet,
  onWin,
  onBet,
  showToast
}) => {
  const [bet, setBet] = useState(25);
  const [selectedBet, setSelectedBet] = useState<BetOption>('red');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastResult, setLastResult] = useState<{ number: number; color: 'red' | 'black' | 'green' } | null>(null);
  const [resultHistory, setResultHistory] = useState<{ number: number; color: 'red' | 'black' | 'green' }[]>([
    { number: 7, color: 'red' },
    { number: 22, color: 'black' },
    { number: 0, color: 'green' },
    { number: 18, color: 'red' }
  ]);

  const spinTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (spinTimer.current) clearTimeout(spinTimer.current);
    };
  }, []);

  const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
    if (num === 0) return 'green';
    return RED_NUMBERS.includes(num) ? 'red' : 'black';
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    setIsSpinning(true);
    setLastResult(null);

    // Crypto fair outcome 0-36
    const winningNum = getCryptoInt(0, 36);
    const winColor = getNumberColor(winningNum);

    // Animate rotation (at least 5 full rotations + random angle)
    const newRotation = wheelRotation + 1800 + winningNum * (360 / 37);
    setWheelRotation(newRotation);

    // Wheel ticks
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      ArcadeSounds.playTick();
      tickCount++;
      if (tickCount > 18) clearInterval(tickInterval);
    }, 120);

    spinTimer.current = window.setTimeout(() => {
      clearInterval(tickInterval);
      const res = { number: winningNum, color: winColor };
      setLastResult(res);
      setResultHistory((prev) => [res, ...prev.slice(0, 9)]);
      setIsSpinning(false);

      evaluatePayout(winningNum, winColor);
    }, 2400);
  };

  const evaluatePayout = (num: number, color: 'red' | 'black' | 'green') => {
    let won = false;
    let multiplier = 0;

    if (typeof selectedBet === 'number') {
      // Straight bet 36x
      if (num === selectedBet) {
        won = true;
        multiplier = 36;
      }
    } else if (selectedBet === 'red' && color === 'red') {
      won = true;
      multiplier = 2;
    } else if (selectedBet === 'black' && color === 'black') {
      won = true;
      multiplier = 2;
    } else if (selectedBet === 'even' && num !== 0 && num % 2 === 0) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === 'odd' && num % 2 !== 0) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === 'low' && num >= 1 && num <= 18) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === 'high' && num >= 19 && num <= 36) {
      won = true;
      multiplier = 2;
    } else if (selectedBet === '1st12' && num >= 1 && num <= 12) {
      won = true;
      multiplier = 3;
    } else if (selectedBet === '2nd12' && num >= 13 && num <= 24) {
      won = true;
      multiplier = 3;
    } else if (selectedBet === '3rd12' && num >= 25 && num <= 36) {
      won = true;
      multiplier = 3;
    }

    if (won) {
      const winPoints = Math.round(bet * multiplier);
      onWin(winPoints, game.id, game.name);
      if (multiplier >= 10) {
        ArcadeSounds.playJackpot();
        triggerConfetti({ count: 50 });
        showToast('success', `Direct Hit! Won ${winPoints.toLocaleString()} pts!`, 'Roulette Jackpot');
      } else {
        ArcadeSounds.playWin();
        triggerConfetti({ count: 20 });
        showToast('success', `Ball landed on ${num} (${color.toUpperCase()})! Won ${winPoints} pts`, 'Winner');
      }
    } else {
      ArcadeSounds.playLoss();
      showToast('info', `Ball landed on ${num} (${color.toUpperCase()}). Better luck next spin!`, 'Round Over');
    }
  };

  return (
    <GameWrapper
      game={game}
      balance={balance}
      soundEnabled={soundEnabled}
      onBack={onBack}
      onToggleSound={onToggleSound}
      onOpenWallet={onOpenWallet}
    >
      {/* Animated Wheel & Result Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4 text-center">
        {/* Roulette Wheel Graphic */}
        <div className="relative w-44 h-44 mx-auto">
          <div
            className="w-full h-full rounded-full border-4 border-amber-500/80 shadow-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center transition-transform duration-[2400ms] ease-out"
            style={{ transform: `rotate(${wheelRotation}deg)` }}
          >
            {/* Wheel Spokes & Ring */}
            <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-400/40" />
            <div className="absolute inset-3 rounded-full border border-slate-700" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg flex items-center justify-center font-black text-slate-950 text-xs">
              0-36
            </div>
          </div>
          {/* Top Marker Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-400 z-10 filter drop-shadow" />
        </div>

        {/* Live Result Display */}
        <div className="h-10 flex items-center justify-center">
          {isSpinning ? (
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 animate-pulse">
              <Disc className="w-4 h-4 animate-spin" />
              Ball is spinning on the rim...
            </div>
          ) : lastResult ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Ball Settled:</span>
              <span
                className={`px-3 py-1 rounded-full font-black text-sm text-white shadow-md ${
                  lastResult.color === 'red'
                    ? 'bg-red-600 shadow-red-900/50'
                    : lastResult.color === 'black'
                    ? 'bg-slate-800 border border-slate-600'
                    : 'bg-emerald-600 shadow-emerald-900/50'
                }`}
              >
                {lastResult.number} {lastResult.color.toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Select your bet on the table below</div>
          )}
        </div>

        {/* Betting Board Grid */}
        <div className="space-y-2 text-left">
          <div className="text-xs font-bold text-slate-300">Choose Bet Placement</div>

          {/* Outside Bets (2x) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'red' as BetOption, label: 'RED (2x)', color: 'bg-red-600 hover:bg-red-500 text-white' },
              { id: 'black' as BetOption, label: 'BLACK (2x)', color: 'bg-slate-800 hover:bg-slate-700 text-slate-100' },
              { id: 'even' as BetOption, label: 'EVEN (2x)', color: 'bg-indigo-950 border border-indigo-500/40 text-indigo-200' },
              { id: 'odd' as BetOption, label: 'ODD (2x)', color: 'bg-indigo-950 border border-indigo-500/40 text-indigo-200' },
              { id: 'low' as BetOption, label: '1 - 18 (2x)', color: 'bg-slate-800/80 text-slate-300' },
              { id: 'high' as BetOption, label: '19 - 36 (2x)', color: 'bg-slate-800/80 text-slate-300' },
              { id: '1st12' as BetOption, label: '1st 12 (3x)', color: 'bg-slate-800/80 text-slate-300' },
              { id: '2nd12' as BetOption, label: '2nd 12 (3x)', color: 'bg-slate-800/80 text-slate-300' }
            ].map((opt) => (
              <button
                key={String(opt.id)}
                type="button"
                disabled={isSpinning}
                onClick={() => {
                  ArcadeSounds.playClick();
                  setSelectedBet(opt.id);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all min-h-[44px] flex items-center justify-center ${
                  opt.color
                } ${
                  selectedBet === opt.id
                    ? 'ring-2 ring-amber-400 shadow-md scale-[1.02]'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Quick Straight Number Selector (0-36) */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Or Bet Direct Number (36x Payout):</span>
              <span className="text-amber-400 font-bold">
                {typeof selectedBet === 'number' ? `Selected: #${selectedBet}` : 'None'}
              </span>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {Array.from({ length: 37 }, (_, i) => i).map((num) => {
                const isSelected = selectedBet === num;
                const col = getNumberColor(num);
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => {
                      ArcadeSounds.playClick();
                      setSelectedBet(num);
                    }}
                    className={`shrink-0 w-8 h-8 rounded-lg text-xs font-black transition-all ${
                      col === 'green' ? 'bg-emerald-600 text-white' : col === 'red' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200'
                    } ${isSelected ? 'ring-2 ring-amber-400 scale-110 shadow-lg' : 'opacity-85'}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bet Selector */}
        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={isSpinning}
          onBetChange={setBet}
        />

        {/* Spin Button */}
        <button
          disabled={isSpinning || balance < bet}
          onClick={handleSpin}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl min-h-[48px] ${
            isSpinning
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {isSpinning ? 'Wheel In Motion...' : `SPIN WHEEL • ${bet} pts on ${String(selectedBet).toUpperCase()}`}
        </button>
      </div>

      {/* Result History Strip */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <History className="w-3.5 h-3.5 text-amber-400" />
          Recent Wheel Outcomes
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {resultHistory.map((item, idx) => (
            <div
              key={idx}
              className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                item.color === 'red'
                  ? 'bg-red-600'
                  : item.color === 'black'
                  ? 'bg-slate-800 border border-slate-700'
                  : 'bg-emerald-600'
              }`}
            >
              {item.number}
            </div>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};
