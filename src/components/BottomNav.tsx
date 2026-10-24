import React from 'react';
import { Home, Gamepad2, Wallet, User } from 'lucide-react';
import { ArcadeSounds } from '../services/soundEffects';

export type TabType = 'home' | 'games' | 'wallet' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  canClaimDaily?: boolean;
  canClaimRefill?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  canClaimDaily = false,
  canClaimRefill = false
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'games' as TabType, label: 'Games', icon: Gamepad2, count: 20 },
    { id: 'wallet' as TabType, label: 'Wallet', icon: Wallet, hasBadge: canClaimDaily || canClaimRefill },
    { id: 'profile' as TabType, label: 'Profile', icon: User }
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                ArcadeSounds.playClick();
                onTabChange(tab.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative min-h-[48px] select-none ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-amber-400' : ''}`} />
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
                )}
                {tab.count && (
                  <span className="absolute -top-1 -right-3 text-[9px] font-black bg-slate-800 text-slate-300 px-1 rounded-full border border-slate-700">
                    {tab.count}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight leading-none">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0.5 w-8 h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
