import React, { useState } from 'react';
import { Dices, History, Trophy } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoInt } from '../../utils/random';

interface DiceProps {
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

type BetChoice = 'under' | 'exact' | 'over';

export const DiceOverUnder: React.FC<DiceProps> = ({
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
  const [choice, setChoice] = useState<BetChoice>('over');
  const [isRolling, setIsRolling] = useState(false);
  const [dice, setDice] = useState<[number, number]>([4, 4]);
  const [history, setHistory] = useState<{ sum: number; d1: number; d2: number; won: boolean; winAmt: number }[]>([]);

  const handleRoll = () => {
    if (isRolling) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    setIsRolling(true);

    // Roll animation
    let count = 0;
    const interval = setInterval(() => {
      setDice([getCryptoInt(1, 6), getCryptoInt(1, 6)]);
      ArcadeSounds.playTick();
      count++;
      if (count > 10) {
        clearInterval(interval);
        // Final roll
        const d1 = getCryptoInt(1, 6);
        const d2 = getCryptoInt(1, 6);
        const sum = d1 + d2;
        setDice([d1, d2]);
        setIsRolling(false);
        evaluateRoll(d1, d2, sum);
      }
    }, 70);
  };

  const evaluateRoll = (d1: number, d2: number, sum: number) => {
    let won = false;
    let multiplier = 0;

    if (choice === 'under' && sum < 7) {
      won = true;
      multiplier = 2.3;
    } else if (choice === 'exact' && sum === 7) {
      won = true;
      multiplier = 5.8;
    } else if (choice === 'over' && sum > 7) {
      won = true;
      multiplier = 2.3;
    }

    if (won) {
      const winPoints = Math.round(bet * multiplier);
      onWin(winPoints, game.id, game.name);
      if (choice === 'exact') {
        ArcadeSounds.playJackpot();
        triggerConfetti({ count: 45 });
        showToast('success', `Lucky 7 Hit! Won ${winPoints} pts (5.8x)!`, 'Dice Jackpot');
      } else {
        ArcadeSounds.playWin();
        triggerConfetti({ count: 20 });
        showToast('success', `Sum was ${sum}! Won ${winPoints} pts`, 'Winner');
      }
      setHistory((prev) => [{ sum, d1, d2, won: true, winAmt: winPoints }, ...prev.slice(0, 7)]);
    } else {
      ArcadeSounds.playLoss();
      showToast('info', `Total was ${sum} (${sum < 7 ? 'Under 7' : sum === 7 ? 'Exact 7' : 'Over 7'}).`, 'Round Lost');
      setHistory((prev) => [{ sum, d1, d2, won: false, winAmt: 0 }, ...prev.slice(0, 7)]);
    }
  };

  const renderDiceFace = (val: number) => {
    const dots: { [key: number]: string } = {
      1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅'
    };
    return dots[val] || '⚀';
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
        {/* Dice Arena */}
        <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-center gap-6 shadow-inner min-h-[140px]">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-7xl font-black shadow-xl transition-transform ${
            isRolling ? 'animate-bounce rotate-12' : ''
          }`}>
            {renderDiceFace(dice[0])}
          </div>
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-7xl font-black shadow-xl transition-transform ${
            isRolling ? 'animate-bounce -rotate-12' : ''
          }`}>
            {renderDiceFace(dice[1])}
          </div>
        </div>

        <div className="text-sm font-black text-slate-200">
          Total Sum: <span className="text-amber-400 text-lg">{dice[0] + dice[1]}</span>
        </div>

        {/* Choice selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isRolling}
            onClick={() => {
              ArcadeSounds.playClick();
              setChoice('under');
            }}
            className={`p-3 rounded-2xl border text-center transition-all min-h-[56px] flex flex-col items-center justify-center ${
              choice === 'under'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase">Under 7</div>
            <div className="text-xs font-extrabold text-amber-400">2.3x Payout</div>
          </button>

          <button
            type="button"
            disabled={isRolling}
            onClick={() => {
              ArcadeSounds.playClick();
              setChoice('exact');
            }}
            className={`p-3 rounded-2xl border text-center transition-all min-h-[56px] flex flex-col items-center justify-center ${
              choice === 'exact'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase">Exact 7</div>
            <div className="text-xs font-extrabold text-amber-400">5.8x Payout</div>
          </button>

          <button
            type="button"
            disabled={isRolling}
            onClick={() => {
              ArcadeSounds.playClick();
              setChoice('over');
            }}
            className={`p-3 rounded-2xl border text-center transition-all min-h-[56px] flex flex-col items-center justify-center ${
              choice === 'over'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="text-xs font-bold uppercase">Over 7</div>
            <div className="text-xs font-extrabold text-amber-400">2.3x Payout</div>
          </button>
        </div>

        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={isRolling}
          onBetChange={setBet}
        />

        <button
          disabled={isRolling || balance < bet}
          onClick={handleRoll}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all min-h-[48px] ${
            isRolling
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {isRolling ? 'Rolling Dice...' : `ROLL DICE • ${bet} pts on ${choice.toUpperCase()}`}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Rolls
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h, i) => (
              <div
                key={i}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.won ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>Sum: {h.sum}</span>
                <span className="font-bold">{h.won ? `+${h.winAmt}` : 'Miss'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
