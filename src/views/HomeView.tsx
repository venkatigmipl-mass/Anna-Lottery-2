import React, { useState } from 'react';
import {
  Sparkles,
  Gamepad2,
  Gift,
  Coins,
  ChevronRight,
  TrendingUp,
  Flame,
  HelpCircle,
  Play,
  ShieldCheck,
  Info
} from 'lucide-react';
import { GameMeta, UserProfile, GameCategory } from '../types/arcade';
import { ALL_GAMES } from '../data/gamesData';
import { ArcadeSounds } from '../services/soundEffects';

interface HomeViewProps {
  user: UserProfile;
  canClaimDaily: boolean;
  timeUntilDaily: number;
  onClaimDaily: () => void;
  onSelectGame: (gameId: string) => void;
  onShowRules: (game: GameMeta) => void;
  onSwitchTab: (tab: 'home' | 'games' | 'wallet' | 'profile') => void;
  onOpenWallet: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  canClaimDaily,
  timeUntilDaily,
  onClaimDaily,
  onSelectGame,
  onShowRules,
  onSwitchTab,
  onOpenWallet
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const formatCountdown = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const banners = [
    {
      title: 'Neon Slots 777',
      subtitle: 'Spin 3 reels & match symbols for 50x Jackpot!',
      badge: 'TOP FEATURED',
      gameId: 'slot-machine',
      gradient: 'from-amber-500 via-orange-600 to-amber-700',
      icon: '🎰'
    },
    {
      title: 'Rocket Crash',
      subtitle: 'Rising multiplier 1.00x upward — cash out in time!',
      badge: 'HIGH ACTION',
      gameId: 'crash',
      gradient: 'from-purple-600 via-indigo-600 to-blue-600',
      icon: '🚀'
    },
    {
      title: 'Teen Patti vs Bots',
      subtitle: '3-card Indian poker showdown against Rahul & Priya!',
      badge: 'COMMUNITY FAVORITE',
      gameId: 'teen-patti',
      gradient: 'from-rose-600 via-pink-600 to-amber-600',
      icon: '🃏'
    },
    {
      title: 'Tap Speed Frenzy',
      subtitle: '100% Free skill arcade! Earn free points & XP!',
      badge: 'ZERO BETTING',
      gameId: 'tap-speed',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      icon: '⚡'
    }
  ];

  const currentBanner = banners[activeBannerIndex];

  const filteredGames = selectedCategory === 'all'
    ? ALL_GAMES
    : ALL_GAMES.filter((g) => g.category === selectedCategory);

  const featuredGames = ALL_GAMES.filter((g) => ['slot-machine', 'crash', 'mines', 'blackjack', 'tap-speed'].includes(g.id));

  // Continue playing recent games
  const recentPlayedList = user.recentGames
    .map((rg) => ALL_GAMES.find((g) => g.id === rg.gameId))
    .filter((g): g is GameMeta => g !== undefined);

  return (
    <div className="space-y-4 pb-6">
      {/* Demo Only Disclaimer Banner */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-amber-300">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-semibold leading-tight">
          Demo only — virtual points have no real value. 100% Free casual entertainment.
        </span>
      </div>

      {/* Banner Carousel */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <div className={`p-5 bg-gradient-to-r ${currentBanner.gradient} text-white flex flex-col justify-between min-h-[160px]`}>
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[10px] font-black uppercase tracking-wider border border-white/20">
              {currentBanner.badge}
            </span>
            <span className="text-3xl filter drop-shadow">{currentBanner.icon}</span>
          </div>

          <div className="space-y-1 my-2">
            <h2 className="text-xl font-black tracking-tight leading-tight">{currentBanner.title}</h2>
            <p className="text-xs text-white/90 font-medium leading-snug">{currentBanner.subtitle}</p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                ArcadeSounds.playClick();
                onSelectGame(currentBanner.gameId);
              }}
              className="py-2 px-4 rounded-xl bg-white text-slate-950 font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-lg flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              PLAY NOW
            </button>

            {/* Carousel Indicators */}
            <div className="flex gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeBannerIndex ? 'w-5 bg-white' : 'bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Bonus Card (+500 per 24h) */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950/80 border border-amber-500/30 rounded-3xl flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Daily Bonus (+500 pts)
            </div>
            <div className="text-xs text-slate-300 font-medium leading-tight mt-0.5">
              {canClaimDaily ? 'Your 500 free virtual points are ready!' : `Cooldown: ${formatCountdown(timeUntilDaily)}`}
            </div>
          </div>
        </div>

        <button
          disabled={!canClaimDaily}
          onClick={onClaimDaily}
          className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all min-h-[44px] shrink-0 ${
            canClaimDaily
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          {canClaimDaily ? 'CLAIM +500' : 'CLAIMED'}
        </button>
      </div>

      {/* "Continue Playing" Section */}
      {recentPlayedList.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              Continue Playing
            </h3>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {recentPlayedList.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  ArcadeSounds.playClick();
                  onSelectGame(game.id);
                }}
                className="shrink-0 w-36 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3 space-y-2 cursor-pointer active:scale-95 transition-all shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                  {game.category === 'casino' ? '🎰' : game.category === 'cards' ? '🃏' : game.category === 'quick' ? '⚡' : '🧠'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate">{game.name}</div>
                  <div className="text-[10px] text-amber-400 font-semibold uppercase">{game.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-200">Arcade Categories</h3>
          <button
            onClick={() => onSwitchTab('games')}
            className="text-xs text-amber-400 font-bold flex items-center gap-0.5 hover:underline"
          >
            View All 20 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All 20 Games' },
            { id: 'casino' as GameCategory, label: 'Casino (5)' },
            { id: 'cards' as GameCategory, label: 'Cards (5)' },
            { id: 'quick' as GameCategory, label: 'Quick Win (5)' },
            { id: 'skill' as GameCategory, label: 'Skill / Free (5)' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                ArcadeSounds.playClick();
                setSelectedCategory(cat.id as any);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold shrink-0 transition-all min-h-[40px] ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured / Filtered Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {(selectedCategory === 'all' ? featuredGames : filteredGames).map((game) => (
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
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
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
                <div className="text-[11px] text-slate-400 truncate leading-snug">{game.tagline}</div>
                <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{game.rtpDisplay}</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  ArcadeSounds.playClick();
                  onShowRules(game);
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors active:scale-95 min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Info & Odds"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  ArcadeSounds.playClick();
                  onSelectGame(game.id);
                }}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider active:scale-95 shadow-sm min-h-[40px] flex items-center"
              >
                PLAY
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
