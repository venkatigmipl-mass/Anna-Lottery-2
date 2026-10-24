import React, { useState } from 'react';
import { Layers, ShieldCheck, History } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { PlayingCard, createDeck, getSuitSymbol } from '../../utils/random';

interface BlackjackProps {
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

type GameStage = 'betting' | 'playing' | 'dealerTurn' | 'finished';

export const Blackjack: React.FC<BlackjackProps> = ({
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
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [stage, setStage] = useState<GameStage>('betting');
  const [statusMessage, setStatusMessage] = useState('Place your bet to start');
  const [history, setHistory] = useState<{ id: string; result: 'win' | 'loss' | 'push' | 'bj'; points: number }[]>([]);

  const calculateHandValue = (hand: PlayingCard[]): number => {
    let sum = 0;
    let aceCount = 0;

    for (const card of hand) {
      if (card.rank === 1) {
        aceCount++;
        sum += 11;
      } else if (card.rank >= 10) {
        sum += 10;
      } else {
        sum += card.rank;
      }
    }

    while (sum > 21 && aceCount > 0) {
      sum -= 10;
      aceCount--;
    }

    return sum;
  };

  const handleDeal = () => {
    if (stage !== 'betting') return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    ArcadeSounds.playCardFlip();
    const newDeck = createDeck();

    const pCard1 = newDeck.pop()!;
    const dCard1 = newDeck.pop()!;
    const pCard2 = newDeck.pop()!;
    const dCard2 = newDeck.pop()!;

    const initialPlayer = [pCard1, pCard2];
    const initialDealer = [dCard1, dCard2];

    setDeck(newDeck);
    setPlayerHand(initialPlayer);
    setDealerHand(initialDealer);

    const playerVal = calculateHandValue(initialPlayer);
    const dealerVal = calculateHandValue(initialDealer);

    // Natural Blackjack check
    if (playerVal === 21) {
      if (dealerVal === 21) {
        // Push
        setStage('finished');
        setStatusMessage('Both hit Natural 21! Push (bet refunded).');
        onWin(bet, game.id, game.name);
        ArcadeSounds.playLoss();
        setHistory((prev) => [{ id: String(Date.now()), result: 'push', points: 0 }, ...prev.slice(0, 6)]);
      } else {
        // Player Natural Blackjack pays 3:2
        const winAmount = Math.round(bet * 2.5);
        setStage('finished');
        setStatusMessage(`NATURAL BLACKJACK! Won ${winAmount} pts (3:2)!`);
        onWin(winAmount, game.id, game.name);
        ArcadeSounds.playJackpot();
        triggerConfetti({ count: 50 });
        showToast('success', `Natural Blackjack! +${winAmount} pts`, '👑 21 Hit!');
        setHistory((prev) => [{ id: String(Date.now()), result: 'bj', points: winAmount }, ...prev.slice(0, 6)]);
      }
    } else {
      setStage('playing');
      setStatusMessage('Your turn: Hit, Stand, or Double Down');
    }
  };

  const handleHit = () => {
    if (stage !== 'playing' || deck.length === 0) return;
    ArcadeSounds.playCardFlip();

    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const updated = [...playerHand, card];

    setDeck(newDeck);
    setPlayerHand(updated);

    const newVal = calculateHandValue(updated);
    if (newVal > 21) {
      setStage('finished');
      setStatusMessage(`Bust! Hand total ${newVal}. Dealer wins.`);
      ArcadeSounds.playLoss();
      showToast('error', `Bust at ${newVal}! Better luck next hand.`, 'Bust');
      setHistory((prev) => [{ id: String(Date.now()), result: 'loss', points: -bet }, ...prev.slice(0, 6)]);
    } else if (newVal === 21) {
      // Auto-stand on 21
      handleStand(updated, newDeck);
    }
  };

  const handleDoubleDown = () => {
    if (stage !== 'playing' || playerHand.length !== 2) return;
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points to double down.', 'Double Down');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    ArcadeSounds.playChipBet();
    ArcadeSounds.playCardFlip();

    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const updated = [...playerHand, card];

    setDeck(newDeck);
    setPlayerHand(updated);

    const doubleBet = bet * 2;
    const val = calculateHandValue(updated);

    if (val > 21) {
      setStage('finished');
      setStatusMessage(`Double Down Bust (${val})! Dealer wins.`);
      ArcadeSounds.playLoss();
      showToast('error', `Bust on Double Down!`, 'Bust');
      setHistory((prev) => [{ id: String(Date.now()), result: 'loss', points: -doubleBet }, ...prev.slice(0, 6)]);
    } else {
      handleStand(updated, newDeck, doubleBet);
    }
  };

  const handleStand = (curPlayerHand = playerHand, curDeck = deck, activeBet = bet) => {
    setStage('dealerTurn');
    setStatusMessage('Dealer playing hand...');

    const playerTotal = calculateHandValue(curPlayerHand);
    let dealerCards = [...dealerHand];
    let dVal = calculateHandValue(dealerCards);
    const dDeck = [...curDeck];

    const dealerPlayStep = () => {
      if (dVal < 17 && dDeck.length > 0) {
        ArcadeSounds.playCardFlip();
        const c = dDeck.pop()!;
        dealerCards = [...dealerCards, c];
        dVal = calculateHandValue(dealerCards);
        setDealerHand([...dealerCards]);

        setTimeout(dealerPlayStep, 500);
      } else {
        // Dealer finished
        setStage('finished');
        if (dVal > 21) {
          const winPoints = activeBet * 2;
          setStatusMessage(`Dealer busts with ${dVal}! You win!`);
          onWin(winPoints, game.id, game.name);
          ArcadeSounds.playWin();
          triggerConfetti({ count: 30 });
          showToast('success', `Dealer bust (${dVal})! Won ${winPoints} pts`, 'Winner');
          setHistory((prev) => [{ id: String(Date.now()), result: 'win', points: winPoints }, ...prev.slice(0, 6)]);
        } else if (playerTotal > dVal) {
          const winPoints = activeBet * 2;
          setStatusMessage(`You win! (${playerTotal} vs Dealer ${dVal})`);
          onWin(winPoints, game.id, game.name);
          ArcadeSounds.playWin();
          triggerConfetti({ count: 25 });
          showToast('success', `Won hand! (${playerTotal} vs ${dVal}) +${winPoints} pts`, 'Winner');
          setHistory((prev) => [{ id: String(Date.now()), result: 'win', points: winPoints }, ...prev.slice(0, 6)]);
        } else if (playerTotal === dVal) {
          setStatusMessage(`Push! (${playerTotal} vs ${dVal}). Bet returned.`);
          onWin(activeBet, game.id, game.name);
          ArcadeSounds.playLoss();
          showToast('info', `Push! Hand tied at ${playerTotal}.`, 'Push');
          setHistory((prev) => [{ id: String(Date.now()), result: 'push', points: 0 }, ...prev.slice(0, 6)]);
        } else {
          setStatusMessage(`Dealer wins with ${dVal} against your ${playerTotal}.`);
          ArcadeSounds.playLoss();
          showToast('info', `Dealer takes it (${dVal} vs ${playerTotal}).`, 'Dealer Wins');
          setHistory((prev) => [{ id: String(Date.now()), result: 'loss', points: -activeBet }, ...prev.slice(0, 6)]);
        }
      }
    };

    setTimeout(dealerPlayStep, 500);
  };

  const renderCard = (card: PlayingCard, hidden = false) => {
    if (hidden) {
      return (
        <div className="w-14 h-20 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-500/50 flex items-center justify-center shadow-lg">
          <span className="text-xl">🂠</span>
        </div>
      );
    }

    return (
      <div
        className={`w-14 h-20 rounded-xl bg-white border border-slate-300 shadow-md p-1.5 flex flex-col justify-between select-none ${
          card.color === 'red' ? 'text-red-600' : 'text-slate-900'
        }`}
      >
        <div className="text-xs font-black leading-none">{card.label}</div>
        <div className="text-2xl text-center leading-none">{getSuitSymbol(card.suit)}</div>
        <div className="text-xs font-black leading-none self-end">{card.label}</div>
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
      <div className="bg-emerald-950/60 border-2 border-emerald-600/40 rounded-3xl p-4 shadow-2xl space-y-4">
        {/* Dealer Hand Area */}
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300 px-2">
            <span>Dealer Hand</span>
            <span>
              {stage === 'playing' ? '?' : `Value: ${calculateHandValue(dealerHand)}`}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 min-h-[88px] bg-slate-950/40 rounded-2xl p-2 border border-emerald-800/40">
            {dealerHand.length === 0 ? (
              <span className="text-xs text-slate-500">Cards will be dealt here</span>
            ) : (
              dealerHand.map((card, idx) => (
                <div key={idx} className="animate-in fade-in duration-200">
                  {renderCard(card, stage === 'playing' && idx === 1)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center py-1.5 px-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold text-amber-300">
          {statusMessage}
        </div>

        {/* Player Hand Area */}
        <div className="space-y-1 text-center">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300 px-2">
            <span>Your Hand</span>
            <span>
              {playerHand.length > 0 ? `Total: ${calculateHandValue(playerHand)}` : ''}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 min-h-[88px] bg-slate-950/40 rounded-2xl p-2 border border-emerald-800/40">
            {playerHand.length === 0 ? (
              <span className="text-xs text-slate-500">Deal to receive 2 cards</span>
            ) : (
              playerHand.map((card, idx) => (
                <div key={idx} className="animate-in fade-in duration-200">
                  {renderCard(card)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Controls */}
        {stage === 'playing' ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleHit}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-sm active:scale-95 transition-all shadow-md min-h-[48px]"
            >
              HIT
            </button>
            <button
              onClick={() => handleStand()}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white font-black text-sm active:scale-95 transition-all shadow-md min-h-[48px]"
            >
              STAND
            </button>
            <button
              disabled={playerHand.length !== 2 || balance < bet}
              onClick={handleDoubleDown}
              className="py-3 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 disabled:opacity-40 text-white font-black text-sm active:scale-95 transition-all shadow-md min-h-[48px]"
            >
              2X DOUBLE
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <BetSelector
              bet={bet}
              minBet={game.minBet}
              maxBet={game.maxBet}
              balance={balance}
              disabled={stage === 'dealerTurn'}
              onBetChange={setBet}
            />
            <button
              disabled={stage === 'dealerTurn' || balance < bet}
              onClick={handleDeal}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all min-h-[48px] ${
                stage === 'dealerTurn'
                  ? 'bg-slate-800 text-slate-500 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:from-amber-400 shadow-amber-500/25 active:scale-[0.98]'
              }`}
            >
              {stage === 'finished' ? `DEAL AGAIN • ${bet} pts` : `DEAL CARDS • ${bet} pts`}
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Hands
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.result === 'bj'
                    ? 'bg-amber-950/80 border-amber-500/40 text-amber-300 font-black'
                    : h.result === 'win'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold'
                    : h.result === 'push'
                    ? 'bg-slate-800 border-slate-700 text-slate-300'
                    : 'bg-slate-950 border-slate-800 text-rose-400'
                }`}
              >
                <span>{h.result.toUpperCase()}</span>
                <span>{h.points > 0 ? `+${h.points}` : h.points === 0 ? 'Push' : `${h.points}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
