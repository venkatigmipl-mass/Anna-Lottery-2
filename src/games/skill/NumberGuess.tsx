import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, Trophy, RotateCcw, Send, Flame } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoInt } from '../../utils/random';

interface GuessProps {
  game: GameMeta;
  balance: number;
  soundEnabled: boolean;
  onBack: () => void;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  onEarnPoints: (points: number, xp: number, gameId: string, gameName: string, note: string) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
}

interface GuessItem {
  guess: number;
  clue: string;
  isHot: boolean;
}

export const NumberGuess: React.FC<GuessProps> = ({
  game,
  balance,
  soundEnabled,
  onBack,
  onToggleSound,
  onOpenWallet,
  onEarnPoints,
  showToast
}) => {
  const [targetNumber, setTargetNumber] = useState(50);
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState<GuessItem[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const maxAttempts = 7;
  const remaining = maxAttempts - guesses.length;

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    ArcadeSounds.playClick();
    setTargetNumber(getCryptoInt(1, 100));
    setGuesses([]);
    setCurrentGuess('');
    setIsWon(false);
    setIsGameOver(false);
  };

  const handleGuessSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isWon || isGameOver) return;

    const val = parseInt(currentGuess, 10);
    if (isNaN(val) || val < 1 || val > 100) {
      showToast('warning', 'Please enter a valid number between 1 and 100.', 'Invalid Input');
      return;
    }

    ArcadeSounds.playTick();
    const diff = Math.abs(val - targetNumber);
    let clue = '';
    const isHot = diff <= 5;

    if (val === targetNumber) {
      // Won!
      setIsWon(true);
      const usedGuesses = guesses.length + 1;
      let pts = 150;
      let xp = 30;
      let tier = 'Solved!';

      if (usedGuesses <= 3) {
        pts = 400;
        xp = 100;
        tier = 'GENIUS DEDUCTION!';
      } else if (usedGuesses <= 5) {
        pts = 250;
        xp = 60;
        tier = 'GREAT GUESSING!';
      }

      setGuesses([{ guess: val, clue: '🎉 EXACT MATCH!', isHot: true }, ...guesses]);
      setCurrentGuess('');

      ArcadeSounds.playJackpot();
      triggerConfetti({ count: 50 });
      onEarnPoints(pts, xp, game.id, game.name, `Number Guess solved in ${usedGuesses} attempts!`);
      showToast('success', `${tier} Number was ${targetNumber}! +${pts} pts & +${xp} XP!`, 'Puzzle Solved');
      return;
    } else if (val < targetNumber) {
      clue = isHot ? '🔥 Too Low (Boiling Hot!)' : '▲ Too Low';
    } else {
      clue = isHot ? '🔥 Too High (Boiling Hot!)' : '▼ Too High';
    }

    const nextGuesses = [{ guess: val, clue, isHot }, ...guesses];
    setGuesses(nextGuesses);
    setCurrentGuess('');

    if (nextGuesses.length >= maxAttempts) {
      // Game Over
      setIsGameOver(true);
      ArcadeSounds.playLoss();
      showToast('info', `Out of guesses! The secret number was ${targetNumber}.`, 'Game Over');
    }
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
        {/* Clue Header */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Range: 1 to 100</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Remaining: <span className="text-amber-400 font-mono">{remaining}</span></span>
          </div>

          <button
            onClick={startNewGame}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>

        {/* Input area */}
        {!isWon && !isGameOver ? (
          <form onSubmit={handleGuessSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value)}
                placeholder="Enter guess (1-100)..."
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-white font-mono text-lg text-center outline-none min-h-[48px]"
              />
              <button
                type="submit"
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-md min-h-[48px]"
              >
                <Send className="w-4 h-4" />
                GUESS
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
            <div className="text-sm font-black text-white">
              {isWon ? `🎉 Congratulations! Secret number was ${targetNumber}!` : `Game Over! The number was ${targetNumber}.`}
            </div>
            <button
              onClick={startNewGame}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider active:scale-95 shadow-md"
            >
              PLAY NEW NUMBER (FREE)
            </button>
          </div>
        )}

        {/* Guess Clues List */}
        <div className="space-y-2 text-left">
          <div className="text-xs font-bold text-slate-400">Guess Attempts Log</div>
          {guesses.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/40 text-center text-xs text-slate-600">
              Submit your first guess above
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {guesses.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                    item.clue.includes('EXACT')
                      ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-black'
                      : item.isHot
                      ? 'bg-orange-950/60 border-orange-500/50 text-orange-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-mono font-bold">Guess #{guesses.length - idx}: {item.guess}</span>
                  <span>{item.clue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </GameWrapper>
  );
};
