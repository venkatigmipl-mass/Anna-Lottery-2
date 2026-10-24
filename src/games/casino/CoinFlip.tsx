import React, { useState } from 'react';
import { Coins, Flame, History } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoFloat } from '../../utils/random';

interface CoinFlipProps {
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

type Side = 'heads' | 'tails';

export const CoinFlip: React.FC<CoinFlipProps> = ({
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
  const [chosenSide, setChosenSide] = useState<Side>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinSide, setCoinSide] = useState<Side>('heads');
  const [flipRotation, setFlipRotation] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<{ id: string; side: Side; won: boolean; winAmt: number }[]>([]);

  const handleFlip = () => {
    if (isFlipping) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    setIsFlipping(true);

    // Crypto fair 50/50
    const wonSide: Side = getCryptoFloat() < 0.5 ? 'heads' : 'tails';
    const turns = 8;
    const finalAngle = flipRotation + 360 * turns + (wonSide === 'heads' ? 0 : 180);
    setFlipRotation(finalAngle);

    // Flip sound ticks
    ArcadeSounds.playCardFlip();
    const tickTimer = setInterval(() => {
      ArcadeSounds.playTick();
    }, 140);

    setTimeout(() => {
      clearInterval(tickTimer);
      setCoinSide(wonSide);
      setIsFlipping(false);

      if (chosenSide === wonSide) {
        const winPoints = Math.round(bet * 1.96);
        const newStreak = streak + 1;
        setStreak(newStreak);
        onWin(winPoints, game.id, game.name);

        if (newStreak >= 3) {
          ArcadeSounds.playJackpot();
          triggerConfetti({ count: 40 });
          showToast('success', `Won ${winPoints} pts! ${newStreak}x Win Streak! 🔥`, 'Streak Master');
        } else {
          ArcadeSounds.playWin();
          triggerConfetti({ count: 20 });
          showToast('success', `It's ${wonSide.toUpperCase()}! Won ${winPoints} pts`, 'Winner');
        }
        setHistory((prev) => [{ id: String(Date.now()), side: wonSide, won: true, winAmt: winPoints }, ...prev.slice(0, 7)]);
      } else {
        ArcadeSounds.playLoss();
        setStreak(0);
        showToast('info', `Landed on ${wonSide.toUpperCase()}.`, 'Round Lost');
        setHistory((prev) => [{ id: String(Date.now()), side: wonSide, won: false, winAmt: 0 }, ...prev.slice(0, 7)]);
      }
    }, 1400);
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
        {/* Streak Indicator */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Streak Multiplier:</span>
          <span className="flex items-center gap-1 font-black text-amber-400">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            {streak} In A Row
          </span>
        </div>

        {/* 3D Coin Graphic */}
        <div className="py-4 flex items-center justify-center min-h-[170px]" style={{ perspective: '800px' }}>
          <div
            className="w-32 h-32 rounded-full shadow-2xl border-4 border-amber-400 flex items-center justify-center font-black text-3xl transition-transform duration-[1400ms] ease-out select-none"
            style={{
              transform: `rotateY(${flipRotation}deg)`,
              transformStyle: 'preserve-3d',
              background: 'radial-gradient(circle, #fde047 0%, #ca8a04 80%, #a16207 100%)',
              boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.5)'
            }}
          >
            <div className="text-amber-950 drop-shadow flex flex-col items-center">
              <span className="text-4xl">{coinSide === 'heads' ? '👑' : '⚡'}</span>
              <span className="text-xs font-black tracking-widest uppercase mt-0.5">
                {coinSide}
              </span>
            </div>
          </div>
        </div>

        {/* Heads / Tails Pick Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isFlipping}
            onClick={() => {
              ArcadeSounds.playClick();
              setChosenSide('heads');
            }}
            className={`p-3.5 rounded-2xl border transition-all min-h-[52px] flex items-center justify-center gap-2 ${
              chosenSide === 'heads'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <span className="text-xl">👑</span>
            <div className="text-left leading-tight">
              <div className="font-bold text-xs uppercase">Heads</div>
              <div className="text-[10px] text-amber-400 font-semibold">1.96x Payout</div>
            </div>
          </button>

          <button
            type="button"
            disabled={isFlipping}
            onClick={() => {
              ArcadeSounds.playClick();
              setChosenSide('tails');
            }}
            className={`p-3.5 rounded-2xl border transition-all min-h-[52px] flex items-center justify-center gap-2 ${
              chosenSide === 'tails'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <span className="text-xl">⚡</span>
            <div className="text-left leading-tight">
              <div className="font-bold text-xs uppercase">Tails</div>
              <div className="text-[10px] text-amber-400 font-semibold">1.96x Payout</div>
            </div>
          </button>
        </div>

        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={isFlipping}
          onBetChange={setBet}
        />

        <button
          disabled={isFlipping || balance < bet}
          onClick={handleFlip}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all min-h-[48px] ${
            isFlipping
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {isFlipping ? 'Flipping Coin...' : `FLIP COIN • ${bet} pts on ${chosenSide.toUpperCase()}`}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Flips
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.won ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>{h.side === 'heads' ? '👑 H' : '⚡ T'}</span>
                <span className="font-bold">{h.won ? `+${h.winAmt}` : 'Loss'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
