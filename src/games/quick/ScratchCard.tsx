import React, { useState } from 'react';
import { Ticket, Sparkles, Trophy, History } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { cryptoChoice, cryptoShuffle } from '../../utils/random';

interface ScratchProps {
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

interface Panel {
  id: number;
  value: number; // multiplier e.g. 2, 5, 10, 25, 50
  icon: string;
  isScratched: boolean;
}

const PRIZE_OPTIONS = [
  { value: 50, icon: '👑', label: '50X' },
  { value: 25, icon: '💎', label: '25X' },
  { value: 10, icon: '⭐', label: '10X' },
  { value: 5, icon: '🔔', label: '5X' },
  { value: 2, icon: '🍒', label: '2X' }
];

export const ScratchCard: React.FC<ScratchProps> = ({
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
  const [hasTicket, setHasTicket] = useState(false);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; win: number; bet: number; won: boolean }[]>([]);

  const buyTicket = () => {
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    ArcadeSounds.playCardFlip();

    // Determine if ticket is a winner (approx 45% hit rate for fair fun)
    const isWinner = Math.random() < 0.45;
    let pool: typeof PRIZE_OPTIONS[0][] = [];

    if (isWinner) {
      // Pick a winning prize
      const winOption = cryptoChoice(PRIZE_OPTIONS);
      // 3 matching win options
      pool.push(winOption, winOption, winOption);
      // Fill remaining 3 panels with distinct or random other prizes
      const others = PRIZE_OPTIONS.filter((p) => p.value !== winOption.value);
      pool.push(cryptoChoice(others), cryptoChoice(others), cryptoChoice(others));
    } else {
      // Non-winner: no 3 matching
      const p1 = PRIZE_OPTIONS[0];
      const p2 = PRIZE_OPTIONS[1];
      const p3 = PRIZE_OPTIONS[2];
      const p4 = PRIZE_OPTIONS[3];
      const p5 = PRIZE_OPTIONS[4];
      pool = [p1, p1, p2, p3, p4, p5];
    }

    const shuffled = cryptoShuffle(pool);
    const newPanels: Panel[] = shuffled.map((p, idx) => ({
      id: idx,
      value: p.value,
      icon: p.icon,
      isScratched: false
    }));

    setPanels(newPanels);
    setHasTicket(true);
    setResultMessage(null);
  };

  const scratchPanel = (id: number) => {
    if (!hasTicket) return;
    const panel = panels.find((p) => p.id === id);
    if (!panel || panel.isScratched) return;

    ArcadeSounds.playTick();
    const updated = panels.map((p) => (p.id === id ? { ...p, isScratched: true } : p));
    setPanels(updated);

    // If all panels now scratched, evaluate
    if (updated.every((p) => p.isScratched)) {
      evaluateCard(updated);
    }
  };

  const scratchAll = () => {
    if (!hasTicket) return;
    ArcadeSounds.playCardFlip();
    const updated = panels.map((p) => ({ ...p, isScratched: true }));
    setPanels(updated);
    evaluateCard(updated);
  };

  const evaluateCard = (cards: Panel[]) => {
    // Count occurrences of values
    const counts: Record<number, number> = {};
    for (const c of cards) {
      counts[c.value] = (counts[c.value] || 0) + 1;
    }

    let winMultiplier = 0;
    for (const [val, count] of Object.entries(counts)) {
      if (count >= 3) {
        winMultiplier = Number(val);
        break;
      }
    }

    if (winMultiplier > 0) {
      const winAmount = Math.round(bet * winMultiplier);
      onWin(winAmount, game.id, game.name);
      setResultMessage(`MATCH 3! You won ${winAmount} pts (${winMultiplier}x)!`);

      if (winMultiplier >= 10) {
        ArcadeSounds.playJackpot();
        triggerConfetti({ count: 50 });
        showToast('success', `JACKPOT! Matched 3x ${winMultiplier}X! Won ${winAmount} pts!`, 'Lucky Scratch');
      } else {
        ArcadeSounds.playWin();
        triggerConfetti({ count: 20 });
        showToast('success', `Matched 3! Won ${winAmount} pts`, 'Winner');
      }
      setHistory((prev) => [{ id: String(Date.now()), win: winAmount, bet, won: true }, ...prev.slice(0, 6)]);
    } else {
      ArcadeSounds.playLoss();
      setResultMessage('No 3 matching prizes this card.');
      showToast('info', 'No match! Scratch another ticket.', 'Scratch Card');
      setHistory((prev) => [{ id: String(Date.now()), win: 0, bet, won: false }, ...prev.slice(0, 6)]);
    }
    setHasTicket(false);
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-4 text-center">
        {/* Ticket Header Banner */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-amber-500/30">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Ticket className="w-4 h-4" />
            Neon Lucky Scratch 50X
          </div>
          <div className="text-[11px] text-slate-300 font-semibold">
            Match 3 identical prizes to win
          </div>
        </div>

        {/* 6 Scratch Panels Grid (2 rows x 3 cols) */}
        <div className="grid grid-cols-3 gap-2.5 p-3 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950 rounded-2xl border border-slate-800">
          {panels.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-center text-slate-600 text-xs font-bold"
              >
                Panel {i + 1}
              </div>
            ))
          ) : (
            panels.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={!hasTicket || p.isScratched}
                onClick={() => scratchPanel(p.id)}
                className={`aspect-[4/3] rounded-2xl flex flex-col items-center justify-center transition-all p-2 min-h-[56px] select-none ${
                  p.isScratched
                    ? 'bg-slate-900 border-2 border-amber-400/80 shadow-inner animate-in zoom-in-90'
                    : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-600 shadow-md hover:border-amber-400/60 active:scale-95 cursor-pointer'
                }`}
              >
                {p.isScratched ? (
                  <>
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-xs font-black text-amber-400 font-mono mt-0.5">
                      {p.value}X
                    </span>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                      SCRATCH
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Result Message */}
        {resultMessage && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs font-bold text-amber-300">
            {resultMessage}
          </div>
        )}

        {/* Controls */}
        {hasTicket ? (
          <button
            onClick={scratchAll}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-lg active:scale-[0.98] min-h-[48px]"
          >
            SCRATCH ALL PANELS
          </button>
        ) : (
          <div className="space-y-3">
            <BetSelector
              bet={bet}
              minBet={game.minBet}
              maxBet={game.maxBet}
              balance={balance}
              onBetChange={setBet}
            />
            <button
              disabled={balance < bet}
              onClick={buyTicket}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-[0.98] min-h-[48px]"
            >
              BUY TICKET • {bet} PTS
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Scratch Cards
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.won ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>{h.won ? `+${h.win}` : `-${h.bet}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
