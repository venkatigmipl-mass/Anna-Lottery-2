import React, { useState, useEffect, useRef } from 'react';
import { Zap, Clock, Trophy, Flame, RotateCcw } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';

interface TapProps {
  game: GameMeta;
  balance: number;
  soundEnabled: boolean;
  onBack: () => void;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  onEarnPoints: (points: number, xp: number, gameId: string, gameName: string, note: string) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
}

export const TapSpeed: React.FC<TapProps> = ({
  game,
  balance,
  soundEnabled,
  onBack,
  onToggleSound,
  onOpenWallet,
  onEarnPoints,
  showToast
}) => {
  const [gameState, setGameState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [bestScore, setBestScore] = useState(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = () => {
    ArcadeSounds.playClick();
    setTaps(0);
    setTimeLeft(10);
    setGameState('running');

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            setGameState('finished');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (gameState === 'finished') {
      finishRound(taps);
    }
  }, [gameState]);

  const handleTap = () => {
    if (gameState !== 'running') return;
    ArcadeSounds.playTick();
    setTaps((t) => t + 1);
  };

  const finishRound = (finalTaps: number) => {
    let pts = 75;
    let xp = 20;
    let tier = 'Nice Effort';

    if (finalTaps >= 80) {
      pts = 350;
      xp = 100;
      tier = '⚡ GODLIKE SPEED';
      ArcadeSounds.playJackpot();
      triggerConfetti({ count: 60 });
    } else if (finalTaps >= 60) {
      pts = 250;
      xp = 70;
      tier = '🔥 PRO SPEED';
      ArcadeSounds.playWin();
      triggerConfetti({ count: 30 });
    } else if (finalTaps >= 40) {
      pts = 150;
      xp = 40;
      tier = 'FAST FINGERS';
      ArcadeSounds.playWin();
    } else {
      ArcadeSounds.playLoss();
    }

    if (finalTaps > bestScore) {
      setBestScore(finalTaps);
    }

    onEarnPoints(pts, xp, game.id, game.name, `Tap Speed Frenzy score: ${finalTaps} taps`);
    showToast('success', `${tier}! ${finalTaps} taps (${(finalTaps / 10).toFixed(1)} CPS). +${pts} pts & +${xp} XP!`, 'Skill Reward');
  };

  const cps = gameState === 'running' && timeLeft < 10 ? (taps / (10 - timeLeft)).toFixed(1) : (taps / 10).toFixed(1);

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
        {/* Metric Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Time Remaining</div>
            <div className={`text-xl font-black font-mono ${timeLeft <= 3 && gameState === 'running' ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`}>
              {timeLeft}s
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Taps</div>
            <div className="text-xl font-black font-mono text-amber-400">{taps}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Speed (CPS)</div>
            <div className="text-xl font-black font-mono text-emerald-400">{cps}</div>
          </div>
        </div>

        {/* Big Tap Target Orb */}
        <div className="py-4 flex items-center justify-center">
          {gameState === 'running' ? (
            <button
              type="button"
              onClick={handleTap}
              className="w-48 h-48 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-slate-950 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.5)] active:scale-90 transition-transform select-none cursor-pointer border-4 border-amber-300"
            >
              <Zap className="w-14 h-14 animate-bounce" />
              <span className="text-2xl font-black tracking-wider uppercase mt-1">TAP!</span>
              <span className="text-xs font-bold opacity-80">{taps}</span>
            </button>
          ) : gameState === 'finished' ? (
            <div className="w-48 h-48 rounded-full bg-slate-950 border-4 border-amber-500/40 flex flex-col items-center justify-center space-y-1 p-2">
              <Trophy className="w-10 h-10 text-amber-400" />
              <div className="text-2xl font-black text-white">{taps} TAPS</div>
              <div className="text-xs text-amber-400 font-bold">{cps} Taps/Sec</div>
            </div>
          ) : (
            <div className="w-48 h-48 rounded-full bg-slate-950 border-4 border-slate-800 flex flex-col items-center justify-center space-y-1 p-4">
              <Flame className="w-10 h-10 text-orange-400" />
              <div className="text-sm font-bold text-white">10s Challenge</div>
              <div className="text-xs text-slate-400">Ready to test your reflexes?</div>
            </div>
          )}
        </div>

        {/* Controls */}
        {gameState !== 'running' && (
          <button
            onClick={handleStart}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-[0.98] min-h-[52px]"
          >
            {gameState === 'finished' ? 'TRY AGAIN (FREE)' : 'START 10S TAP CHALLENGE (FREE)'}
          </button>
        )}

        {/* Information */}
        <div className="text-xs text-slate-400">
          100% Free Skill Game • No betting. Faster taps unlock bigger virtual point rewards and XP!
        </div>
      </div>
    </GameWrapper>
  );
};
