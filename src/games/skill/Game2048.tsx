import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoInt } from '../../utils/random';

interface Game2048Props {
  game: GameMeta;
  balance: number;
  soundEnabled: boolean;
  onBack: () => void;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  onEarnPoints: (points: number, xp: number, gameId: string, gameName: string, note: string) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
}

type Board = number[][];

export const Game2048: React.FC<Game2048Props> = ({
  game,
  balance,
  soundEnabled,
  onBack,
  onToggleSound,
  onOpenWallet,
  onEarnPoints,
  showToast
}) => {
  const [board, setBoard] = useState<Board>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon2048, setHasWon2048] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const addRandomTile = (currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const chosen = emptyCells[getCryptoInt(0, emptyCells.length - 1)];
    const val = Math.random() < 0.9 ? 2 : 4;
    const copy = currentBoard.map((row) => [...row]);
    copy[chosen.r][chosen.c] = val;
    return copy;
  };

  const initGame = () => {
    let b: Board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setIsGameOver(false);
    setHasWon2048(false);
  };

  const slideLine = (line: number[]): { newLine: number[]; addedScore: number } => {
    let nonZero = line.filter((v) => v !== 0);
    let added = 0;
    for (let i = 0; i < nonZero.length - 1; i++) {
      if (nonZero[i] === nonZero[i + 1]) {
        nonZero[i] *= 2;
        added += nonZero[i];
        nonZero[i + 1] = 0;
        i++;
      }
    }
    nonZero = nonZero.filter((v) => v !== 0);
    while (nonZero.length < 4) {
      nonZero.push(0);
    }
    return { newLine: nonZero, addedScore: added };
  };

  const move = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver) return;
    let moved = false;
    let scoreAdd = 0;
    const newBoard = board.map((r) => [...r]);

    if (direction === 'left') {
      for (let r = 0; r < 4; r++) {
        const { newLine, addedScore } = slideLine(newBoard[r]);
        if (newLine.some((v, idx) => v !== newBoard[r][idx])) moved = true;
        newBoard[r] = newLine;
        scoreAdd += addedScore;
      }
    } else if (direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const rev = [...newBoard[r]].reverse();
        const { newLine, addedScore } = slideLine(rev);
        const normal = newLine.reverse();
        if (normal.some((v, idx) => v !== newBoard[r][idx])) moved = true;
        newBoard[r] = normal;
        scoreAdd += addedScore;
      }
    } else if (direction === 'up') {
      for (let c = 0; c < 4; c++) {
        const col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        const { newLine, addedScore } = slideLine(col);
        for (let r = 0; r < 4; r++) {
          if (newBoard[r][c] !== newLine[r]) moved = true;
          newBoard[r][c] = newLine[r];
        }
        scoreAdd += addedScore;
      }
    } else if (direction === 'down') {
      for (let c = 0; c < 4; c++) {
        const col = [newBoard[3][c], newBoard[2][c], newBoard[1][c], newBoard[0][c]];
        const { newLine, addedScore } = slideLine(col);
        const normal = newLine.reverse();
        for (let r = 0; r < 4; r++) {
          if (newBoard[r][c] !== normal[r]) moved = true;
          newBoard[r][c] = normal[r];
        }
        scoreAdd += addedScore;
      }
    }

    if (moved) {
      ArcadeSounds.playTick();
      const updatedBoard = addRandomTile(newBoard);
      const newScore = score + scoreAdd;
      setBoard(updatedBoard);
      setScore(newScore);

      if (newScore > bestScore) setBestScore(newScore);

      // Check 2048 tile reached
      const has2048 = updatedBoard.some((row) => row.some((v) => v >= 2048));
      if (has2048 && !hasWon2048) {
        setHasWon2048(true);
        ArcadeSounds.playJackpot();
        triggerConfetti({ count: 60 });
        onEarnPoints(1000, 250, game.id, game.name, 'Reached the 2048 Tile in Arcade 2048!');
        showToast('success', 'LEGENDARY! You reached the 2048 Tile! +1,000 pts & +250 XP!', '👑 2048 Achieved');
      }

      // Check game over
      if (checkGameOver(updatedBoard)) {
        setIsGameOver(true);
        ArcadeSounds.playLoss();
        // Convert 10% of game score into virtual points
        const pointsEarned = Math.max(50, Math.floor(newScore * 0.1));
        onEarnPoints(pointsEarned, 30, game.id, game.name, `2048 Score: ${newScore}`);
        showToast('info', `Game Over! Score: ${newScore}. Earned +${pointsEarned} pts!`, '2048 Completed');
      }
    }
  };

  const checkGameOver = (b: Board): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
      }
    }
    return true;
  };

  const getTileBg = (val: number): string => {
    switch (val) {
      case 2: return 'bg-slate-800 text-slate-100';
      case 4: return 'bg-amber-900/60 text-amber-200 border-amber-800';
      case 8: return 'bg-amber-700 text-white';
      case 16: return 'bg-orange-600 text-white';
      case 32: return 'bg-rose-600 text-white';
      case 64: return 'bg-red-600 text-white shadow-md';
      case 128: return 'bg-yellow-500 text-slate-950 font-black shadow-lg';
      case 256: return 'bg-yellow-400 text-slate-950 font-black shadow-lg';
      case 512: return 'bg-emerald-500 text-slate-950 font-black shadow-lg';
      case 1024: return 'bg-cyan-400 text-slate-950 font-black shadow-xl ring-2 ring-cyan-200';
      case 2048: return 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-2xl ring-4 ring-amber-400';
      default: return 'bg-slate-950/40 text-transparent';
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
        {/* Score Header */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Game Score</div>
            <div className="text-xl font-black text-amber-400 font-mono">{score}</div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Best Score</div>
              <div className="text-xl font-black text-white font-mono">{bestScore}</div>
            </div>
            <button
              onClick={initGame}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 active:scale-95"
              title="Reset Board"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4x4 Tiles Board */}
        <div className="grid grid-cols-4 gap-2 p-2.5 bg-slate-950 rounded-2xl border border-slate-800 max-w-xs mx-auto">
          {board.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`aspect-square rounded-xl flex items-center justify-center font-bold text-lg select-none transition-all ${getTileBg(
                  val
                )}`}
              >
                {val > 0 ? val : ''}
              </div>
            ))
          )}
        </div>

        {/* Directional Arrow Controls for Mobile Touch */}
        <div className="max-w-[200px] mx-auto grid grid-cols-3 gap-1.5 pt-1">
          <div />
          <button
            onClick={() => move('up')}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center active:scale-90 min-h-[44px]"
            aria-label="Up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onClick={() => move('left')}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center active:scale-90 min-h-[44px]"
            aria-label="Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => move('down')}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center active:scale-90 min-h-[44px]"
            aria-label="Down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => move('right')}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center active:scale-90 min-h-[44px]"
            aria-label="Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-400">
          Slide tiles to merge matching numbers. Reaching 512, 1024, or 2048 awards huge virtual points & XP!
        </div>
      </div>
    </GameWrapper>
  );
};
