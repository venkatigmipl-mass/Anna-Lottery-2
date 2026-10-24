import React, { useState } from 'react';
import { Search, HelpCircle, Play, Sparkles, Filter } from 'lucide-react';
import { GameMeta, GameCategory } from '../types/arcade';
import { ALL_GAMES } from '../data/gamesData';
import { ArcadeSounds } from '../services/soundEffects';

interface GamesViewProps {
  onSelectGame: (gameId: string) => void;
  onShowRules: (game: GameMeta) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({ onSelectGame, onShowRules }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');

  const categories: { id: GameCategory | 'all'; label: string; count: number }[] = [
    { id: 'all', label: 'All Games', count: 20 },
    { id: 'casino', label: 'Casino', count: 5 },
    { id: 'cards', label: 'Cards', count: 5 },
    { id: 'quick', label: 'Quick Win', count: 5 },
    { id: 'skill', label: 'Skill & Arcade', count: 5 }
  ];

  const filteredGames = ALL_GAMES.filter((game) => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 20 arcade games..."
          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner min-h-[44px]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                ArcadeSounds.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[40px] flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Game count badge */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-semibold">
        <span>Showing {filteredGames.length} of 20 games</span>
        <span className="text-[11px] text-amber-400">Zero real money • 100% Free demo</span>
      </div>

      {/* Games List Grid */}
      {filteredGames.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2">
          <p className="text-sm font-bold text-slate-300">No games found</p>
          <p className="text-xs text-slate-500">Try searching for slots, blackjack, crash, or memory</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-500/40 transition-all shadow-md group"
            >
              <div
                onClick={() => {
                  ArcadeSounds.playClick();
                  onSelectGame(game.id);
                }}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                  {game.category === 'casino' ? '🎰' : game.category === 'cards' ? '🃏' : game.category === 'quick' ? '⚡' : '🧠'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">{game.name}</span>
                    {game.badge && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                        {game.badge}
                      </span>
                    )}
                  </div>
                  {/* Each card shows the game's rules in one line */}
                  <div className="text-[11px] text-slate-400 truncate leading-snug mt-0.5">
                    {game.tagline}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                    <span>{game.rtpDisplay}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    ArcadeSounds.playClick();
                    onShowRules(game);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Game Info & Rules"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    ArcadeSounds.playClick();
                    onSelectGame(game.id);
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider active:scale-95 shadow-sm min-h-[44px] flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  PLAY
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
