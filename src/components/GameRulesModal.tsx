import React from 'react';
import { X, ShieldCheck, Percent, HelpCircle, Trophy } from 'lucide-react';
import { GameMeta } from '../types/arcade';

interface GameRulesModalProps {
  game: GameMeta | null;
  onClose: () => void;
}

export const GameRulesModal: React.FC<GameRulesModalProps> = ({ game, onClose }) => {
  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[85vh] bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-bottom-8 duration-200 overflow-hidden">
        {/* Top header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              {game.name}
            </h2>
            <div className="text-xs text-amber-400 font-medium">Rules & Fair Payouts</div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto space-y-4 py-3 text-xs pr-1">
          {/* Fairness & RTP badge */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-emerald-300">RTP / Expected Return</div>
                <div className="text-[11px] text-emerald-400/80">{game.rtpDisplay}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">House Edge / Type</div>
              <div className="font-bold text-slate-200">{game.houseEdgeOrRtp}</div>
            </div>
          </div>

          {/* Rules list */}
          <div className="space-y-2">
            <div className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <span>📋</span> Official Demo Rules
            </div>
            <ul className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              {game.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payout table */}
          {game.payouts && game.payouts.length > 0 && (
            <div className="space-y-2">
              <div className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Payout Table
              </div>
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Outcome</th>
                      <th className="py-2.5 px-3">Payout</th>
                      {game.payouts.some((p) => p.chance) && <th className="py-2.5 px-3 text-right">Probability</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {game.payouts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-slate-200 font-medium">{p.label}</td>
                        <td className="py-2 px-3 text-amber-400 font-bold">{p.multiplier}</td>
                        {p.chance && <td className="py-2 px-3 text-right text-slate-400 font-mono text-[11px]">{p.chance}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Virtual Points Disclaimer */}
          <div className="p-3 bg-slate-800/40 rounded-xl text-[11px] text-slate-400 leading-snug border border-slate-800 text-center">
            🔒 Demo Only — All bets and payouts use fictional virtual arcade points with no real cash value.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm min-h-[44px] active:scale-95 transition-all"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
