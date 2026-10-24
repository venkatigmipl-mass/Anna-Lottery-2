import React, { useState } from 'react';
import { Crown, History, Trophy } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { PlayingCard, createDeck, getSuitSymbol } from '../../utils/random';

interface BaccaratProps {
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

type BetSide = 'player' | 'banker' | 'tie';

export const Baccarat: React.FC<BaccaratProps> = ({
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
  const [chosenSide, setChosenSide] = useState<BetSide>('banker');
  const [playerCards, setPlayerCards] = useState<PlayingCard[]>([]);
  const [bankerCards, setBankerCards] = useState<PlayingCard[]>([]);
  const [isDealing, setIsDealing] = useState(false);
  const [resultText, setResultText] = useState('Select your bet and tap Deal');
  const [history, setHistory] = useState<{ id: string; winner: BetSide; pScore: number; bScore: number; won: boolean }[]>([]);

  const cardValue = (card: PlayingCard): number => {
    if (card.rank >= 10) return 0;
    return card.rank;
  };

  const handScore = (cards: PlayingCard[]): number => {
    const total = cards.reduce((acc, c) => acc + cardValue(c), 0);
    return total % 10;
  };

  const handleDeal = () => {
    if (isDealing) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    setIsDealing(true);
    setResultText('Dealing hands...');
    ArcadeSounds.playCardFlip();

    const deck = createDeck();
    const pHand = [deck.pop()!, deck.pop()!];
    const bHand = [deck.pop()!, deck.pop()!];

    setPlayerCards(pHand);
    setBankerCards(bHand);

    let pScore = handScore(pHand);
    let bScore = handScore(bHand);

    // Check for natural 8 or 9
    setTimeout(() => {
      if (pScore >= 8 || bScore >= 8) {
        finishRound(pHand, bHand, pScore, bScore);
      } else {
        // Player 3rd card rule
        let playerDrew = false;
        let p3rdCard: PlayingCard | null = null;

        if (pScore <= 5) {
          playerDrew = true;
          p3rdCard = deck.pop()!;
          pHand.push(p3rdCard);
          pScore = handScore(pHand);
          setPlayerCards([...pHand]);
          ArcadeSounds.playCardFlip();
        }

        // Banker 3rd card rule
        let bankerDraws = false;
        if (!playerDrew) {
          if (bScore <= 5) bankerDraws = true;
        } else if (p3rdCard) {
          const p3Val = cardValue(p3rdCard);
          if (bScore <= 2) bankerDraws = true;
          else if (bScore === 3 && p3Val !== 8) bankerDraws = true;
          else if (bScore === 4 && p3Val >= 2 && p3Val <= 7) bankerDraws = true;
          else if (bScore === 5 && p3Val >= 4 && p3Val <= 7) bankerDraws = true;
          else if (bScore === 6 && (p3Val === 6 || p3Val === 7)) bankerDraws = true;
        }

        if (bankerDraws) {
          const b3rdCard = deck.pop()!;
          bHand.push(b3rdCard);
          bScore = handScore(bHand);
          setBankerCards([...bHand]);
          ArcadeSounds.playCardFlip();
        }

        finishRound(pHand, bHand, pScore, bScore);
      }
    }, 900);
  };

  const finishRound = (pHand: PlayingCard[], bHand: PlayingCard[], pScore: number, bScore: number) => {
    setIsDealing(false);
    let winningSide: BetSide = 'tie';

    if (pScore > bScore) winningSide = 'player';
    else if (bScore > pScore) winningSide = 'banker';
    else winningSide = 'tie';

    const won = chosenSide === winningSide;

    if (won) {
      let multiplier = 2; // Player 1:1
      if (winningSide === 'banker') multiplier = 1.95; // Banker 0.95:1
      if (winningSide === 'tie') multiplier = 9; // Tie 8:1 (9x return)

      const winAmount = Math.round(bet * multiplier);
      onWin(winAmount, game.id, game.name);

      if (winningSide === 'tie') {
        ArcadeSounds.playJackpot();
        triggerConfetti({ count: 50 });
        showToast('success', `TIE HIT (8:1)! Won ${winAmount} pts!`, 'Baccarat Tie');
      } else {
        ArcadeSounds.playWin();
        triggerConfetti({ count: 20 });
        showToast('success', `${winningSide.toUpperCase()} Won! +${winAmount} pts`, 'Winner');
      }

      setResultText(`${winningSide.toUpperCase()} wins with ${winningSide === 'player' ? pScore : bScore}! (+${winAmount} pts)`);
      setHistory((prev) => [{ id: String(Date.now()), winner: winningSide, pScore, bScore, won: true }, ...prev.slice(0, 6)]);
    } else {
      ArcadeSounds.playLoss();
      setResultText(`${winningSide.toUpperCase()} wins (${pScore} vs ${bScore}).`);
      showToast('info', `${winningSide.toUpperCase()} won this round.`, 'Round Over');
      setHistory((prev) => [{ id: String(Date.now()), winner: winningSide, pScore, bScore, won: false }, ...prev.slice(0, 6)]);
    }
  };

  const renderCard = (card: PlayingCard) => (
    <div
      className={`w-12 h-16 rounded-xl bg-white border border-slate-300 shadow-md p-1 flex flex-col justify-between shrink-0 select-none ${
        card.color === 'red' ? 'text-red-600' : 'text-slate-900'
      }`}
    >
      <span className="text-[10px] font-black leading-none">{card.label}</span>
      <span className="text-base text-center leading-none">{getSuitSymbol(card.suit)}</span>
      <span className="text-[10px] font-black leading-none self-end">{card.label}</span>
    </div>
  );

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
        {/* Table Comparison Arena */}
        <div className="grid grid-cols-2 gap-3">
          {/* Player Hand */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-blue-500/30 text-center space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-400">
              <span>PLAYER</span>
              <span>Score: {playerCards.length > 0 ? handScore(playerCards) : '-'}</span>
            </div>
            <div className="flex justify-center gap-1.5 min-h-[70px] items-center">
              {playerCards.map((c, i) => (
                <div key={i}>{renderCard(c)}</div>
              ))}
            </div>
          </div>

          {/* Banker Hand */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-rose-500/30 text-center space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-400">
              <span>BANKER</span>
              <span>Score: {bankerCards.length > 0 ? handScore(bankerCards) : '-'}</span>
            </div>
            <div className="flex justify-center gap-1.5 min-h-[70px] items-center">
              {bankerCards.map((c, i) => (
                <div key={i}>{renderCard(c)}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Result Message */}
        <div className="py-2 px-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold text-amber-300 text-center">
          {resultText}
        </div>

        {/* 3 Bet Choices: Player, Tie, Banker */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={isDealing}
            onClick={() => {
              ArcadeSounds.playClick();
              setChosenSide('player');
            }}
            className={`py-3 px-2 rounded-2xl border text-center transition-all min-h-[52px] ${
              chosenSide === 'player'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 ring-2 ring-blue-400/50'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">PLAYER</div>
            <div className="text-[10px] text-blue-400 font-bold">1:1 Payout</div>
          </button>

          <button
            type="button"
            disabled={isDealing}
            onClick={() => {
              ArcadeSounds.playClick();
              setChosenSide('tie');
            }}
            className={`py-3 px-2 rounded-2xl border text-center transition-all min-h-[52px] ${
              chosenSide === 'tie'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">TIE</div>
            <div className="text-[10px] text-emerald-400 font-bold">8:1 Payout</div>
          </button>

          <button
            type="button"
            disabled={isDealing}
            onClick={() => {
              ArcadeSounds.playClick();
              setChosenSide('banker');
            }}
            className={`py-3 px-2 rounded-2xl border text-center transition-all min-h-[52px] ${
              chosenSide === 'banker'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-2 ring-rose-400/50'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <div className="text-xs font-bold uppercase">BANKER</div>
            <div className="text-[10px] text-rose-400 font-bold">0.95:1 Payout</div>
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
          onClick={handleDeal}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all min-h-[48px] ${
            isDealing
              ? 'bg-slate-800 text-slate-500 cursor-wait'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {isDealing ? 'Dealing Cards...' : `DEAL BACCARAT • ${bet} pts on ${chosenSide.toUpperCase()}`}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Baccarat Hands
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.won ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>Winner: {h.winner.toUpperCase()} ({h.pScore}-{h.bScore})</span>
                <span>{h.won ? 'Win' : 'Loss'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
