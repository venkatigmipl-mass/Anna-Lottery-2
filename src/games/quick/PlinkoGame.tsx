import React, { useState, useEffect, useRef } from 'react';
import { History, Sparkles } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoFloat } from '../../utils/random';

interface PlinkoProps {
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

const BUCKETS = [
  { mult: 10, color: 'bg-rose-600', text: '10x' },
  { mult: 3, color: 'bg-orange-500', text: '3x' },
  { mult: 1.5, color: 'bg-amber-500', text: '1.5x' },
  { mult: 0.5, color: 'bg-indigo-600', text: '0.5x' },
  { mult: 0.2, color: 'bg-slate-700', text: '0.2x' },
  { mult: 0.5, color: 'bg-indigo-600', text: '0.5x' },
  { mult: 1.5, color: 'bg-amber-500', text: '1.5x' },
  { mult: 3, color: 'bg-orange-500', text: '3x' },
  { mult: 10, color: 'bg-rose-600', text: '10x' }
];

export const PlinkoGame: React.FC<PlinkoProps> = ({
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
  const [isDropping, setIsDropping] = useState(false);
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);
  const [highlightBucket, setHighlightBucket] = useState<number | null>(null);
  const [history, setHistory] = useState<{ id: string; mult: number; win: number; bet: number }[]>([]);

  const rows = 8;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handleDropBall = () => {
    if (isDropping) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    setIsDropping(true);
    setHighlightBucket(null);

    // Calculate path using crypto. 8 decisions: 0 = left, 1 = right
    const path: number[] = [];
    for (let i = 0; i < rows; i++) {
      path.push(getCryptoFloat() < 0.5 ? -1 : 1);
    }

    // Final bucket index = count of +1s
    const rightTurns = path.filter((p) => p === 1).length;
    const bucketIndex = rightTurns; // 0 to 8

    // Animate ball step-by-step
    let currentStep = 0;
    let curX = 150;
    let curY = 20;

    const stepInterval = setInterval(() => {
      if (currentStep < rows) {
        const dir = path[currentStep];
        curX += dir * 14;
        curY += 22;
        setBallPos({ x: curX, y: curY });
        ArcadeSounds.playTick();
        currentStep++;
      } else {
        clearInterval(stepInterval);
        // Landed in bucket
        setHighlightBucket(bucketIndex);
        setIsDropping(false);
        setBallPos(null);

        const bucket = BUCKETS[bucketIndex];
        const winAmount = Math.round(bet * bucket.mult);

        if (bucket.mult >= 1.0) {
          onWin(winAmount, game.id, game.name);
          if (bucket.mult >= 10) {
            ArcadeSounds.playJackpot();
            triggerConfetti({ count: 50 });
            showToast('success', `EDGE POCKET 10X HIT! Won ${winAmount} pts!`, 'Jackpot Drop');
          } else {
            ArcadeSounds.playWin();
            triggerConfetti({ count: 20 });
            showToast('success', `Landed in ${bucket.mult}x bucket! Won ${winAmount} pts`, 'Winner');
          }
        } else {
          ArcadeSounds.playLoss();
          if (winAmount > 0) onWin(winAmount, game.id, game.name);
          showToast('info', `Landed in ${bucket.mult}x bucket. Returned ${winAmount} pts`, 'Plinko');
        }

        setHistory((prev) => [
          { id: String(Date.now()), mult: bucket.mult, win: winAmount, bet },
          ...prev.slice(0, 7)
        ]);
      }
    }, 130);
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
        {/* Pegboard Pyramid Area */}
        <div className="relative w-full max-w-xs mx-auto h-56 bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-inner flex flex-col justify-between overflow-hidden">
          {/* Pegs */}
          <div className="flex-1 flex flex-col justify-around py-2">
            {Array.from({ length: rows }).map((_, rIdx) => {
              const pegCount = rIdx + 3;
              return (
                <div key={rIdx} className="flex justify-center gap-4">
                  {Array.from({ length: pegCount }).map((__, pIdx) => (
                    <div
                      key={pIdx}
                      className="w-2 h-2 rounded-full bg-slate-500 shadow-sm"
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Animated Falling Ball */}
          {ballPos && (
            <div
              className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] z-10 transition-all duration-100 ease-out -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(ballPos.x / 300) * 100}%`, top: `${(ballPos.y / 220) * 100}%` }}
            />
          )}

          {/* Bottom Multiplier Buckets */}
          <div className="grid grid-cols-9 gap-0.5 pt-1 border-t border-slate-800">
            {BUCKETS.map((b, i) => (
              <div
                key={i}
                className={`py-1 rounded text-[9px] font-black text-white transition-all ${b.color} ${
                  highlightBucket === i ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-85'
                }`}
              >
                {b.text}
              </div>
            ))}
          </div>
        </div>

        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={isDropping}
          onBetChange={setBet}
        />

        <button
          disabled={isDropping || balance < bet}
          onClick={handleDropBall}
          className={`w-full py-4 px-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all min-h-[50px] ${
            isDropping
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {isDropping ? 'Ball Dropping...' : `DROP BALL • ${bet} PTS`}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Drops
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${
                  h.mult >= 1.5
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {h.mult}x
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
