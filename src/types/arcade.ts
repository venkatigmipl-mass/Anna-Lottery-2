export type GameCategory = 'casino' | 'cards' | 'quick' | 'skill';

export interface PayoutItem {
  label: string;
  multiplier: string;
  chance?: string;
}

export interface GameMeta {
  id: string;
  name: string;
  category: GameCategory;
  tagline: string;
  description: string;
  iconName: string;
  badge?: 'HOT' | 'POPULAR' | 'NEW' | 'FREE XP' | 'FAST';
  minBet: number;
  maxBet: number;
  rtpDisplay: string;
  houseEdgeOrRtp: string;
  rules: string[];
  payouts: PayoutItem[];
  isSkillNoBet?: boolean;
}

export interface UserStats {
  gamesPlayed: number;
  totalWins: number;
  biggestWin: number;
  netProfit: number;
  favoriteGame: string;
  playStreak: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardPoints: number;
  rewardXp: number;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface Transaction {
  id: string;
  type: 'bet' | 'win' | 'daily_bonus' | 'refill' | 'achievement' | 'skill_reward';
  gameId?: string;
  gameName?: string;
  amount: number;
  balanceAfter: number;
  timestamp: number;
  note?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  points: number;
  level: number;
  badge?: string;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: UserStats;
  lastDailyClaim: number;
  lastRefillClaim: number;
  recentGames: {
    gameId: string;
    playedAt: number;
    scoreOrWin?: number;
  }[];
}

export type AppTheme = 'arcade-dark' | 'cyber-neon' | 'midnight-gold';

export interface AppSettings {
  theme: AppTheme;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  responsibleReminderEnabled: boolean;
  gateAgreed: boolean;
  sessionStartTime: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  durationMs?: number;
}
