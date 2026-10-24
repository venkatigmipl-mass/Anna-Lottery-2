import React, { useState } from 'react';
import { Flame, Eye, EyeOff, ShieldCheck, Trophy, History } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { PlayingCard, createDeck, getSuitSymbol, getCryptoFloat } from '../../utils/random';

interface TeenPattiProps {
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

interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  cards: PlayingCard[];
  isFolded: boolean;
  isSeen: boolean;
  isBot: boolean;
  handRankName?: string;
  handScore?: number;
}

export const TeenPatti: React.FC<TeenPattiProps> = ({
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
  const [bootBet, setBootBet] = useState(25);
  const [pot, setPot] = useState(0);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [statusMessage, setStatusMessage] = useState('Select boot bet and tap Deal Table');
  const [history, setHistory] = useState<{ id: string; winner: string; pot: number; won: boolean }[]>([]);

  // Evaluate 3-card hand strength (higher score = better hand)
  const evaluateHand = (cards: PlayingCard[]): { name: string; score: number } => {
    if (cards.length !== 3) return { name: 'High Card', score: 0 };

    const ranks = cards.map((c) => (c.rank === 1 ? 14 : c.rank)).sort((a, b) => b - a);
    const suits = cards.map((c) => c.suit);

    const isFlush = suits[0] === suits[1] && suits[1] === suits[2];

    // Check sequence (A-K-Q or regular, or A-2-3)
    let isStraight = false;
    if (ranks[0] - ranks[1] === 1 && ranks[1] - ranks[2] === 1) {
      isStraight = true;
    } else if (ranks[0] === 14 && ranks[1] === 3 && ranks[2] === 2) {
      isStraight = true; // A-2-3
    }

    // Trio (3 of a kind)
    if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
      return { name: `Trail / Trio of ${cards[0].label}s`, score: 600000 + ranks[0] };
    }
    // Pure Sequence (Straight Flush)
    if (isStraight && isFlush) {
      return { name: 'Pure Sequence (Straight Flush)', score: 500000 + ranks[0] };
    }
    // Sequence (Straight)
    if (isStraight) {
      return { name: 'Sequence (Straight)', score: 400000 + ranks[0] };
    }
    // Color (Flush)
    if (isFlush) {
      return { name: 'Color (Flush)', score: 300000 + ranks[0] * 100 + ranks[1] * 10 + ranks[2] };
    }
    // Pair
    if (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2]) {
      const pairRank = ranks[0] === ranks[1] ? ranks[0] : ranks[2];
      return { name: 'Pair', score: 200000 + pairRank * 100 };
    }
    // High Card
    return { name: `High Card (${cards[0].label})`, score: 100000 + ranks[0] * 100 + ranks[1] * 10 + ranks[2] };
  };

  const startNewRound = () => {
    if (balance < bootBet) {
      showToast('error', 'Insufficient virtual points for boot bet.', 'Low Balance');
      return;
    }

    const deducted = onBet(bootBet, game.id, game.name);
    if (!deducted) return;

    ArcadeSounds.playCardFlip();
    const deck = createDeck();

    const bot1Cards = [deck.pop()!, deck.pop()!, deck.pop()!];
    const bot2Cards = [deck.pop()!, deck.pop()!, deck.pop()!];
    const bot3Cards = [deck.pop()!, deck.pop()!, deck.pop()!];
    const userCards = [deck.pop()!, deck.pop()!, deck.pop()!];

    const initialPlayers: PlayerState[] = [
      { id: 'user', name: 'You', avatar: '🎮', cards: userCards, isFolded: false, isSeen: false, isBot: false },
      { id: 'bot1', name: 'Rahul', avatar: '🤖', cards: bot1Cards, isFolded: false, isSeen: false, isBot: true },
      { id: 'bot2', name: 'Priya', avatar: '🦊', cards: bot2Cards, isFolded: false, isSeen: false, isBot: true },
      { id: 'bot3', name: 'Vikram', avatar: '⚡', cards: bot3Cards, isFolded: false, isSeen: false, isBot: true }
    ];

    setPlayers(initialPlayers);
    // Boot bet from all 4 players (user + 3 bots)
    const initialPot = bootBet * 4;
    setPot(initialPot);
    setIsRoundActive(true);
    setStatusMessage('Round started! Playing Blind. See cards or Chaal.');
    ArcadeSounds.playChipBet();
  };

  const toggleSeeCards = () => {
    if (!isRoundActive) return;
    ArcadeSounds.playCardFlip();
    setPlayers((prev) =>
      prev.map((p) => (p.id === 'user' ? { ...p, isSeen: !p.isSeen } : p))
    );
  };

  const handleChaal = () => {
    if (!isRoundActive) return;
    const user = players.find((p) => p.id === 'user');
    if (!user || user.isFolded) return;

    const chaalAmount = user.isSeen ? bootBet * 2 : bootBet;

    if (balance < chaalAmount) {
      showToast('error', 'Insufficient virtual points for Chaal.', 'Low Balance');
      return;
    }

    const deducted = onBet(chaalAmount, game.id, game.name);
    if (!deducted) return;

    ArcadeSounds.playChipBet();

    // Bots also respond (some match chaal, some fold if weak)
    let extraPot = chaalAmount;
    const updatedPlayers = players.map((p) => {
      if (p.isBot && !p.isFolded) {
        const evalHand = evaluateHand(p.cards);
        // Bot folds if high card under Jack and random check
        if (evalHand.score < 101100 && getCryptoFloat() < 0.35) {
          return { ...p, isFolded: true };
        }
        extraPot += chaalAmount;
        return p;
      }
      return p;
    });

    setPot((prev) => prev + extraPot);
    setPlayers(updatedPlayers);
    setStatusMessage(`Chaal +${chaalAmount} pts added to pot.`);

    // Check if only user remains
    const activeBots = updatedPlayers.filter((p) => p.isBot && !p.isFolded);
    if (activeBots.length === 0) {
      handleUserWinByFold(pot + extraPot);
    }
  };

  const handleUserWinByFold = (finalPot: number) => {
    setIsRoundActive(false);
    onWin(finalPot, game.id, game.name);
    ArcadeSounds.playWin();
    triggerConfetti({ count: 30 });
    setStatusMessage(`All bots folded! You won the pot of ${finalPot} pts!`);
    showToast('success', `All bots folded! Won ${finalPot} pts`, 'Pot Won!');
    setHistory((prev) => [{ id: String(Date.now()), winner: 'You', pot: finalPot, won: true }, ...prev.slice(0, 6)]);
  };

  const handlePack = () => {
    if (!isRoundActive) return;
    ArcadeSounds.playLoss();
    setIsRoundActive(false);
    setPlayers((prev) => prev.map((p) => (p.id === 'user' ? { ...p, isFolded: true } : p)));
    setStatusMessage('You packed your cards. Pot forfeited.');
    showToast('info', 'Packed hand.', 'Folded');
    setHistory((prev) => [{ id: String(Date.now()), winner: 'Bots', pot, won: false }, ...prev.slice(0, 6)]);
  };

  const handleShowdown = () => {
    if (!isRoundActive) return;
    ArcadeSounds.playCardFlip();
    setIsRoundActive(false);

    // Reveal all cards and rank
    const evaluated = players.map((p) => {
      const h = evaluateHand(p.cards);
      return {
        ...p,
        isSeen: true,
        handRankName: h.name,
        handScore: p.isFolded ? -1 : h.score
      };
    });

    setPlayers(evaluated);

    // Determine winner
    let winner = evaluated[0];
    for (const p of evaluated) {
      if ((p.handScore || 0) > (winner.handScore || 0)) {
        winner = p;
      }
    }

    if (winner.id === 'user') {
      onWin(pot, game.id, game.name);
      ArcadeSounds.playJackpot();
      triggerConfetti({ count: 50 });
      setStatusMessage(`SHOWDOWN WINNER! You win the pot of ${pot} pts with ${winner.handRankName}!`);
      showToast('success', `Won ${pot} pts with ${winner.handRankName}!`, '👑 Table Champion');
      setHistory((prev) => [{ id: String(Date.now()), winner: 'You', pot, won: true }, ...prev.slice(0, 6)]);
    } else {
      ArcadeSounds.playLoss();
      setStatusMessage(`${winner.name} won the pot with ${winner.handRankName}.`);
      showToast('info', `${winner.name} won with ${winner.handRankName}.`, 'Showdown Loss');
      setHistory((prev) => [{ id: String(Date.now()), winner: winner.name, pot, won: false }, ...prev.slice(0, 6)]);
    }
  };

  const renderCard = (card: PlayingCard, hidden: boolean) => {
    if (hidden) {
      return (
        <div className="w-10 h-14 rounded-lg bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-xs shadow-md">
          🂠
        </div>
      );
    }
    return (
      <div
        className={`w-10 h-14 rounded-lg bg-white border border-slate-300 shadow p-1 flex flex-col justify-between ${
          card.color === 'red' ? 'text-red-600' : 'text-slate-900'
        }`}
      >
        <span className="text-[10px] font-black leading-none">{card.label}</span>
        <span className="text-sm text-center leading-none">{getSuitSymbol(card.suit)}</span>
        <span className="text-[10px] font-black leading-none self-end">{card.label}</span>
      </div>
    );
  };

  const user = players.find((p) => p.id === 'user');

  return (
    <GameWrapper
      game={game}
      balance={balance}
      soundEnabled={soundEnabled}
      onBack={onBack}
      onToggleSound={onToggleSound}
      onOpenWallet={onOpenWallet}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3">
        {/* Pot Counter Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            Table Pot:
          </div>
          <div className="text-base font-black text-amber-400">
            {pot.toLocaleString()} pts
          </div>
        </div>

        {/* 3 AI Bots Row */}
        <div className="grid grid-cols-3 gap-2">
          {players
            .filter((p) => p.isBot)
            .map((bot) => (
              <div
                key={bot.id}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  bot.isFolded
                    ? 'bg-slate-950/40 border-slate-800 opacity-40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-300">
                  <span>{bot.avatar}</span>
                  <span>{bot.name}</span>
                </div>
                <div className="flex justify-center gap-0.5 my-1.5">
                  {bot.cards.map((c, i) => (
                    <div key={i}>{renderCard(c, !bot.isSeen)}</div>
                  ))}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 truncate">
                  {bot.isFolded ? 'Packed' : bot.handRankName || 'In Hand'}
                </div>
              </div>
            ))}
        </div>

        {/* Status message */}
        <div className="py-1.5 px-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold text-amber-300 text-center">
          {statusMessage}
        </div>

        {/* User Hand Section */}
        {user && (
          <div className="p-3 bg-slate-950/90 border border-amber-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Your Hand:</span>
              <button
                disabled={!isRoundActive}
                onClick={toggleSeeCards}
                className="flex items-center gap-1 text-xs text-amber-400 font-bold hover:underline"
              >
                {user.isSeen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {user.isSeen ? 'Hide Cards' : 'See Cards (Seen)'}
              </button>
            </div>

            <div className="flex justify-center gap-2 py-1">
              {user.cards.map((c, i) => (
                <div key={i}>{renderCard(c, !user.isSeen)}</div>
              ))}
            </div>

            <div className="text-center text-xs font-bold text-emerald-400">
              {user.isSeen ? evaluateHand(user.cards).name : 'Cards Hidden (Playing Blind - 1x Bet)'}
            </div>
          </div>
        )}

        {/* Play Action Buttons */}
        {isRoundActive ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePack}
              className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-black text-xs active:scale-95 transition-all min-h-[48px]"
            >
              PACK (FOLD)
            </button>
            <button
              onClick={handleChaal}
              className="py-3 px-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs active:scale-95 transition-all shadow-md min-h-[48px]"
            >
              CHAAL (+{user?.isSeen ? bootBet * 2 : bootBet})
            </button>
            <button
              onClick={handleShowdown}
              className="py-3 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs active:scale-95 transition-all shadow-md min-h-[48px]"
            >
              SHOWDOWN
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <BetSelector
              bet={bootBet}
              minBet={game.minBet}
              maxBet={game.maxBet}
              balance={balance}
              onBetChange={setBootBet}
            />
            <button
              disabled={balance < bootBet}
              onClick={startNewRound}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-[0.98] min-h-[48px]"
            >
              DEAL TABLE • BOOT {bootBet} PTS
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Teen Patti Rounds
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.won ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span>Winner: {h.winner}</span>
                <span className="font-bold">{h.won ? `+${h.pot}` : `Pot ${h.pot}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
