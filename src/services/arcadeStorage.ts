import { openDB, IDBPDatabase } from 'idb';
import {
  UserProfile,
  Transaction,
  Achievement,
  AppSettings,
  LeaderboardEntry
} from '../types/arcade';
import { INITIAL_ACHIEVEMENTS, INITIAL_LEADERBOARD } from '../data/gamesData';
import { setGlobalSoundEnabled } from './soundEffects';

const DB_NAME = 'playzone_arcade_db';
const DB_VERSION = 1;
const STORE_NAME = 'playzone_store';

const STORAGE_KEYS = {
  USER: 'playzone_user',
  TRANSACTIONS: 'playzone_transactions',
  ACHIEVEMENTS: 'playzone_achievements',
  SETTINGS: 'playzone_settings',
  LEADERBOARD: 'playzone_leaderboard',
  GATE_AGREED: 'playzone_gate_agreed'
};

const DEFAULT_USER: UserProfile = {
  id: 'player_user_1',
  name: 'ArcadePlayer',
  avatar: '🎮',
  points: 1000, // Starts with 1,000 fictional points
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  stats: {
    gamesPlayed: 0,
    totalWins: 0,
    biggestWin: 0,
    netProfit: 0,
    favoriteGame: 'Neon Slots 777',
    playStreak: 0
  },
  lastDailyClaim: 0,
  lastRefillClaim: 0,
  recentGames: []
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'arcade-dark',
  soundEnabled: true,
  hapticsEnabled: true,
  responsibleReminderEnabled: true,
  gateAgreed: false,
  sessionStartTime: Date.now()
};

// In-Memory Fallback Cache
const memoryCache: Record<string, unknown> = {
  [STORAGE_KEYS.USER]: DEFAULT_USER,
  [STORAGE_KEYS.TRANSACTIONS]: [
    {
      id: 'tx_init',
      type: 'refill',
      gameName: 'Welcome Gift',
      amount: 1000,
      balanceAfter: 1000,
      timestamp: Date.now(),
      note: 'Welcome to PlayZone Arcade! Free virtual demo starter points.'
    }
  ] as Transaction[],
  [STORAGE_KEYS.ACHIEVEMENTS]: INITIAL_ACHIEVEMENTS.map((a) => ({
    ...a,
    isUnlocked: false,
    progress: 0
  })) as Achievement[],
  [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS,
  [STORAGE_KEYS.LEADERBOARD]: INITIAL_LEADERBOARD,
  [STORAGE_KEYS.GATE_AGREED]: false
};

let dbPromise: Promise<IDBPDatabase | null> | null = null;

function getDb(): Promise<IDBPDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      }
    }).catch((err) => {
      console.warn('idb openDB failed, using memoryCache fallback:', err);
      return null;
    });
  }
  return dbPromise;
}

async function readFromIdb<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await getDb();
    if (!db) return memoryCache[key] !== undefined ? (memoryCache[key] as T) : defaultValue;
    const val = await db.get(STORE_NAME, key);
    if (val !== undefined && val !== null) {
      memoryCache[key] = val;
      return val as T;
    }
  } catch (err) {
    console.warn(`idb get("${key}") error:`, err);
  }
  return memoryCache[key] !== undefined ? (memoryCache[key] as T) : defaultValue;
}

function writeToIdb<T>(key: string, value: T): void {
  memoryCache[key] = value;
  getDb().then((db) => {
    if (!db) return;
    db.put(STORE_NAME, value, key).catch((err) => {
      console.warn(`idb put("${key}") error:`, err);
    });
  }).catch(() => {});
}

export const ArcadeStorage = {
  async initStorage(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(
        keys.map(async (k) => {
          const val = await readFromIdb(k, memoryCache[k]);
          memoryCache[k] = val;
        })
      );
      // Sync sound settings
      const settings = this.getSettings();
      setGlobalSoundEnabled(settings.soundEnabled);
    } catch (e) {
      console.warn('initStorage encountered error, relying on memory fallback:', e);
    }
  },

  isGateAgreed(): boolean {
    const agreed = memoryCache[STORAGE_KEYS.GATE_AGREED];
    return Boolean(agreed);
  },

  setGateAgreed(agreed: boolean): void {
    writeToIdb(STORAGE_KEYS.GATE_AGREED, agreed);
    const s = this.getSettings();
    s.gateAgreed = agreed;
    writeToIdb(STORAGE_KEYS.SETTINGS, s);
  },

  getUser(): UserProfile {
    return (memoryCache[STORAGE_KEYS.USER] as UserProfile) || DEFAULT_USER;
  },

  saveUser(user: UserProfile): void {
    writeToIdb(STORAGE_KEYS.USER, user);
  },

  getPoints(): number {
    return this.getUser().points;
  },

  getTransactions(): Transaction[] {
    return (memoryCache[STORAGE_KEYS.TRANSACTIONS] as Transaction[]) || [];
  },

  addTransaction(tx: Omit<Transaction, 'id' | 'timestamp' | 'balanceAfter'> & { balanceAfter?: number }): Transaction {
    const user = this.getUser();
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: tx.type,
      gameId: tx.gameId,
      gameName: tx.gameName,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter !== undefined ? tx.balanceAfter : user.points,
      timestamp: Date.now(),
      note: tx.note
    };
    const list = [newTx, ...this.getTransactions()].slice(0, 100); // keep recent 100
    writeToIdb(STORAGE_KEYS.TRANSACTIONS, list);
    return newTx;
  },

  // Adjust points with full ledger & validation
  updatePoints(delta: number, type: Transaction['type'], gameId?: string, gameName?: string, note?: string): number {
    const user = this.getUser();
    const newBalance = Math.max(0, user.points + delta);
    user.points = newBalance;

    if (delta > 0) {
      user.stats.netProfit += delta;
      if (delta > user.stats.biggestWin) {
        user.stats.biggestWin = delta;
      }
    } else {
      user.stats.netProfit += delta;
    }

    this.saveUser(user);
    this.addTransaction({
      type,
      gameId,
      gameName,
      amount: delta,
      balanceAfter: newBalance,
      note
    });

    return newBalance;
  },

  // Daily Bonus (+500 per 24 hours)
  canClaimDailyBonus(): boolean {
    const user = this.getUser();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    return now - (user.lastDailyClaim || 0) >= TWENTY_FOUR_HOURS;
  },

  getTimeUntilDailyBonus(): number {
    const user = this.getUser();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const diff = TWENTY_FOUR_HOURS - (Date.now() - (user.lastDailyClaim || 0));
    return Math.max(0, diff);
  },

  claimDailyBonus(): { success: boolean; pointsGranted: number; newBalance: number } {
    if (!this.canClaimDailyBonus()) {
      return { success: false, pointsGranted: 0, newBalance: this.getPoints() };
    }
    const bonus = 500;
    const user = this.getUser();
    user.lastDailyClaim = Date.now();
    this.saveUser(user);

    const newBalance = this.updatePoints(
      bonus,
      'daily_bonus',
      undefined,
      'Daily Bonus',
      'Daily attendance reward (+500 virtual points)'
    );

    this.addXP(40);
    this.checkAchievementProgress('daily-loyalty', 1);

    return { success: true, pointsGranted: bonus, newBalance };
  },

  // Free Refill (+1000 points when balance is 0 with 1 minute cooldown)
  canClaimRefill(): boolean {
    const user = this.getUser();
    if (user.points > 10) return false;
    const ONE_MINUTE = 60 * 1000;
    return Date.now() - (user.lastRefillClaim || 0) >= ONE_MINUTE;
  },

  getTimeUntilRefill(): number {
    const user = this.getUser();
    const ONE_MINUTE = 60 * 1000;
    const diff = ONE_MINUTE - (Date.now() - (user.lastRefillClaim || 0));
    return Math.max(0, diff);
  },

  claimRefill(): { success: boolean; pointsGranted: number; newBalance: number } {
    if (!this.canClaimRefill()) {
      return { success: false, pointsGranted: 0, newBalance: this.getPoints() };
    }
    const refillAmount = 1000;
    const user = this.getUser();
    user.lastRefillClaim = Date.now();
    this.saveUser(user);

    const newBalance = this.updatePoints(
      refillAmount,
      'refill',
      undefined,
      'Emergency Refill',
      'Free demo refill when balance hit zero (+1,000 points)'
    );

    return { success: true, pointsGranted: refillAmount, newBalance };
  },

  // XP & Level system
  addXP(amount: number): { leveledUp: boolean; newLevel: number; newXP: number } {
    const user = this.getUser();
    user.xp += amount;
    let leveledUp = false;

    while (user.xp >= user.xpToNextLevel) {
      user.xp -= user.xpToNextLevel;
      user.level += 1;
      user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.35);
      leveledUp = true;
      // Level up award +150 points
      user.points += 150;
      this.addTransaction({
        type: 'achievement',
        amount: 150,
        balanceAfter: user.points,
        note: `Level Up Reward! Reached Level ${user.level} (+150 pts)`
      });
    }

    this.saveUser(user);
    return { leveledUp, newLevel: user.level, newXP: user.xp };
  },

  // Record Game Round
  recordGamePlayed(gameId: string, gameName: string, isWin: boolean, profitOrScore: number): void {
    const user = this.getUser();
    user.stats.gamesPlayed += 1;
    if (isWin) {
      user.stats.totalWins += 1;
      user.stats.playStreak += 1;
    } else {
      user.stats.playStreak = 0;
    }
    user.stats.favoriteGame = gameName;

    // Track recent games
    const recent = [
      { gameId, playedAt: Date.now(), scoreOrWin: profitOrScore },
      ...user.recentGames.filter((g) => g.gameId !== gameId)
    ].slice(0, 8);
    user.recentGames = recent;

    this.saveUser(user);

    // Add base XP for playing
    this.addXP(isWin ? 25 : 10);

    // Achievements checks
    this.checkAchievementProgress('first-game', 1);
    this.checkAchievementProgress('play-10-games', user.stats.gamesPlayed);
    if (user.stats.playStreak >= 3) {
      this.checkAchievementProgress('win-streak-3', 3);
    }
    if (profitOrScore >= 500) {
      this.checkAchievementProgress('big-win-500', profitOrScore);
    }
    if (user.points >= 5000) {
      this.checkAchievementProgress('grand-champion', user.points);
    }
  },

  // Achievements
  getAchievements(): Achievement[] {
    return (memoryCache[STORAGE_KEYS.ACHIEVEMENTS] as Achievement[]) || [];
  },

  checkAchievementProgress(achievementId: string, currentVal: number): Achievement | null {
    const list = this.getAchievements();
    const ach = list.find((a) => a.id === achievementId);
    if (!ach || ach.isUnlocked) return null;

    ach.progress = Math.min(ach.maxProgress, currentVal);
    if (ach.progress >= ach.maxProgress) {
      ach.isUnlocked = true;
      ach.unlockedAt = Date.now();
      writeToIdb(STORAGE_KEYS.ACHIEVEMENTS, list);

      // Reward points & XP
      this.updatePoints(
        ach.rewardPoints,
        'achievement',
        undefined,
        'Achievement Unlocked',
        `Unlocked: "${ach.title}" (+${ach.rewardPoints} pts)`
      );
      this.addXP(ach.rewardXp);
      return ach;
    }
    writeToIdb(STORAGE_KEYS.ACHIEVEMENTS, list);
    return null;
  },

  // Leaderboard
  getLeaderboard(): LeaderboardEntry[] {
    const bots = (memoryCache[STORAGE_KEYS.LEADERBOARD] as LeaderboardEntry[]) || INITIAL_LEADERBOARD;
    const user = this.getUser();
    const userEntry: LeaderboardEntry = {
      id: user.id,
      rank: 0,
      name: `${user.name} (You)`,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      badge: user.level >= 10 ? 'Elite' : user.level >= 5 ? 'Adept' : 'Rookie',
      isCurrentUser: true
    };

    const combined = [...bots.filter((b) => !b.isCurrentUser), userEntry];
    combined.sort((a, b) => b.points - a.points);
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  },

  // Settings
  getSettings(): AppSettings {
    return (memoryCache[STORAGE_KEYS.SETTINGS] as AppSettings) || DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    writeToIdb(STORAGE_KEYS.SETTINGS, settings);
    setGlobalSoundEnabled(settings.soundEnabled);
  },

  // Reset demo data to factory defaults
  resetAllDemoData(): void {
    memoryCache[STORAGE_KEYS.USER] = DEFAULT_USER;
    memoryCache[STORAGE_KEYS.TRANSACTIONS] = [
      {
        id: 'tx_init',
        type: 'refill',
        gameName: 'Welcome Gift',
        amount: 1000,
        balanceAfter: 1000,
        timestamp: Date.now(),
        note: 'Welcome to PlayZone Arcade! Free virtual demo starter points.'
      }
    ];
    memoryCache[STORAGE_KEYS.ACHIEVEMENTS] = INITIAL_ACHIEVEMENTS.map((a) => ({
      ...a,
      isUnlocked: false,
      progress: 0
    }));
    memoryCache[STORAGE_KEYS.SETTINGS] = {
      ...DEFAULT_SETTINGS,
      sessionStartTime: Date.now()
    };
    memoryCache[STORAGE_KEYS.GATE_AGREED] = true;

    getDb().then((db) => {
      if (!db) return;
      db.clear(STORE_NAME).then(() => {
        writeToIdb(STORAGE_KEYS.USER, DEFAULT_USER);
        writeToIdb(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS, sessionStartTime: Date.now(), gateAgreed: true });
        writeToIdb(STORAGE_KEYS.GATE_AGREED, true);
        writeToIdb(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, isUnlocked: false, progress: 0 })));
      }).catch((e) => console.warn('Clear idb failed:', e));
    }).catch(() => {});
  }
};
