import React, { useState, useEffect, useRef } from 'react';
import { Palette, Clock, History, Trophy, Sparkles } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoInt } from '../../utils/random';

interface ColorProps {
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

type BetChoice = 'red' | 'green' | 'violet' | number;

interface RoundResult {
  roundId: number;
  number: number;
  colors: ('red' | 'green' | 'violet')[];
}

export const ColorPrediction: React.FC<ColorProps> = ({
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
  const [selectedChoice, setSelectedChoice] = useState<BetChoice>('red');
  const [activeWager, setActiveWager] = useState<{ choice: BetChoice; bet: number } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(25);
  const [currentRoundId, setCurrentRoundId] = useState(20261001);
  const [lastDrawn, setLastDrawn] = useState<RoundResult | null>(null);
  const [history, setHistory] = useState<RoundResult[]>([
    { roundId: 20261000, number: 7, colors: ['green'] },
    { roundId: 20260999, number: 2, colors: ['red'] },
    { roundId: 20260998, number: 0, colors: ['red', 'violet'] },
    { roundId: 20260997, number: 4, colors: ['red'] },
    { roundId: 20260996, number: 5, colors: ['green', 'violet'] },
    { roundId: 20260995, number: 9, colors: ['green'] },
    { roundId: 20260994, number: 8, colors: ['red'] }
  ]);

  const activeWagerRef = useRef(activeWager);
  activeWagerRef.current = activeWager;

  const currentRoundIdRef = useRef(currentRoundId);
  currentRoundIdRef.current = currentRoundId;

  const isLocked = secondsLeft <= 5; // last 5 seconds betting locked

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Trigger executeDraw outside of React's state updater
          setTimeout(() => {
            executeDraw();
          }, 0);
          return 30; // reset 30-sec cycle
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const executeDraw = () => {
    const roundId = currentRoundIdRef.current;
    const nextRoundId = roundId + 1;
    currentRoundIdRef.current = nextRoundId;
    setCurrentRoundId(nextRoundId);

    // Cryptographically fair number 0 to 9
    const num = getCryptoInt(0, 9);
    let colors: ('red' | 'green' | 'violet')[] = [];

    if (num === 0) {
      colors = ['red', 'violet'];
    } else if (num === 5) {
      colors = ['green', 'violet'];
    } else if ([2, 4, 6, 8].includes(num)) {
      colors = ['red'];
    } else {
      colors = ['green'];
    }

    const result: RoundResult = {
      roundId,
      number: num,
      colors
    };

    setLastDrawn(result);
    setHistory((prev) => {
      const filtered = prev.filter((p) => p.roundId !== roundId);
      return [result, ...filtered.slice(0, 14)];
    });

    // Evaluate user's active bet if any
    const wager = activeWagerRef.current;
    if (wager) {
      const userChoice = wager.choice;
      const userBet = wager.bet;
      let won = false;
      let multiplier = 0;

      if (typeof userChoice === 'number') {
        if (userChoice === num) {
          won = true;
          multiplier = 9;
        }
      } else if (userChoice === 'violet') {
        if (colors.includes('violet')) {
          won = true;
          multiplier = 4.5;
        }
      } else if (userChoice === 'red') {
        if (colors.includes('red')) {
          won = true;
          multiplier = num === 0 ? 1.5 : 2.0;
        }
      } else if (userChoice === 'green') {
        if (colors.includes('green')) {
          won = true;
          multiplier = num === 5 ? 1.5 : 2.0;
        }
      }

      if (won) {
        const winAmount = Math.round(userBet * multiplier);
        onWin(winAmount, game.id, game.name);
        if (multiplier >= 4) {
          ArcadeSounds.playJackpot();
          triggerConfetti({ count: 50 });
          showToast('success', `Direct Hit on ${num}! Won ${winAmount} pts (${multiplier}x)!`, 'Color Jackpot');
        } else {
          ArcadeSounds.playWin();
          triggerConfetti({ count: 20 });
          showToast('success', `Round #${result.roundId} Won! +${winAmount} pts`, 'Winner');
        }
      } else {
        ArcadeSounds.playLoss();
        showToast('info', `Round #${result.roundId} result was #${num} (${colors.join('+')}).`, 'No Win');
      }

      setActiveWager(null);
    }
  };

  const handlePlaceBet = () => {
    if (isLocked) {
      showToast('warning', 'Betting locked for the current draw! Wait for next round.', 'Locked');
      return;
    }
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    ArcadeSounds.playChipBet();
    setActiveWager({ choice: selectedChoice, bet });
    showToast('success', `Bet placed on ${String(selectedChoice).toUpperCase()} for Round #${currentRoundId}`, 'Bet Confirmed');
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-4">
        {/* Countdown Header */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Active Round</div>
            <div className="text-sm font-black text-amber-400 font-mono">#{currentRoundId}</div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isLocked ? 'text-rose-400 animate-spin' : 'text-cyan-400'}`} />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-semibold">{isLocked ? 'DRAWING...' : 'COUNTDOWN'}</div>
              <div className={`text-lg font-black font-mono leading-none ${isLocked ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </div>
            </div>
          </div>
        </div>

        {/* Last Drawn Spotlight */}
        {lastDrawn && (
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Last Round (#{lastDrawn.roundId}):</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-white">#{lastDrawn.number}</span>
              <div className="flex gap-1">
                {lastDrawn.colors.map((c, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white ${
                      c === 'red' ? 'bg-rose-600' : c === 'green' ? 'bg-emerald-600' : 'bg-purple-600'
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3 Main Colors */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isLocked}
            onClick={() => {
              ArcadeSounds.playClick();
              setSelectedChoice('green');
            }}
            className={`p-3 rounded-2xl border text-center transition-all min-h-[52px] ${
              selectedChoice === 'green'
                ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-300 shadow-md'
                : 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300'
            }`}
          >
            <div className="text-xs font-black uppercase">GREEN</div>
            <div className="text-[10px] font-semibold opacity-90">2x Payout</div>
          </button>

          <button
            type="button"
            disabled={isLocked}
            onClick={() => {
              ArcadeSounds.playClick();
              setSelectedChoice('violet');
            }}
            className={`p-3 rounded-2xl border text-center transition-all min-h-[52px] ${
              selectedChoice === 'violet'
                ? 'bg-purple-600 border-purple-400 text-white ring-2 ring-purple-300 shadow-md'
                : 'bg-purple-950/70 border-purple-800/80 text-purple-300'
            }`}
          >
            <div className="text-xs font-black uppercase">VIOLET</div>
            <div className="text-[10px] font-semibold opacity-90">4.5x Payout</div>
          </button>

          <button
            type="button"
            disabled={isLocked}
            onClick={() => {
              ArcadeSounds.playClick();
              setSelectedChoice('red');
            }}
            className={`p-3 rounded-2xl border text-center transition-all min-h-[52px] ${
              selectedChoice === 'red'
                ? 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-300 shadow-md'
                : 'bg-rose-950/70 border-rose-800/80 text-rose-300'
            }`}
          >
            <div className="text-xs font-black uppercase">RED</div>
            <div className="text-[10px] font-semibold opacity-90">2x Payout</div>
          </button>
        </div>

        {/* Single Numbers 0-9 (9x Payout) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
            <span>Or Predict Exact Number:</span>
            <span className="text-amber-400 font-bold">9x Payout</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i).map((num) => {
              const isSelected = selectedChoice === num;
              const isViolet = num === 0 || num === 5;
              const isRed = [0, 2, 4, 6, 8].includes(num);

              return (
                <button
                  key={num}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    ArcadeSounds.playClick();
                    setSelectedChoice(num);
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 scale-105 shadow-md'
                      : isViolet
                      ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-purple-200 border border-purple-700/60'
                      : isRed
                      ? 'bg-rose-950/80 text-rose-200 border border-rose-800/60'
                      : 'bg-emerald-950/80 text-emerald-200 border border-emerald-800/60'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Bet Indicator */}
        {activeWager && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs flex items-center justify-between text-amber-300">
            <span>Your Wager on Round #{currentRoundId}:</span>
            <span className="font-black font-mono">
              {activeWager.bet} pts on {String(activeWager.choice).toUpperCase()}
            </span>
          </div>
        )}

        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={Boolean(activeWager) || isLocked}
          onBetChange={setBet}
        />

        <button
          disabled={Boolean(activeWager) || isLocked || balance < bet}
          onClick={handlePlaceBet}
          className={`w-full py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all min-h-[50px] ${
            activeWager
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : isLocked
              ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {activeWager
            ? 'WAGER PLACED (WAITING FOR DRAW)'
            : isLocked
            ? 'BETTING LOCKED FOR DRAW...'
            : `PLACE BET • ${bet} PTS ON ${String(selectedChoice).toUpperCase()}`}
        </button>
      </div>

      {/* History Trend Pills */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
          <History className="w-3.5 h-3.5 text-amber-400" />
          Recent Round Results History
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {history.map((h, idx) => (
            <div
              key={`${h.roundId}-${idx}`}
              className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs text-white shadow-sm ${
                h.colors.includes('violet')
                  ? 'bg-gradient-to-br from-purple-600 to-rose-600'
                  : h.colors.includes('red')
                  ? 'bg-rose-600'
                  : 'bg-emerald-600'
              }`}
            >
              {h.number}
            </div>
          ))}
        </div>
      </div>
    </GameWrapper>
  );
};
