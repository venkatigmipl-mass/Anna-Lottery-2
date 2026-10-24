import React, { useState } from 'react';
import { Gamepad2, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { getCryptoInt, cryptoChoice } from '../../utils/random';

interface TicTacToeProps {
  game: GameMeta;
  balance: number;
  soundEnabled: boolean;
  onBack: () => void;
  onToggleSound: () => void;
  onOpenWallet: () => void;
  onEarnPoints: (points: number, xp: number, gameId: string, gameName: string, note: string) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => void;
}

type Player = 'X' | 'O' | null;
type Difficulty = 'easy' | 'medium' | 'hard';

export const TicTacToe: React.FC<TicTacToeProps> = ({
  game,
  balance,
  soundEnabled,
  onBack,
  onToggleSound,
  onOpenWallet,
  onEarnPoints,
  showToast
}) => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [streak, setStreak] = useState(0);

  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (currentBoard: Player[]): { winner: 'X' | 'O' | 'draw' | null; line: number[] | null } => {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a] as 'X' | 'O', line: combo };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: 'draw', line: null };
    }
    return { winner: null, line: null };
  };

  const handleCellClick = (index: number) => {
    if (!isUserTurn || board[index] !== null || winner !== null) return;

    ArcadeSounds.playTick();
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      handleGameOver(result.winner, result.line);
    } else {
      setIsUserTurn(false);
      // AI Move delay
      setTimeout(() => {
        executeBotMove(newBoard);
      }, 450);
    }
  };

  const executeBotMove = (currentBoard: Player[]) => {
    const emptyIndices = currentBoard.map((c, i) => (c === null ? i : null)).filter((v): v is number => v !== null);
    if (emptyIndices.length === 0) return;

    let moveIndex: number;

    if (difficulty === 'easy') {
      moveIndex = cryptoChoice(emptyIndices);
    } else if (difficulty === 'medium') {
      // 50% tactical, 50% random
      const tacticalMove = findWinningOrBlockingMove(currentBoard);
      moveIndex = tacticalMove !== null && Math.random() < 0.6 ? tacticalMove : cryptoChoice(emptyIndices);
    } else {
      // Hard: tactical win/block, or center, or corners
      const tacticalMove = findWinningOrBlockingMove(currentBoard);
      if (tacticalMove !== null) {
        moveIndex = tacticalMove;
      } else if (currentBoard[4] === null) {
        moveIndex = 4;
      } else {
        const corners = [0, 2, 6, 8].filter((i) => currentBoard[i] === null);
        moveIndex = corners.length > 0 ? cryptoChoice(corners) : cryptoChoice(emptyIndices);
      }
    }

    ArcadeSounds.playCardFlip();
    const updated = [...currentBoard];
    updated[moveIndex] = 'O';
    setBoard(updated);

    const res = checkWinner(updated);
    if (res.winner) {
      handleGameOver(res.winner, res.line);
    } else {
      setIsUserTurn(true);
    }
  };

  const findWinningOrBlockingMove = (b: Player[]): number | null => {
    // 1. Can Bot ('O') win?
    for (const [a, bIdx, c] of WINNING_COMBOS) {
      const line = [b[a], b[bIdx], b[c]];
      if (line.filter((x) => x === 'O').length === 2 && line.includes(null)) {
        if (b[a] === null) return a;
        if (b[bIdx] === null) return bIdx;
        if (b[c] === null) return c;
      }
    }
    // 2. Can User ('X') win? Block it!
    for (const [a, bIdx, c] of WINNING_COMBOS) {
      const line = [b[a], b[bIdx], b[c]];
      if (line.filter((x) => x === 'X').length === 2 && line.includes(null)) {
        if (b[a] === null) return a;
        if (b[bIdx] === null) return bIdx;
        if (b[c] === null) return c;
      }
    }
    return null;
  };

  const handleGameOver = (winResult: 'X' | 'O' | 'draw', line: number[] | null) => {
    setWinner(winResult);
    setWinLine(line);

    if (winResult === 'X') {
      const newStreak = streak + 1;
      setStreak(newStreak);
      let pts = difficulty === 'hard' ? 250 : difficulty === 'medium' ? 150 : 80;
      let xp = difficulty === 'hard' ? 75 : difficulty === 'medium' ? 40 : 20;

      ArcadeSounds.playWin();
      triggerConfetti({ count: 40 });
      onEarnPoints(pts, xp, game.id, game.name, `Won Tic-Tac-Toe on ${difficulty.toUpperCase()} mode!`);
      showToast('success', `VICTORY! Defeated Arcade Bot! +${pts} pts & +${xp} XP!`, 'Round Won');
    } else if (winResult === 'draw') {
      ArcadeSounds.playLoss();
      onEarnPoints(30, 10, game.id, game.name, 'Tic-Tac-Toe Draw with Bot');
      showToast('info', 'Game drawn! Earned +30 pts participation reward.', 'Draw');
    } else {
      ArcadeSounds.playLoss();
      setStreak(0);
      showToast('info', 'Bot won this round. Reset and try again!', 'Bot Victory');
    }
  };

  const resetGame = () => {
    ArcadeSounds.playClick();
    setBoard(Array(9).fill(null));
    setIsUserTurn(true);
    setWinner(null);
    setWinLine(null);
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
        {/* Difficulty Bar */}
        <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold">AI Difficulty:</span>
          <div className="flex gap-1">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDifficulty(d);
                  resetGame();
                }}
                className={`px-2.5 py-1 rounded-xl font-bold uppercase text-[10px] transition-all ${
                  difficulty === d
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="text-xs font-bold text-slate-300 flex items-center justify-center gap-2">
          {winner === 'X' ? (
            <span className="text-emerald-400">🎉 You Won the Round!</span>
          ) : winner === 'O' ? (
            <span className="text-rose-400">🤖 Bot Won the Round!</span>
          ) : winner === 'draw' ? (
            <span className="text-slate-400">Tied Game (Draw)</span>
          ) : isUserTurn ? (
            <span className="text-amber-400">Your Turn (You are X)</span>
          ) : (
            <span className="text-slate-400">Bot Thinking (O)...</span>
          )}
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-[260px] mx-auto">
          {board.map((cell, idx) => {
            const isHighlight = winLine && winLine.includes(idx);

            return (
              <button
                key={idx}
                type="button"
                disabled={cell !== null || !isUserTurn || winner !== null}
                onClick={() => handleCellClick(idx)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-4xl font-black transition-all select-none min-h-[60px] ${
                  isHighlight
                    ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-lg'
                    : cell === 'X'
                    ? 'bg-slate-800/80 border border-slate-700 text-cyan-400'
                    : cell === 'O'
                    ? 'bg-slate-800/80 border border-slate-700 text-rose-400'
                    : isUserTurn && winner === null
                    ? 'bg-slate-900 border border-slate-800 hover:bg-slate-800/60 active:scale-95 cursor-pointer'
                    : 'bg-slate-900/50 border border-slate-800'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetGame}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          PLAY AGAIN (FREE)
        </button>

        <div className="text-[11px] text-slate-400">
          Zero betting • Defeat the bot on Hard mode for maximum points and level XP!
        </div>
      </div>
    </GameWrapper>
  );
};
