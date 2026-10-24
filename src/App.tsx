import React, { useState, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import {
  UserProfile,
  GameMeta,
  ToastMessage,
  AppSettings,
  Transaction,
  Achievement,
  LeaderboardEntry
} from './types/arcade';
import { ALL_GAMES } from './data/gamesData';
import { ArcadeStorage } from './services/arcadeStorage';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { GateModal } from './components/GateModal';
import { ResponsiblePlayModal } from './components/ResponsiblePlayModal';
import { GameRulesModal } from './components/GameRulesModal';

// Views
import { HomeView } from './views/HomeView';
import { GamesView } from './views/GamesView';
import { WalletView } from './views/WalletView';
import { ProfileView } from './views/ProfileView';

// Games - Casino
import { SlotMachine } from './games/casino/SlotMachine';
import { Roulette } from './games/casino/Roulette';
import { DiceOverUnder } from './games/casino/DiceOverUnder';
import { CoinFlip } from './games/casino/CoinFlip';
import { SpinWheel } from './games/casino/SpinWheel';

// Games - Cards
import { Blackjack } from './games/cards/Blackjack';
import { TeenPatti } from './games/cards/TeenPatti';
import { AndarBahar } from './games/cards/AndarBahar';
import { HighLow } from './games/cards/HighLow';
import { Baccarat } from './games/cards/Baccarat';

// Games - Quick Win
import { CrashRocket } from './games/quick/CrashRocket';
import { MinesGame } from './games/quick/MinesGame';
import { PlinkoGame } from './games/quick/PlinkoGame';
import { ColorPrediction } from './games/quick/ColorPrediction';
import { ScratchCard } from './games/quick/ScratchCard';

// Games - Skill / Arcade
import { MemoryMatch } from './games/skill/MemoryMatch';
import { TapSpeed } from './games/skill/TapSpeed';
import { Game2048 } from './games/skill/Game2048';
import { NumberGuess } from './games/skill/NumberGuess';
import { TicTacToe } from './games/skill/TicTacToe';

export function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Core state
  const [user, setUser] = useState<UserProfile>(ArcadeStorage.getUser());
  const [transactions, setTransactions] = useState<Transaction[]>(ArcadeStorage.getTransactions());
  const [achievements, setAchievements] = useState<Achievement[]>(ArcadeStorage.getAchievements());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(ArcadeStorage.getLeaderboard());
  const [settings, setSettings] = useState<AppSettings>(ArcadeStorage.getSettings());

  // Gate & Responsible play
  const [isGateAgreed, setIsGateAgreed] = useState(ArcadeStorage.isGateAgreed());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);

  // Modals
  const [selectedRulesGame, setSelectedRulesGame] = useState<GameMeta | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Daily & Refill timers
  const [canClaimDaily, setCanClaimDaily] = useState(ArcadeStorage.canClaimDailyBonus());
  const [timeUntilDaily, setTimeUntilDaily] = useState(ArcadeStorage.getTimeUntilDailyBonus());
  const [canClaimRefill, setCanClaimRefill] = useState(ArcadeStorage.canClaimRefill());
  const [timeUntilRefill, setTimeUntilRefill] = useState(ArcadeStorage.getTimeUntilRefill());

  // Refs for Android back-button
  const activeTabRef = useRef(activeTab);
  const activeGameIdRef = useRef(activeGameId);
  const selectedRulesGameRef = useRef(selectedRulesGame);
  const showResetConfirmRef = useRef(showResetConfirm);
  const showResponsibleModalRef = useRef(showResponsibleModal);

  const sessionSecondsRef = useRef(0);

  activeTabRef.current = activeTab;
  activeGameIdRef.current = activeGameId;
  selectedRulesGameRef.current = selectedRulesGame;
  showResetConfirmRef.current = showResetConfirm;
  showResponsibleModalRef.current = showResponsibleModal;

  // Initialize storage
  useEffect(() => {
    ArcadeStorage.initStorage().then(() => {
      setUser(ArcadeStorage.getUser());
      setTransactions(ArcadeStorage.getTransactions());
      setAchievements(ArcadeStorage.getAchievements());
      setLeaderboard(ArcadeStorage.getLeaderboard());
      setSettings(ArcadeStorage.getSettings());
      setIsGateAgreed(ArcadeStorage.isGateAgreed());
      setCanClaimDaily(ArcadeStorage.canClaimDailyBonus());
      setTimeUntilDaily(ArcadeStorage.getTimeUntilDailyBonus());
      setCanClaimRefill(ArcadeStorage.canClaimRefill());
      setTimeUntilRefill(ArcadeStorage.getTimeUntilRefill());
      setIsInitialized(true);
    });
  }, []);

  // Live session timer & 15-minute responsible play prompt
  useEffect(() => {
    const timer = setInterval(() => {
      sessionSecondsRef.current += 1;
      const currentSec = sessionSecondsRef.current;
      setSessionSeconds(currentSec);

      // Check 15-minute check-in (900 seconds)
      if (currentSec > 0 && currentSec % 900 === 0 && settings.responsibleReminderEnabled) {
        setShowResponsibleModal(true);
      }

      // Update cooldowns
      setCanClaimDaily(ArcadeStorage.canClaimDailyBonus());
      setTimeUntilDaily(ArcadeStorage.getTimeUntilDailyBonus());
      setCanClaimRefill(ArcadeStorage.canClaimRefill());
      setTimeUntilRefill(ArcadeStorage.getTimeUntilRefill());
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.responsibleReminderEnabled]);

  // Capacitor Android Back Button
  useEffect(() => {
    let isMounted = true;
    let listenerHandle: { remove: () => Promise<void> | void } | null = null;

    try {
      CapApp.addListener('backButton', () => {
        // 1. Close any open modal first
        if (selectedRulesGameRef.current) {
          setSelectedRulesGame(null);
          return;
        }
        if (showResetConfirmRef.current) {
          setShowResetConfirm(false);
          return;
        }
        if (showResponsibleModalRef.current) {
          setShowResponsibleModal(false);
          return;
        }
        // 2. If inside game, exit back to lobby
        if (activeGameIdRef.current) {
          setActiveGameId(null);
          return;
        }
        // 3. If on non-home tab, go back to Home
        if (activeTabRef.current !== 'home') {
          setActiveTab('home');
          return;
        }
        // 4. Exit native app from Home
        CapApp.exitApp().catch(() => {});
      }).then((handle) => {
        if (!isMounted) {
          if (handle && typeof handle.remove === 'function') {
            try {
              handle.remove();
            } catch {}
          }
        } else {
          listenerHandle = handle;
        }
      }).catch(() => {});
    } catch {}

    return () => {
      isMounted = false;
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        try {
          listenerHandle.remove();
        } catch {}
      }
    };
  }, []);

  // Toast Helper
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, type, message, title };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Age Gate Acceptance
  const handleAcceptGate = () => {
    ArcadeStorage.setGateAgreed(true);
    setIsGateAgreed(true);
    showToast('success', 'Welcome to PlayZone Arcade! 1,000 demo points added to your vault.', 'Welcome!');
  };

  // Bet placement handler
  const handleBet = (amount: number, gameId: string, gameName: string): boolean => {
    if (user.points < amount) {
      showToast('error', 'Insufficient virtual points for this wager.', 'Low Balance');
      return false;
    }
    const newBal = ArcadeStorage.updatePoints(-amount, 'bet', gameId, gameName, `Wager on ${gameName}`);
    setUser(ArcadeStorage.getUser());
    setTransactions(ArcadeStorage.getTransactions());
    setLeaderboard(ArcadeStorage.getLeaderboard());
    return true;
  };

  // Game Win handler
  const handleWin = (amount: number, gameId: string, gameName: string) => {
    ArcadeStorage.updatePoints(amount, 'win', gameId, gameName, `Win payout on ${gameName}`);
    ArcadeStorage.recordGamePlayed(gameId, gameName, true, amount);
    setUser(ArcadeStorage.getUser());
    setTransactions(ArcadeStorage.getTransactions());
    setAchievements(ArcadeStorage.getAchievements());
    setLeaderboard(ArcadeStorage.getLeaderboard());
  };

  // Skill Game Points Earn handler (no betting)
  const handleEarnSkillPoints = (pts: number, xp: number, gameId: string, gameName: string, note: string) => {
    ArcadeStorage.updatePoints(pts, 'skill_reward', gameId, gameName, note);
    ArcadeStorage.addXP(xp);
    ArcadeStorage.recordGamePlayed(gameId, gameName, true, pts);
    setUser(ArcadeStorage.getUser());
    setTransactions(ArcadeStorage.getTransactions());
    setAchievements(ArcadeStorage.getAchievements());
    setLeaderboard(ArcadeStorage.getLeaderboard());
  };

  // Claim Daily Bonus
  const handleClaimDaily = () => {
    const res = ArcadeStorage.claimDailyBonus();
    if (res.success) {
      setUser(ArcadeStorage.getUser());
      setTransactions(ArcadeStorage.getTransactions());
      setAchievements(ArcadeStorage.getAchievements());
      setLeaderboard(ArcadeStorage.getLeaderboard());
      setCanClaimDaily(false);
      setTimeUntilDaily(ArcadeStorage.getTimeUntilDailyBonus());
      showToast('success', `Daily Bonus Claimed! +${res.pointsGranted} virtual points added.`, '🎁 Daily Reward');
    }
  };

  // Claim Free Refill
  const handleClaimRefill = () => {
    const res = ArcadeStorage.claimRefill();
    if (res.success) {
      setUser(ArcadeStorage.getUser());
      setTransactions(ArcadeStorage.getTransactions());
      setLeaderboard(ArcadeStorage.getLeaderboard());
      setCanClaimRefill(false);
      setTimeUntilRefill(ArcadeStorage.getTimeUntilRefill());
      showToast('success', `Emergency Refill Granted! +${res.pointsGranted} virtual points added.`, '⭐ Refill Complete');
    } else {
      showToast('warning', 'Refill is currently on 1-minute cooldown or your balance is sufficient.', 'Refill Cooldown');
    }
  };

  // Settings update
  const handleUpdateSettings = (newSettings: AppSettings) => {
    ArcadeStorage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Avatar update
  const handleUpdateAvatar = (avatar: string) => {
    const u = ArcadeStorage.getUser();
    u.avatar = avatar;
    ArcadeStorage.saveUser(u);
    setUser({ ...u });
    setLeaderboard(ArcadeStorage.getLeaderboard());
  };

  // Name update
  const handleUpdateName = (name: string) => {
    const u = ArcadeStorage.getUser();
    u.name = name;
    ArcadeStorage.saveUser(u);
    setUser({ ...u });
    setLeaderboard(ArcadeStorage.getLeaderboard());
    showToast('success', 'Profile name updated!', 'Saved');
  };

  // Factory reset demo data
  const handleConfirmReset = () => {
    ArcadeStorage.resetAllDemoData();
    setUser(ArcadeStorage.getUser());
    setTransactions(ArcadeStorage.getTransactions());
    setAchievements(ArcadeStorage.getAchievements());
    setLeaderboard(ArcadeStorage.getLeaderboard());
    setSettings(ArcadeStorage.getSettings());
    setShowResetConfirm(false);
    showToast('info', 'Demo data reset to 1,000 starting points and initial settings.', 'Factory Reset');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Active Game Meta
  const activeGameMeta = activeGameId ? ALL_GAMES.find((g) => g.id === activeGameId) || null : null;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased ${
      settings.theme === 'cyber-neon' ? 'theme-cyber-neon' : settings.theme === 'midnight-gold' ? 'theme-midnight-gold' : ''
    }`}>
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* 18+ Age Gate Screen */}
      <GateModal isOpen={!isGateAgreed} onAccept={handleAcceptGate} />

      {/* Responsible Gaming 15-Minute Reminder Modal */}
      <ResponsiblePlayModal
        isOpen={showResponsibleModal}
        minutesPlayed={Math.floor(sessionSeconds / 60)}
        onResume={() => setShowResponsibleModal(false)}
      />

      {/* Game Rules Modal */}
      <GameRulesModal game={selectedRulesGame} onClose={() => setSelectedRulesGame(null)} />

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Demo Data?"
        message="This will reset your virtual points balance to 1,000, clear game history, and restore achievements to initial state. No real money is affected."
        confirmLabel="Reset Demo Data"
        cancelLabel="Keep Playing"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* ACTIVE GAME VIEW */}
      {activeGameMeta ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* CASINO */}
          {activeGameMeta.id === 'slot-machine' && (
            <SlotMachine
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'roulette' && (
            <Roulette
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'dice' && (
            <DiceOverUnder
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'coin-flip' && (
            <CoinFlip
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'spin-wheel' && (
            <SpinWheel
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}

          {/* CARDS */}
          {activeGameMeta.id === 'blackjack' && (
            <Blackjack
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'teen-patti' && (
            <TeenPatti
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'andar-bahar' && (
            <AndarBahar
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'high-low' && (
            <HighLow
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'baccarat' && (
            <Baccarat
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}

          {/* QUICK WIN */}
          {activeGameMeta.id === 'crash' && (
            <CrashRocket
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'mines' && (
            <MinesGame
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'plinko' && (
            <PlinkoGame
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'color-prediction' && (
            <ColorPrediction
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'scratch-card' && (
            <ScratchCard
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onWin={handleWin}
              onBet={handleBet}
              showToast={showToast}
            />
          )}

          {/* SKILL / ARCADE */}
          {activeGameMeta.id === 'memory-match' && (
            <MemoryMatch
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onEarnPoints={handleEarnSkillPoints}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'tap-speed' && (
            <TapSpeed
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onEarnPoints={handleEarnSkillPoints}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'game-2048' && (
            <Game2048
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onEarnPoints={handleEarnSkillPoints}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'number-guess' && (
            <NumberGuess
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onEarnPoints={handleEarnSkillPoints}
              showToast={showToast}
            />
          )}
          {activeGameMeta.id === 'tic-tac-toe' && (
            <TicTacToe
              game={activeGameMeta}
              balance={user.points}
              soundEnabled={settings.soundEnabled}
              onBack={() => setActiveGameId(null)}
              onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              onOpenWallet={() => {
                setActiveGameId(null);
                setActiveTab('wallet');
              }}
              onEarnPoints={handleEarnSkillPoints}
              showToast={showToast}
            />
          )}
        </div>
      ) : (
        /* STANDARD 4-TAB NAVIGATION VIEW */
        <div className="flex-1 flex flex-col h-full max-w-md mx-auto w-full">
          {/* Top Bar Header */}
          <Header
            balance={user.points}
            sessionSeconds={sessionSeconds}
            soundEnabled={settings.soundEnabled}
            onOpenWallet={() => setActiveTab('wallet')}
            onToggleSound={() => handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
          />

          {/* Tab Content Body */}
          <main className="flex-1 overflow-y-auto px-4 py-3">
            {activeTab === 'home' && (
              <HomeView
                user={user}
                canClaimDaily={canClaimDaily}
                timeUntilDaily={timeUntilDaily}
                onClaimDaily={handleClaimDaily}
                onSelectGame={(id) => setActiveGameId(id)}
                onShowRules={(game) => setSelectedRulesGame(game)}
                onSwitchTab={(tab) => setActiveTab(tab)}
                onOpenWallet={() => setActiveTab('wallet')}
              />
            )}

            {activeTab === 'games' && (
              <GamesView
                onSelectGame={(id) => setActiveGameId(id)}
                onShowRules={(game) => setSelectedRulesGame(game)}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletView
                user={user}
                balance={user.points}
                transactions={transactions}
                canClaimRefill={canClaimRefill}
                timeUntilRefill={timeUntilRefill}
                canClaimDaily={canClaimDaily}
                timeUntilDaily={timeUntilDaily}
                onClaimRefill={handleClaimRefill}
                onClaimDaily={handleClaimDaily}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                achievements={achievements}
                leaderboard={leaderboard}
                settings={settings}
                onUpdateAvatar={handleUpdateAvatar}
                onUpdateName={handleUpdateName}
                onUpdateSettings={handleUpdateSettings}
                onPromptReset={() => setShowResetConfirm(true)}
              />
            )}
          </main>

          {/* Bottom Navigation */}
          <BottomNav
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t)}
            canClaimDaily={canClaimDaily}
            canClaimRefill={canClaimRefill}
          />
        </div>
      )}
    </div>
  );
}

export default App;
