import React, { useState } from 'react';
import {
  User,
  Trophy,
  Award,
  BarChart2,
  Settings,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  UserProfile,
  Achievement,
  LeaderboardEntry,
  AppSettings,
  AppTheme
} from '../types/arcade';
import { AVATAR_OPTIONS } from '../data/gamesData';
import { ArcadeSounds } from '../services/soundEffects';

interface ProfileViewProps {
  user: UserProfile;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  settings: AppSettings;
  onUpdateAvatar: (avatar: string) => void;
  onUpdateName: (name: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onPromptReset: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  achievements,
  leaderboard,
  settings,
  onUpdateAvatar,
  onUpdateName,
  onUpdateSettings,
  onPromptReset
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'leaderboard' | 'settings'>('stats');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  const xpPercent = Math.min(100, Math.floor((user.xp / user.xpToNextLevel) * 100));
  const winRate = user.stats.gamesPlayed > 0 ? Math.round((user.stats.totalWins / user.stats.gamesPlayed) * 100) : 0;
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  const handleNameSave = () => {
    if (tempName.trim()) {
      onUpdateName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Player Header Card */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-400/80 hover:border-amber-400 flex items-center justify-center text-3xl shadow-lg relative group active:scale-95 transition-transform"
            title="Change Avatar"
          >
            <span>{user.avatar}</span>
            <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-[9px] text-slate-950 font-bold">
              ✎
            </span>
          </button>

          <div className="min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  maxLength={16}
                  onChange={(e) => setTempName(e.target.value)}
                  className="py-1 px-2 rounded-lg bg-slate-950 border border-amber-400 text-sm font-bold text-white outline-none w-32"
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="py-1 px-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-white truncate">{user.name}</h2>
                <button
                  onClick={() => {
                    setTempName(user.name);
                    setIsEditingName(true);
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400"
                >
                  ✎
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase">
                Level {user.level}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {user.points.toLocaleString()} pts
              </span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Ring / Bar */}
        <div className="text-right shrink-0">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Level Progress</div>
          <div className="text-xs font-black text-white font-mono mt-0.5">
            {user.xp} / {user.xpToNextLevel} XP
          </div>
          <div className="w-24 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-nav Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
        {[
          { id: 'stats', label: 'Stats', icon: BarChart2 },
          { id: 'achievements', label: `Awards (${unlockedAchievementsCount})`, icon: Award },
          { id: 'leaderboard', label: 'Top Players', icon: Trophy },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                ArcadeSounds.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[44px] ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="leading-none text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: STATISTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Rounds Played</div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {user.stats.gamesPlayed}
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Wins</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                {user.stats.totalWins}
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
                {winRate}%
              </div>
            </div>

            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Biggest Single Win</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                +{user.stats.biggestWin.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="text-xs">
              <div className="text-slate-400 font-semibold">Favorite Game</div>
              <div className="text-sm font-bold text-white mt-0.5">{user.stats.favoriteGame}</div>
            </div>
            <div className="text-right text-xs">
              <div className="text-slate-400 font-semibold">Current Win Streak</div>
              <div className="text-sm font-black text-orange-400 mt-0.5 flex items-center justify-end gap-1">
                <Flame className="w-4 h-4" />
                {user.stats.playStreak}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span>Unlocked: {unlockedAchievementsCount} / {achievements.length}</span>
            <span className="text-amber-400 font-semibold">Awards bonus points & XP</span>
          </div>

          <div className="space-y-2">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  ach.isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.isUnlocked ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-500'
                  }`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">{ach.title}</span>
                      {ach.isUnlocked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate leading-snug">{ach.description}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ach.isUnlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    +{ach.rewardPoints} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1 text-xs text-slate-400">
            <span>Local Arcade Standings</span>
            <span className="text-amber-400 font-semibold">Simulated Players</span>
          </div>

          <div className="space-y-1.5">
            {leaderboard.map((player) => (
              <div
                key={player.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                  player.isCurrentUser
                    ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-400/40 shadow-lg'
                    : 'bg-slate-900/80 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 text-center font-black text-sm ${
                    player.rank === 1
                      ? 'text-yellow-400'
                      : player.rank === 2
                      ? 'text-slate-300'
                      : player.rank === 3
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}>
                    #{player.rank}
                  </div>
                  <span className="text-xl">{player.avatar}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {player.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Level {player.level} • {player.badge}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono font-black text-xs text-amber-400">
                  {player.points.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-3">
          {/* Demo Notice on Settings as required */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-xs text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Demo only — virtual points have no real value.</span>
          </div>

          {/* Sound Effects Toggle (visual + audio) */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Arcade Sound Effects</div>
                <div className="text-[10px] text-slate-400">Web Audio synthesized retro beeps & chimes</div>
              </div>
            </div>
            <button
              onClick={() => {
                onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.soundEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-white">App Color Theme</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'arcade-dark' as AppTheme, label: 'Arcade Dark' },
                { id: 'cyber-neon' as AppTheme, label: 'Cyber Neon' },
                { id: 'midnight-gold' as AppTheme, label: 'Midnight Gold' }
              ].map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  onClick={() => {
                    ArcadeSounds.playClick();
                    onUpdateSettings({ ...settings, theme: themeOpt.id });
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    settings.theme === themeOpt.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {themeOpt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Responsible Play Reminder Toggle */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">15-Min Break Reminders</div>
                <div className="text-[10px] text-slate-400">Regular friendly stretch prompts</div>
              </div>
            </div>
            <button
              onClick={() => {
                onUpdateSettings({ ...settings, responsibleReminderEnabled: !settings.responsibleReminderEnabled });
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.responsibleReminderEnabled ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.responsibleReminderEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2">
            <button
              onClick={onPromptReset}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-950/60 hover:bg-rose-950 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[48px]"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              Reset All Demo Data (Factory Defaults)
            </button>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white text-center">Choose Retro Avatar</h3>
            <div className="grid grid-cols-4 gap-2.5">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    ArcadeSounds.playClick();
                    onUpdateAvatar(opt.emoji);
                    setShowAvatarPicker(false);
                  }}
                  className={`aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all ${
                    user.avatar === opt.emoji
                      ? 'bg-amber-500/30 border-2 border-amber-400 scale-105'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
