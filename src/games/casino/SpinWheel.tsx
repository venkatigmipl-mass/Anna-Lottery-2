import React, { useState, useEffect, useRef } from 'react';
import { CircleDot, Trophy, History, Sparkles } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoInt } from '../../utils/random';

interface SpinWheelProps {
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

const SLICES = [
  { mult: 25, label: '25x JACKPOT', color: '#f59e0b', textCol: '#000' },
  { mult: 0, label: '0x MISS', color: '#334155', textCol: '#94a3b8' },
  { mult: 1.5, label: '1.5x', color: '#0284c7', textCol: '#fff' },
  { mult: 2, label: '2x', color: '#4f46e5', textCol: '#fff' },
  { mult: 0.5, label: '0.5x', color: '#475569', textCol: '#e2e8f0' },
  { mult: 3, label: '3x', color: '#7c3aed', textCol: '#fff' },
  { mult: 5, label: '5x BIG', color: '#ec4899', textCol: '#fff' },
  { mult: 0, label: '0x MISS', color: '#334155', textCol: '#94a3b8' },
  { mult: 1.2, label: '1.2x', color: '#059669', textCol: '#fff' },
  { mult: 10, label: '10x SUPER', color: '#dc2626', textCol: '#fff' },
  { mult: 2, label: '2x', color: '#4f46e5', textCol: '#fff' },
  { mult: 1.8, label: '1.8x', color: '#0d9488', textCol: '#fff' }
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
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
  const [rotation, setRotation] = useState(0);
  const [lastWin, setLastWin] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; mult: number; win: number; bet: number }[]>([]);

  const sliceAngle = 360 / SLICES.length;
  const spinTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (spinTimer.current) clearTimeout(spinTimer.current);
    };
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    setIsSpinning(true);
    setLastWin(null);

    // Crypto random slice index (0 to 11)
    const targetIndex = getCryptoInt(0, SLICES.length - 1);
    const targetSlice = SLICES[targetIndex];

    // Align with top pointer (pointer at 270 deg / top)
    const extraSpins = 6;
    const targetAngle = 360 * extraSpins + (360 - targetIndex * sliceAngle - sliceAngle / 2);
    const finalRotation = rotation + targetAngle;
    setRotation(finalRotation);

    // Sound ticks
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      ArcadeSounds.playTick();
      tickCount++;
      if (tickCount > 20) clearInterval(tickInterval);
    }, 120);

    spinTimer.current = window.setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);

      if (targetSlice.mult > 0) {
        const winAmount = Math.round(bet * targetSlice.mult);
        onWin(winAmount, game.id, game.name);
        setLastWin(`Landed on ${targetSlice.label}! Won ${winAmount} pts`);

        if (targetSlice.mult >= 10) {
          ArcadeSounds.playJackpot();
          triggerConfetti({ count: 60 });
          showToast('success', `MEGA WIN! Won ${winAmount.toLocaleString()} pts (${targetSlice.mult}x)!`, 'Jackpot Wheel');
        } else {
          ArcadeSounds.playWin();
          triggerConfetti({ count: 20 });
          showToast('success', `Won ${winAmount} pts (${targetSlice.mult}x)`, 'Winner');
        }
        setHistory((prev) => [{ id: String(Date.now()), mult: targetSlice.mult, win: winAmount, bet }, ...prev.slice(0, 7)]);
      } else {
        ArcadeSounds.playLoss();
        setLastWin('Landed on Miss (0x)');
        showToast('info', 'Landed on 0x Miss. Give it another whirl!', 'No Win');
        setHistory((prev) => [{ id: String(Date.now()), mult: 0, win: 0, bet }, ...prev.slice(0, 7)]);
      }
    }, 2800);
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
        {/* Wheel Display */}
        <div className="relative w-56 h-56 mx-auto my-2">
          {/* Top Pointer Needle */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 z-20 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />

          {/* SVG Rotating Slices */}
          <div
            className="w-full h-full rounded-full shadow-2xl border-4 border-amber-500/80 transition-transform duration-[2800ms] ease-out overflow-hidden"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="-100 -100 200 200" className="w-full h-full">
              {SLICES.map((slice, i) => {
                const startAngle = (i * sliceAngle * Math.PI) / 180;
                const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;
                const x1 = 100 * Math.cos(startAngle);
                const y1 = 100 * Math.sin(startAngle);
                const x2 = 100 * Math.cos(endAngle);
                const y2 = 100 * Math.sin(endAngle);
                const midAngle = ((i + 0.5) * sliceAngle * Math.PI) / 180;
                const textX = 65 * Math.cos(midAngle);
                const textY = 65 * Math.sin(midAngle);

                return (
                  <g key={i}>
                    <path
                      d={`M 0 0 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                      fill={slice.color}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill={slice.textCol}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${i * sliceAngle + sliceAngle / 2 + 90}, ${textX}, ${textY})`}
                    >
                      {slice.mult === 25 ? '★25x' : `${slice.mult}x`}
                    </text>
                  </g>
                );
              })}
              {/* Center Hub */}
              <circle cx="0" cy="0" r="22" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="0" cy="0" r="12" fill="#f59e0b" />
            </svg>
          </div>
        </div>

        {/* Win Banner */}
        <div className="h-8 flex items-center justify-center">
          {lastWin ? (
            <div className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {lastWin}
            </div>
          ) : (
            <div className="text-xs text-slate-400">Spin the wheel to win up to 25x Jackpot!</div>
          )}
        </div>

        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={isSpinning}
          onBetChange={setBet}
        />

        <button
          disabled={isSpinning || balance < bet}
          onClick={handleSpin}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all min-h-[48px] ${
            isSpinning
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {isSpinning ? 'Wheel Spinning...' : `SPIN WHEEL • ${bet} pts`}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Wheel Spins
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.win > 0 ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>{h.mult}x</span>
                <span className="font-bold">{h.win > 0 ? `+${h.win}` : `-${h.bet}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
