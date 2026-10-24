import React, { useState } from 'react';
import { Bomb, Diamond, History, Trophy, Sparkles } from 'lucide-react';
import { GameMeta } from '../../types/arcade';
import { GameWrapper } from '../../components/GameWrapper';
import { BetSelector } from '../../components/BetSelector';
import { ArcadeSounds } from '../../services/soundEffects';
import { triggerConfetti } from '../../utils/confetti';
import { cryptoShuffle } from '../../utils/random';

interface MinesProps {
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

interface Tile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
}

export const MinesGame: React.FC<MinesProps> = ({
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
  const [mineCount, setMineCount] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>(
    Array.from({ length: 25 }, (_, i) => ({ id: i, isMine: false, isRevealed: false }))
  );
  const [revealedSafeCount, setRevealedSafeCount] = useState(0);
  const [history, setHistory] = useState<{ id: string; diamonds: number; win: number; bet: number; won: boolean }[]>([]);

  // Calculate current fair multiplier
  const calculateMultiplier = (revealed: number, mines: number): number => {
    if (revealed === 0) return 1.0;
    let prob = 1.0;
    for (let i = 0; i < revealed; i++) {
      prob *= (25 - mines - i) / (25 - i);
    }
    // 0.98 RTP factor
    const fairMult = 0.98 / prob;
    return Math.floor(fairMult * 100) / 100;
  };

  const currentMultiplier = calculateMultiplier(revealedSafeCount, mineCount);
  const currentCashout = Math.round(bet * currentMultiplier);

  const startRound = () => {
    if (balance < bet) {
      showToast('error', 'Insufficient virtual points.', 'Low Balance');
      return;
    }

    const deducted = onBet(bet, game.id, game.name);
    if (!deducted) return;

    ArcadeSounds.playCardFlip();

    // Create 25 tiles with mineCount mines, then shuffle cryptographically
    const initialPool: boolean[] = [
      ...Array(mineCount).fill(true),
      ...Array(25 - mineCount).fill(false)
    ];
    const shuffled = cryptoShuffle(initialPool);

    const newTiles: Tile[] = shuffled.map((isMine, id) => ({
      id,
      isMine,
      isRevealed: false
    }));

    setTiles(newTiles);
    setRevealedSafeCount(0);
    setIsPlaying(true);
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying) return;
    const tile = tiles[index];
    if (tile.isRevealed) return;

    if (tile.isMine) {
      // Detonation!
      ArcadeSounds.playBoom();
      setIsPlaying(false);

      // Reveal all mines
      const revealedAll = tiles.map((t) => ({ ...t, isRevealed: true }));
      setTiles(revealedAll);

      showToast('error', 'BOOM! You uncovered a mine!', 'Detonated');
      setHistory((prev) => [
        { id: String(Date.now()), diamonds: revealedSafeCount, win: 0, bet, won: false },
        ...prev.slice(0, 6)
      ]);
    } else {
      // Safe diamond
      ArcadeSounds.playGem();
      const updated = tiles.map((t, idx) => (idx === index ? { ...t, isRevealed: true } : t));
      const nextCount = revealedSafeCount + 1;
      setTiles(updated);
      setRevealedSafeCount(nextCount);

      // Check if all safe diamonds uncovered
      if (nextCount === 25 - mineCount) {
        // Auto-cashout jackpot!
        const maxMult = calculateMultiplier(nextCount, mineCount);
        const winAmount = Math.round(bet * maxMult);
        setIsPlaying(false);
        onWin(winAmount, game.id, game.name);
        ArcadeSounds.playJackpot();
        triggerConfetti({ count: 60 });
        showToast('success', `PERFECT CLEAR! Won ${winAmount.toLocaleString()} pts!`, '⭐ Grid Cleared');
        setHistory((prev) => [
          { id: String(Date.now()), diamonds: nextCount, win: winAmount, bet, won: true },
          ...prev.slice(0, 6)
        ]);
      }
    }
  };

  const handleCashout = () => {
    if (!isPlaying || revealedSafeCount === 0) return;

    setIsPlaying(false);
    onWin(currentCashout, game.id, game.name);

    if (currentMultiplier >= 3) {
      ArcadeSounds.playJackpot();
      triggerConfetti({ count: 40 });
    } else {
      ArcadeSounds.playWin();
      triggerConfetti({ count: 20 });
    }

    // Reveal rest of grid
    setTiles((prev) => prev.map((t) => ({ ...t, isRevealed: true })));

    showToast('success', `Cashed out ${currentCashout} pts (${currentMultiplier.toFixed(2)}x)!`, 'Diamonds Secured');
    setHistory((prev) => [
      { id: String(Date.now()), diamonds: revealedSafeCount, win: currentCashout, bet, won: true },
      ...prev.slice(0, 6)
    ]);
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-4">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
            <Diamond className="w-4 h-4 text-emerald-400" />
            <span>Gems: {revealedSafeCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <span>Pot: {isPlaying && revealedSafeCount > 0 ? `${currentCashout} pts (${currentMultiplier.toFixed(2)}x)` : '-'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
            <Bomb className="w-4 h-4 text-rose-400" />
            <span>Mines: {mineCount}</span>
          </div>
        </div>

        {/* 5x5 Tiles Grid */}
        <div className="grid grid-cols-5 gap-2 p-2 bg-slate-950/90 rounded-2xl border border-slate-800">
          {tiles.map((tile, idx) => {
            const isClickable = isPlaying && !tile.isRevealed;

            return (
              <button
                key={tile.id}
                type="button"
                disabled={!isClickable}
                onClick={() => handleTileClick(idx)}
                className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold transition-all min-h-[44px] ${
                  tile.isRevealed
                    ? tile.isMine
                      ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-400 animate-in zoom-in-75'
                      : 'bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 animate-in zoom-in-75'
                    : isPlaying
                    ? 'bg-slate-800 hover:bg-slate-700/80 active:scale-95 border border-slate-700 shadow-sm cursor-pointer'
                    : 'bg-slate-800/40 border border-slate-800 opacity-60'
                }`}
              >
                {tile.isRevealed ? (
                  tile.isMine ? (
                    <Bomb className="w-6 h-6 text-rose-400" />
                  ) : (
                    <Diamond className="w-6 h-6 text-emerald-400" />
                  )
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mines Count Selector (when idle) */}
        {!isPlaying && (
          <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-300 font-semibold">Number of Mines:</span>
            <div className="flex items-center gap-1">
              {[1, 3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    ArcadeSounds.playClick();
                    setMineCount(cnt);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    mineCount === cnt
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {isPlaying ? (
          <button
            disabled={revealedSafeCount === 0}
            onClick={handleCashout}
            className={`w-full py-4 px-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all shadow-xl min-h-[52px] ${
              revealedSafeCount > 0
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-emerald-500/30 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            CASHOUT {currentCashout} PTS ({currentMultiplier.toFixed(2)}x)
          </button>
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
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/25 active:scale-[0.98] min-h-[52px]"
            >
              START MINES GRID • {bet} PTS
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Recent Mines Rounds
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {history.map((h) => (
              <div
                key={h.id}
                className={`shrink-0 px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 ${
                  h.won ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-rose-400'
                }`}
              >
                <span>{h.diamonds} 💎</span>
                <span>{h.won ? `+${h.win}` : `-${h.bet}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GameWrapper>
  );
};
