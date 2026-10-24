import React, { useState } from 'react';
import { TrendingUp, TrendingDown, History, Trophy, Flame } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { PlayingCard, createDeck, getSuitSymbol } from '../../utils/random';

interface HighLowProps {
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

const MULTIPLIER_LADDER = [1.0, 1.35, 1.9, 2.8, 4.2, 6.5, 10.0, 16.0, 25.0];

export const HighLow: React.FC<HighLowProps> = ({
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
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [currentCard, setCurrentCard] = useState<PlayingCard | null>(null);
  const [cardHistory, setCardHistory] = useState<PlayingCard[]>([]);
  const [streak, setStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState<{ id: string; streak: number; win: number; bet: number }[]>([]);

  const currentMultiplier = MULTIPLIER_LADDER[Math.min(streak, MULTIPLIER_LADDER.length - 1)];
  const currentCashoutVal = Math.round(bet * currentMultiplier);

  const startRound = () => {
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    ArcadeSounds.playCardFlip();
    const newDeck = createDeck();
    const first = newDeck.pop()!;

    setDeck(newDeck);
    setCurrentCard(first);
    setCardHistory([first]);
    setStreak(0);
    setIsPlaying(true);
  };

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (!isPlaying || !currentCard || deck.length === 0) return;

    ArcadeSounds.playCardFlip();
    const newDeck = [...deck];
    const nextCard = newDeck.pop()!;
    setDeck(newDeck);

    const prevRank = currentCard.rank;
    const nextRank = nextCard.rank;

    setCardHistory((prev) => [nextCard, ...prev]);
    setCurrentCard(nextCard);

    let isCorrect = false;
    let isPush = false;

    if (nextRank === prevRank) {
      isPush = true;
    } else if (guess === 'higher' && nextRank > prevRank) {
      isCorrect = true;
    } else if (guess === 'lower' && nextRank < prevRank) {
      isCorrect = true;
    }

    if (isPush) {
      ArcadeSounds.playTick();
      showToast('info', `Equal rank (${nextCard.label})! Push - streak maintained.`, 'Push');
    } else if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      ArcadeSounds.playWin();

      if (nextStreak >= 4) {
        triggerConfetti({ count: 25 });
      }

      showToast('success', `Correct! ${nextCard.label} was ${guess.toUpperCase()}!`, 'Streak +1');
    } else {
      // Bust
      setIsPlaying(false);
      ArcadeSounds.playLoss();
      showToast('error', `Bust! ${nextCard.label} was not ${guess}. Better luck next time!`, 'Round Over');
      setHistory((prev) => [{ id: String(Date.now()), streak, win: 0, bet }, ...prev.slice(0, 6)]);
    }
  };

  const handleCashout = () => {
    if (!isPlaying || streak === 0) return;

    setIsPlaying(false);
    onWin(currentCashoutVal, game.id, game.name);

    if (currentMultiplier >= 4) {
      ArcadeSounds.playJackpot();
      triggerConfetti({ count: 50 });
    } else {
      ArcadeSounds.playWin();
      triggerConfetti({ count: 25 });
    }

    showToast('success', `Cashed out ${currentCashoutVal} pts at ${currentMultiplier}x!`, '💰 Cashout Locked');
    setHistory((prev) => [{ id: String(Date.now()), streak, win: currentCashoutVal, bet }, ...prev.slice(0, 6)]);
  };

  const renderCard = (card: PlayingCard, isCurrent = false) => {
    return (
      <div
        className={`w-14 h-20 rounded-xl bg-white border shadow-md p-1.5 flex flex-col justify-between shrink-0 select-none ${
          isCurrent ? 'ring-2 ring-amber-400 scale-105 shadow-amber-500/20' : 'border-slate-300 opacity-70'
        } ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}
      >
        <span className="text-xs font-black leading-none">{card.label}</span>
        <span className="text-2xl text-center leading-none">{getSuitSymbol(card.suit)}</span>
        <span className="text-xs font-black leading-none self-end">{card.label}</span>
      </div>
    );
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
        {/* Multiplier Ladder Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {MULTIPLIER_LADDER.slice(1).map((m, idx) => {
            const stepNum = idx + 1;
            const isReached = streak >= stepNum;
            const isNext = streak + 1 === stepNum;

            return (
              <div
                key={stepNum}
                className={`flex-1 py-1 px-2 rounded-xl border text-[11px] font-black shrink-0 text-center ${
                  isReached
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25'
                    : isNext
                    ? 'bg-slate-800 border-amber-500/50 text-amber-400 animate-pulse'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {m}x
              </div>
            );
          })}
        </div>

        {/* Current Card Stage */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[140px] space-y-2">
          {currentCard ? (
            <div className="flex items-center gap-3">
              {renderCard(currentCard, true)}
              <div className="text-left">
                <div className="text-xs text-slate-400">Current Rank:</div>
                <div className="text-lg font-black text-white">
                  {currentCard.label}{' '}
                  <span className="text-xs font-medium text-slate-400">
                    ({currentCard.rank === 1 ? 'Ace (Low = 1)' : currentCard.rank === 13 ? 'King (High = 13)' : `Value: ${currentCard.rank}`})
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold mt-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  Streak: {streak} Correct
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6">Tap Start Round to draw first card</div>
          )}
        </div>

        {/* Higher / Lower Guessing Buttons */}
        {isPlaying ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleGuess('higher')}
                className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-sm active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 min-h-[50px]"
              >
                <TrendingUp className="w-5 h-5" />
                HIGHER ▲
              </button>
              <button
                onClick={() => handleGuess('lower')}
                className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-black text-sm active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 min-h-[50px]"
              >
                <TrendingDown className="w-5 h-5" />
                LOWER ▼
              </button>
            </div>

            {/* Cashout Button */}
            <button
              disabled={streak === 0}
              onClick={handleCashout}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl min-h-[48px] ${
                streak > 0
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-amber-500/30 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              CASHOUT {currentCashoutVal} PTS ({currentMultiplier}x)
            </button>
          </div>
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
              onClick={startRound}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-[0.98] min-h-[48px]"
            >
              START ROUND • {bet} PTS
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Ladder Runs
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.win > 0 ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>Streak {h.streak}</span>
                <span className="font-bold">{h.win > 0 ? `+${h.win}` : `-${h.bet}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
