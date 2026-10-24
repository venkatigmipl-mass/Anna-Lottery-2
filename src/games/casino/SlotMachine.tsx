import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, History } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoInt, cryptoChoice } from '../../utils/random';

interface SlotProps {
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

const SYMBOLS = [
  { id: 'seven', char: '7️⃣', name: '777', mult: 50, weight: 1 },
  { id: 'diamond', char: '💎', name: 'Diamond', mult: 25, weight: 2 },
  { id: 'bell', char: '🔔', name: 'Bell', mult: 15, weight: 4 },
  { id: 'bar', char: '🍫', name: 'BAR', mult: 10, weight: 6 },
  { id: 'melon', char: '🍉', name: 'Melon', mult: 6, weight: 8 },
  { id: 'cherry', char: '🍒', name: 'Cherry', mult: 3, weight: 12 },
  { id: 'wild', char: '⭐', name: 'Wild Star', mult: 2, isWild: true, weight: 3 }
];

// Weighted pool for slot reels
const SYMBOL_POOL = SYMBOLS.flatMap((s) => Array(s.weight).fill(s));

export const SlotMachine: React.FC<SlotProps> = ({
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
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<[string, string, string]>(['7️⃣', '💎', '7️⃣']);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState(0);
  const [history, setHistory] = useState<{ id: string; symbols: string[]; win: number; bet: number }[]>([]);

  const spinIntervals = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      spinIntervals.current.forEach((id) => clearInterval(id));
    };
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points for this wager.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    setIsSpinning(true);
    setWinMessage(null);
    setLastWinAmount(0);

    // Final outcome selected using crypto
    const final1 = cryptoChoice(SYMBOL_POOL);
    const final2 = cryptoChoice(SYMBOL_POOL);
    const final3 = cryptoChoice(SYMBOL_POOL);

    // Audio tick
    ArcadeSounds.playTick();

    // Fast rolling animation
    let count1 = 0;
    let count2 = 0;
    let count3 = 0;

    const intervalId = window.setInterval(() => {
      ArcadeSounds.playTick();
      setReels([
        cryptoChoice(SYMBOLS).char,
        cryptoChoice(SYMBOLS).char,
        cryptoChoice(SYMBOLS).char
      ]);
    }, 70);
    spinIntervals.current.push(intervalId);

    // Stop reel 1 at 700ms
    setTimeout(() => {
      setReels((prev) => [final1.char, prev[1], prev[2]]);
      ArcadeSounds.playCardFlip();
    }, 700);

    // Stop reel 2 at 1100ms
    setTimeout(() => {
      setReels((prev) => [final1.char, final2.char, prev[2]]);
      ArcadeSounds.playCardFlip();
    }, 1100);

    // Stop reel 3 at 1500ms and evaluate
    setTimeout(() => {
      clearInterval(intervalId);
      spinIntervals.current = [];
      setReels([final1.char, final2.char, final3.char]);
      ArcadeSounds.playCardFlip();

      evaluateWin(final1, final2, final3);
      setIsSpinning(false);
    }, 1500);
  };

  const evaluateWin = (s1: typeof SYMBOLS[0], s2: typeof SYMBOLS[0], s3: typeof SYMBOLS[0]) => {
    const chars = [s1, s2, s3];
    const hasWild = chars.some((c) => c.isWild);

    let payoutMultiplier = 0;
    let label = '';

    // Check 3 matching (accounting for wild)
    if (s1.id === s2.id && s2.id === s3.id) {
      payoutMultiplier = s1.mult;
      label = `TRIPLE ${s1.name.toUpperCase()}!`;
    } else if (hasWild) {
      const nonWilds = chars.filter((c) => !c.isWild);
      if (nonWilds.length <= 1 || (nonWilds.length === 2 && nonWilds[0].id === nonWilds[1].id)) {
        const target = nonWilds[0] || SYMBOLS[0];
        payoutMultiplier = target.mult;
        label = `WILD MATCH! 3x ${target.name.toUpperCase()}`;
      }
    }

    // Check 2 cherries
    if (payoutMultiplier === 0) {
      const cherryCount = chars.filter((c) => c.id === 'cherry' || c.isWild).length;
      if (cherryCount >= 2) {
        payoutMultiplier = 1.5;
        label = 'Double Cherries!';
      }
    }

    if (payoutMultiplier > 0) {
      const winPoints = Math.round(bet * payoutMultiplier);
      setLastWinAmount(winPoints);
      setWinMessage(`${label} (+${winPoints} pts)`);
      onWin(winPoints, game.id, game.name);

      if (payoutMultiplier >= 15) {
        ArcadeSounds.playJackpot();
        triggerConfetti({ count: 60 });
        showToast('success', `JACKPOT! Won ${winPoints.toLocaleString()} virtual points!`, '⭐ Huge Payout');
      } else {
        ArcadeSounds.playWin();
        triggerConfetti({ count: 25 });
        showToast('success', `Won ${winPoints.toLocaleString()} pts (${payoutMultiplier}x)`, 'Winner');
      }

      setHistory((prev) => [
        { id: String(Date.now()), symbols: [s1.char, s2.char, s3.char], win: winPoints, bet },
        ...prev.slice(0, 7)
      ]);
    } else {
      ArcadeSounds.playLoss();
      setWinMessage('No match this round');
      setHistory((prev) => [
        { id: String(Date.now()), symbols: [s1.char, s2.char, s3.char], win: 0, bet },
        ...prev.slice(0, 7)
      ]);
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
      {/* Slot Machine Cabinet */}
      <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-4 shadow-2xl overflow-hidden space-y-4">
        {/* Machine Marquee */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 rounded-xl border border-amber-500/30 text-amber-400">
          <div className="flex items-center gap-1 text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            777 Neon Arcade
          </div>
          <div className="text-[11px] font-semibold text-slate-300">
            Wild <span className="text-amber-400">⭐</span> Doubles Wins
          </div>
        </div>

        {/* Reels Window */}
        <div className="relative bg-slate-950 border-4 border-amber-500/50 rounded-2xl p-4 shadow-inner">
          {/* Center Payline Indicator */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-10 pointer-events-none opacity-80" />
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-5 bg-amber-500 rounded-r-md z-10" />
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-5 bg-amber-500 rounded-l-md z-10" />

          {/* 3 Reel Columns */}
          <div className="grid grid-cols-3 gap-2">
            {reels.map((symbol, idx) => (
              <div
                key={idx}
                className={`h-28 rounded-xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-5xl shadow-lg transition-transform ${
                  isSpinning ? 'animate-pulse scale-95' : 'scale-100'
                }`}
              >
                <span className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] filter">
                  {symbol}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome Display Banner */}
        <div className={`p-2.5 rounded-xl text-center text-xs font-bold transition-all ${
          lastWinAmount > 0
            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 animate-bounce'
            : winMessage
            ? 'bg-slate-800/80 text-slate-400'
            : 'bg-slate-950/40 text-slate-500'
        }`}>
          {winMessage || 'Tap SPIN to test your luck!'}
        </div>

        {/* Bet Controls */}
        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={isSpinning}
          onBetChange={setBet}
        />

        {/* Main Spin Action */}
        <button
          disabled={isSpinning || balance < bet}
          onClick={handleSpin}
          className={`w-full py-4 px-4 rounded-2xl font-black text-base tracking-wider uppercase transition-all shadow-xl min-h-[52px] ${
            isSpinning
              ? 'bg-slate-800 text-slate-400 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30 active:scale-[0.98]'
          }`}
        >
          {isSpinning ? 'Spinning Reels...' : `SPIN • ${bet} pts`}
        </button>
      </div>

      {/* History Bar */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Spins
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.win > 0
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>{h.symbols.join('')}</span>
                <span className="font-bold">{h.win > 0 ? `+${h.win}` : `-${h.bet}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
