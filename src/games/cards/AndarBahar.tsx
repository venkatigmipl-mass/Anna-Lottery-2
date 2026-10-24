import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftRight, History, Sparkles } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { PlayingCard, createDeck, getSuitSymbol } from '../../utils/random';

interface AndarBaharProps {
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

type Side = 'andar' | 'bahar';

export const AndarBahar: React.FC<AndarBaharProps> = ({
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
  const [chosenSide, setChosenSide] = useState<Side>('andar');
  const [jokerCard, setJokerCard] = useState<PlayingCard | null>(null);
  const [andarCards, setAndarCards] = useState<PlayingCard[]>([]);
  const [baharCards, setBaharCards] = useState<PlayingCard[]>([]);
  const [isDealing, setIsDealing] = useState(false);
  const [winningSide, setWinningSide] = useState<Side | null>(null);
  const [history, setHistory] = useState<{ id: string; side: Side; cardLabel: string; won: boolean }[]>([]);

  const dealTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (dealTimer.current) clearTimeout(dealTimer.current);
    };
  }, []);

  const handleStartDeal = () => {
    if (isDealing) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    setIsDealing(true);
    setWinningSide(null);
    setAndarCards([]);
    setBaharCards([]);

    ArcadeSounds.playCardFlip();
    const deck = createDeck();
    const joker = deck.pop()!;
    setJokerCard(joker);

    let nextSide: Side = 'andar';
    const aCards: PlayingCard[] = [];
    const bCards: PlayingCard[] = [];

    const dealNextStep = () => {
      if (deck.length === 0) {
        setIsDealing(false);
        return;
      }

      ArcadeSounds.playCardFlip();
      const card = deck.pop()!;

      if (nextSide === 'andar') {
        aCards.push(card);
        setAndarCards([...aCards]);
      } else {
        bCards.push(card);
        setBaharCards([...bCards]);
      }

      // Check for match
      if (card.rank === joker.rank) {
        // Winner found!
        const winSide = nextSide;
        setWinningSide(winSide);
        setIsDealing(false);

        const won = chosenSide === winSide;
        const multiplier = winSide === 'andar' ? 1.9 : 2.0;

        if (won) {
          const winAmount = Math.round(bet * multiplier);
          onWin(winAmount, game.id, game.name);
          ArcadeSounds.playWin();
          triggerConfetti({ count: 30 });
          showToast('success', `Matching ${joker.label} found on ${winSide.toUpperCase()}! Won ${winAmount} pts`, 'Winner');
          setHistory((prev) => [{ id: String(Date.now()), side: winSide, cardLabel: joker.label, won: true }, ...prev.slice(0, 6)]);
        } else {
          ArcadeSounds.playLoss();
          showToast('info', `Card matched on ${winSide.toUpperCase()}.`, 'Round Over');
          setHistory((prev) => [{ id: String(Date.now()), side: winSide, cardLabel: joker.label, won: false }, ...prev.slice(0, 6)]);
        }
      } else {
        // Toggle side and schedule next card
        nextSide = nextSide === 'andar' ? 'bahar' : 'andar';
        dealTimer.current = window.setTimeout(dealNextStep, 280);
      }
    };

    dealTimer.current = window.setTimeout(dealNextStep, 500);
  };

  const renderCard = (card: PlayingCard, isMatch = false) => {
    return (
      <div
        className={`w-9 h-12 rounded-lg bg-white border shadow-sm p-0.5 flex flex-col justify-between shrink-0 ${
          isMatch ? 'ring-2 ring-amber-400 scale-105' : 'border-slate-300'
        } ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}
      >
        <span className="text-[9px] font-black leading-none">{card.label}</span>
        <span className="text-xs text-center leading-none">{getSuitSymbol(card.suit)}</span>
        <span className="text-[9px] font-black leading-none self-end">{card.label}</span>
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3.5">
        {/* Middle Joker Card */}
        <div className="text-center p-3 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex flex-col items-center">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Middle Joker Card
          </div>
          {jokerCard ? (
            <div className="w-16 h-22 rounded-xl bg-white border-2 border-amber-400 shadow-xl p-1.5 flex flex-col justify-between text-slate-900">
              <span className={`text-xs font-black ${jokerCard.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                {jokerCard.label}
              </span>
              <span className={`text-2xl text-center ${jokerCard.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                {getSuitSymbol(jokerCard.suit)}
              </span>
              <span className={`text-xs font-black self-end ${jokerCard.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                {jokerCard.label}
              </span>
            </div>
          ) : (
            <div className="w-16 h-22 rounded-xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center text-2xl text-slate-500">
              ?
            </div>
          )}
          <div className="text-[10px] text-slate-400 mt-1">
            Matching rank {jokerCard ? `(${jokerCard.label})` : ''} on your chosen side wins!
          </div>
        </div>

        {/* Andar vs Bahar Deal Columns */}
        <div className="grid grid-cols-2 gap-2">
          {/* ANDAR (LEFT) */}
          <div
            className={`p-2.5 rounded-2xl border transition-all ${
              winningSide === 'andar'
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400'
                : chosenSide === 'andar'
                ? 'bg-slate-950/90 border-amber-500/50'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-amber-400">ANDAR</span>
              <span className="text-[10px] text-slate-400">1.90x Payout</span>
            </div>
            <div className="flex flex-wrap gap-1 min-h-[58px] bg-slate-900/60 rounded-xl p-1.5 border border-slate-800/80">
              {andarCards.length === 0 ? (
                <span className="text-[10px] text-slate-600 m-auto">1st card dealt here</span>
              ) : (
                andarCards.map((c, i) => (
                  <div key={i}>{renderCard(c, jokerCard?.rank === c.rank)}</div>
                ))
              )}
            </div>
          </div>

          {/* BAHAR (RIGHT) */}
          <div
            className={`p-2.5 rounded-2xl border transition-all ${
              winningSide === 'bahar'
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-400'
                : chosenSide === 'bahar'
                ? 'bg-slate-950/90 border-amber-500/50'
                : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-blue-400">BAHAR</span>
              <span className="text-[10px] text-slate-400">2.00x Payout</span>
            </div>
            <div className="flex flex-wrap gap-1 min-h-[58px] bg-slate-900/60 rounded-xl p-1.5 border border-slate-800/80">
              {baharCards.length === 0 ? (
                <span className="text-[10px] text-slate-600 m-auto">2nd card dealt here</span>
              ) : (
                baharCards.map((c, i) => (
                  <div key={i}>{renderCard(c, jokerCard?.rank === c.rank)}</div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side choice buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isDealing}
            onClick={() => {
              ArcadeSounds.playClick();
              setChosenSide('andar');
            }}
            className={`py-3 px-3 rounded-2xl border text-center transition-all min-h-[48px] ${
              chosenSide === 'andar'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">BET ANDAR</div>
            <div className="text-[10px] text-amber-400 font-semibold">1.90x Payout</div>
          </button>

          <button
            type="button"
            disabled={isDealing}
            onClick={() => {
              ArcadeSounds.playClick();
              setChosenSide('bahar');
            }}
            className={`py-3 px-3 rounded-2xl border text-center transition-all min-h-[48px] ${
              chosenSide === 'bahar'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 ring-2 ring-blue-400/50'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">BET BAHAR</div>
            <div className="text-[10px] text-blue-400 font-semibold">2.00x Payout</div>
          </button>
        </div>

        <BetSelector
          bet={bet}
          minBet={game.minBet}
          maxBet={game.maxBet}
          balance={balance}
          disabled={isDealing}
          onBetChange={setBet}
        />

        <button
          disabled={isDealing || balance < bet}
          onClick={handleStartDeal}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all min-h-[48px] ${
            isDealing
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {isDealing ? 'Dealing Cards...' : `DEAL ANDAR BAHAR • ${bet} pts on ${chosenSide.toUpperCase()}`}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Andar Bahar Results
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.won ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>{h.side.toUpperCase()} ({h.cardLabel})</span>
                <span>{h.won ? 'Win' : 'Loss'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
