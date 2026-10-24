import React, { useState, useEffect, useRef } from 'react';
import { Rocket, History, Zap, CheckCircle2 } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoFloat } from '../../utils/random';

interface CrashProps {
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

export const CrashRocket: React.FC<CrashProps> = ({
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
  const [autoCashout, setAutoCashout] = useState<number | null>(2.0);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed' | 'cashedOut'>('idle');
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(1.0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  const [history, setHistory] = useState<{ id: string; mult: number; won: boolean; winAmt: number }[]>([
    { id: '1', mult: 2.45, won: true, winAmt: 50 },
    { id: '2', mult: 1.12, won: false, winAmt: 0 },
    { id: '3', mult: 5.80, won: true, winAmt: 145 },
    { id: '4', mult: 1.05, won: false, winAmt: 0 },
    { id: '5', mult: 12.4, won: true, winAmt: 310 }
  ]);

  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentMultiplierRef = useRef<number>(1.0);
  const crashPointRef = useRef<number>(1.0);
  const isCashedOutRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  const handleLaunch = () => {
    if (gameState === 'flying') return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    // Crypto fair crash point (3% house edge)
    const randomF = getCryptoFloat();
    // 0.97 / (1 - randomF)
    const point = Math.max(1.0, Math.floor((0.97 / (1 - Math.min(0.99, randomF))) * 100) / 100);

    setCrashPoint(point);
    crashPointRef.current = point;
    setCashoutMultiplier(null);
    isCashedOutRef.current = false;
    setCurrentMultiplier(1.0);
    currentMultiplierRef.current = 1.0;
    setGameState('flying');

    ArcadeSounds.playCardFlip();
    startTimeRef.current = performance.now();

    const loop = (now: number) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      // Exponential curve: 1.00 * e^(0.06 * elapsedSec^1.35)
      const current = Math.floor((1.0 + Math.pow(elapsedSec * 0.8, 1.4)) * 100) / 100;
      currentMultiplierRef.current = current;
      setCurrentMultiplier(current);

      // Auto-cashout check
      if (!isCashedOutRef.current && autoCashout && current >= autoCashout && current < crashPointRef.current) {
        doCashout(current);
      }

      // Check crash
      if (current >= crashPointRef.current) {
        // Exploded!
        setGameState((prev) => {
          if (prev === 'cashedOut') return 'cashedOut';
          return 'crashed';
        });

        ArcadeSounds.playBoom();

        if (!isCashedOutRef.current) {
          showToast('error', `Rocket crashed at ${crashPointRef.current.toFixed(2)}x!`, 'Crashed');
          setHistory((prev) => [
            { id: String(Date.now()), mult: crashPointRef.current, won: false, winAmt: 0 },
            ...prev.slice(0, 7)
          ]);
        }
        return;
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);
  };

  const doCashout = (mult: number) => {
    if (isCashedOutRef.current || gameState === 'crashed') return;
    isCashedOutRef.current = true;
    setCashoutMultiplier(mult);
    setGameState('cashedOut');

    const winPoints = Math.round(bet * mult);
    onWin(winPoints, game.id, game.name);

    if (mult >= 5) {
      ArcadeSounds.playJackpot();
      triggerConfetti({ count: 50 });
      showToast('success', `EPIC CASHOUT! Won ${winPoints.toLocaleString()} pts at ${mult.toFixed(2)}x!`, 'To The Moon 🚀');
    } else {
      ArcadeSounds.playWin();
      triggerConfetti({ count: 25 });
      showToast('success', `Cashed out at ${mult.toFixed(2)}x! +${winPoints} pts`, 'Cashout Success');
    }

    setHistory((prev) => [
      { id: String(Date.now()), mult, won: true, winAmt: winPoints },
      ...prev.slice(0, 7)
    ]);
  };

  const handleManualCashout = () => {
    if (gameState !== 'flying' || isCashedOutRef.current) return;
    doCashout(currentMultiplierRef.current);
  };

  // Trajectory curve coordinates (normalized 0 to 1)
  const progressRatio = Math.min(1, (currentMultiplier - 1.0) / 10);
  const rocketX = 10 + progressRatio * 75;
  const rocketY = 85 - Math.pow(progressRatio, 0.75) * 65;

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
        {/* Live Multiplier Display & Flying Graph */}
        <div className="relative h-60 bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40 rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

          {/* Top Multiplier Pill */}
          <div className="z-10 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Live Trajectory
            </span>
            {cashoutMultiplier && (
              <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cashed at {cashoutMultiplier.toFixed(2)}x
              </span>
            )}
          </div>

          {/* Center Multiplier Typography */}
          <div className="z-10 text-center my-auto">
            <div
              className={`text-5xl font-black tracking-tight font-mono transition-transform duration-75 ${
                gameState === 'crashed'
                  ? 'text-rose-500 scale-105'
                  : gameState === 'cashedOut'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {currentMultiplier.toFixed(2)}x
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1">
              {gameState === 'crashed'
                ? `CRASHED @ ${crashPoint.toFixed(2)}x`
                : gameState === 'cashedOut'
                ? `LOCKED IN • +${Math.round(bet * (cashoutMultiplier || 1))} pts`
                : gameState === 'flying'
                ? 'ROCKET IN FLIGHT'
                : 'Ready to launch'}
            </div>
          </div>

          {/* Flying Rocket Icon */}
          {gameState === 'flying' && (
            <div
              className="absolute z-10 transition-all duration-75 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
              style={{ left: `${rocketX}%`, top: `${rocketY}%` }}
            >
              <Rocket className="w-8 h-8 -rotate-45 animate-pulse" />
            </div>
          )}

          {/* SVG Flight Curve */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d={`M 20 220 Q ${20 + progressRatio * 150} 210, ${rocketX * 3.2} ${rocketY * 2.4}`}
              fill="none"
              stroke={gameState === 'crashed' ? '#f43f5e' : '#f59e0b'}
              strokeWidth="4"
              strokeDasharray={gameState === 'flying' ? '6 4' : undefined}
            />
          </svg>
        </div>

        {/* Auto Cashout Selector */}
        <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-300 font-semibold">Auto-Cashout Target:</span>
          <div className="flex items-center gap-1.5">
            {[1.5, 2.0, 5.0, 10.0].map((val) => (
              <button
                key={val}
                type="button"
                disabled={gameState === 'flying'}
                onClick={() => setAutoCashout(autoCashout === val ? null : val)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  autoCashout === val
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {val.toFixed(1)}x
              </button>
            ))}
          </div>
        </div>

        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={gameState === 'flying'}
          onBetChange={setBet}
        />

        {/* Primary Action Button */}
        {gameState === 'flying' ? (
          <button
            onClick={handleManualCashout}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-xl shadow-emerald-500/30 active:scale-[0.98] min-h-[52px]"
          >
            CASHOUT {Math.round(bet * currentMultiplier)} PTS ({currentMultiplier.toFixed(2)}x)
          </button>
        ) : (
          <button
            disabled={balance < bet}
            onClick={handleLaunch}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-[0.98] min-h-[52px]"
          >
            LAUNCH ROCKET • {bet} PTS
          </button>
        )}
      </div>

      {/* Crash Result History Pills */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Crash Trajectories
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${
                  h.mult >= 2.0
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                }`}
              >
                {h.mult.toFixed(2)}x
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
