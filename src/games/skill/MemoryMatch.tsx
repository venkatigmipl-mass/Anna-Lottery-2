import React, { useState, useEffect } from 'react';
import { Brain, Trophy, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { cryptoShuffle } from '../../utils/random';

interface MemoryProps {
  game: GameMeta;
  balance: number;
  soundEnabled: boolean;
  onBack: () => void;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  onEarnPoints: (points: number, xp: number, gameId: string, gameName: string, note: string) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
}

const EMOJIS = ['🎮', '🕹️', '👾', '🚀', '⚡', '💎', '👑', '⭐'];

interface CardItem {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryMatch: React.FC<MemoryProps> = ({
  game,
  balance,
  soundEnabled,
  onBack,
  onToggleSound,
  onOpenWallet,
  onEarnPoints,
  showToast
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(null);

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  const startNewGame = () => {
    ArcadeSounds.playCardFlip();
    const pairs = [...EMOJIS, ...EMOJIS];
    const shuffled = cryptoShuffle(pairs);

    const newCards: CardItem[] = shuffled.map((emoji, idx) => ({
      id: idx,
      emoji,
      isFlipped: false,
      isMatched: false
    }));

    setCards(newCards);
    setFlippedIds([]);
    setMoves(0);
    setSeconds(0);
    setIsCompleted(false);
  };

  const handleCardClick = (id: number) => {
    if (flippedIds.length >= 2 || isCompleted) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    ArcadeSounds.playCardFlip();
    const updated = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(updated);

    const nextFlipped = [...flippedIds, id];
    setFlippedIds(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const c1 = cards.find((c) => c.id === firstId);
      const c2 = cards.find((c) => c.id === secondId);

      if (c1 && c2 && c1.emoji === c2.emoji) {
        // Matched!
        ArcadeSounds.playGem();
        setTimeout(() => {
          const matchedList = updated.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          );
          setCards(matchedList);
          setFlippedIds([]);

          // Check if all matched
          if (matchedList.every((c) => c.isMatched)) {
            finishGame(moves + 1);
          }
        }, 400);
      } else {
        // Not matching - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c))
          );
          setFlippedIds([]);
        }, 800);
      }
    }
  };

  const finishGame = (finalMoves: number) => {
    setIsCompleted(true);
    let pts = 100;
    let xp = 25;
    let tier = 'Good Job';

    if (finalMoves < 18) {
      pts = 300;
      xp = 80;
      tier = 'Master Mind';
    } else if (finalMoves < 26) {
      pts = 200;
      xp = 50;
      tier = 'Great Memory';
    }

    if (!bestMoves || finalMoves < bestMoves) {
      setBestMoves(finalMoves);
    }

    ArcadeSounds.playJackpot();
    triggerConfetti({ count: 50 });
    onEarnPoints(pts, xp, game.id, game.name, `Memory Match solved in ${finalMoves} moves`);
    showToast('success', `${tier}! Solved in ${finalMoves} moves. +${pts} pts & +${xp} XP!`, 'Brain Power');
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
        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Moves: <span className="text-white font-bold">{moves}</span></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Time: <span className="text-white font-bold">{seconds}s</span></span>
          </div>

          <button
            onClick={startNewGame}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>

        {/* 4x4 Memory Grid */}
        <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          {cards.map((card) => {
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <button
                key={card.id}
                type="button"
                disabled={isRevealed || isCompleted}
                onClick={() => handleCardClick(card.id)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-3xl font-bold transition-all min-h-[52px] select-none ${
                  card.isMatched
                    ? 'bg-emerald-950/70 border-2 border-emerald-500 text-white shadow-emerald-500/20 shadow-md'
                    : card.isFlipped
                    ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-amber-400 text-white shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-95 text-slate-500'
                }`}
              >
                {isRevealed ? (
                  card.emoji
                ) : (
                  <span className="text-sm font-black text-slate-500">?</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Completion Banner */}
        {isCompleted ? (
          <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-2">
            <div className="text-sm font-black text-emerald-300 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Puzzle Completed in {moves} moves ({seconds}s)!
            </div>
            <button
              onClick={startNewGame}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider active:scale-95 shadow-md"
            >
              PLAY AGAIN
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 leading-relaxed">
            Free Arcade Game: Flip and match pairs. Fewer moves earn larger virtual point & XP bonuses!
          </div>
        )}
      </div>
    </GameWrapper>
  );
};
