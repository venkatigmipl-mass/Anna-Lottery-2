import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  RefreshCw,
  Gift,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { Transaction, UserProfile } from '../types/arcade';
import { ArcadeSounds } from '../services/soundEffects';

interface WalletViewProps {
  user: UserProfile;
  balance: number;
  transactions: Transaction[];
  canClaimRefill: boolean;
  timeUntilRefill: number;
  canClaimDaily: boolean;
  timeUntilDaily: number;
  onClaimRefill: () => void;
  onClaimDaily: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  balance,
  transactions,
  canClaimRefill,
  timeUntilRefill,
  canClaimDaily,
  timeUntilDaily,
  onClaimRefill,
  onClaimDaily
}) => {
  const [filter, setFilter] = useState<'all' | 'win' | 'bet' | 'bonus'>('all');
  const [refillCooldownSec, setRefillCooldownSec] = useState(Math.ceil(timeUntilRefill / 1000));

  useEffect(() => {
    setRefillCooldownSec(Math.ceil(timeUntilRefill / 1000));
  }, [timeUntilRefill]);

  useEffect(() => {
    if (refillCooldownSec <= 0) return;
    const timer = setInterval(() => {
      setRefillCooldownSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [refillCooldownSec]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'win') return tx.type === 'win';
    if (filter === 'bet') return tx.type === 'bet';
    if (filter === 'bonus') return tx.type === 'daily_bonus' || tx.type === 'refill' || tx.type === 'achievement' || tx.type === 'skill_reward';
    return true;
  });

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Demo Virtual Points Disclaimer */}
      <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="leading-snug">
          <strong className="block text-rose-300 font-bold mb-0.5">Demo Only — Virtual Points Have No Real Value</strong>
          Free entertainment arcade. No real money, no deposits, no withdrawals, and no cash prizes.
        </div>
      </div>

      {/* Main Balance Vault Card */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Vault</div>
              <div className="text-xs font-semibold text-amber-400">PlayZone Points</div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-700">
            Simulated
          </span>
        </div>

        {/* Big Balance Number */}
        <div className="py-2">
          <div className="text-4xl xs:text-5xl font-black text-amber-400 tracking-tight font-mono flex items-baseline gap-2">
            <span>{balance.toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-500/80 uppercase">pts</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Lifetime Net Profit: <span className={user.stats.netProfit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {user.stats.netProfit >= 0 ? `+${user.stats.netProfit.toLocaleString()}` : user.stats.netProfit.toLocaleString()} pts
            </span>
          </div>
        </div>

        {/* Refill & Bonus Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
          {/* Emergency Refill (+1000 pts with 1-min cooldown when balance is 0 or low) */}
          <button
            disabled={!canClaimRefill}
            onClick={() => {
              ArcadeSounds.playCoin();
              onClaimRefill();
            }}
            className={`p-3 rounded-2xl border text-left transition-all min-h-[56px] flex flex-col justify-between ${
              canClaimRefill
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 hover:bg-amber-500/30 active:scale-95 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1">
                <RefreshCw className={`w-3.5 h-3.5 ${canClaimRefill ? 'animate-spin' : ''}`} />
                Free Refill
              </span>
              <span className="text-[10px] text-amber-400 font-black">+1,000</span>
            </div>
            <div className="text-[10px] leading-tight mt-1 text-slate-400">
              {balance > 10
                ? 'Available when 0 pts'
                : refillCooldownSec > 0
                ? `Wait ${refillCooldownSec}s cooldown`
                : 'Ready to claim!'}
            </div>
          </button>

          {/* Daily Bonus (+500 pts per 24h) */}
          <button
            disabled={!canClaimDaily}
            onClick={() => {
              ArcadeSounds.playCoin();
              onClaimDaily();
            }}
            className={`p-3 rounded-2xl border text-left transition-all min-h-[56px] flex flex-col justify-between ${
              canClaimDaily
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-400 text-emerald-300 hover:from-emerald-500/30 active:scale-95 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                Daily Bonus
              </span>
              <span className="text-[10px] text-emerald-400 font-black">+500</span>
            </div>
            <div className="text-[10px] leading-tight mt-1 text-slate-400 truncate">
              {canClaimDaily ? 'Ready to claim!' : 'Every 24 hours'}
            </div>
          </button>
        </div>
      </div>

      {/* Transaction History Header & Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-200">Point Activity History</h3>
          <span className="text-xs text-slate-400">{filteredTransactions.length} records</span>
        </div>

        <div className="flex gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          {[
            { id: 'all', label: 'All' },
            { id: 'win', label: 'Wins' },
            { id: 'bet', label: 'Bets' },
            { id: 'bonus', label: 'Refills & Bonus' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                ArcadeSounds.playClick();
                setFilter(tab.id as any);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
                filter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-xs text-slate-500">
            No transactions found in this category
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((tx) => {
              const isWin = tx.amount > 0;

              return (
                <div
                  key={tx.id}
                  className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {isWin ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {tx.gameName || (tx.type === 'daily_bonus' ? 'Daily Bonus' : tx.type === 'refill' ? 'Refill' : 'Arcade Reward')}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {tx.note || formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-xs font-black font-mono ${isWin ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {isWin ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} pts
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Bal: {tx.balanceAfter.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
