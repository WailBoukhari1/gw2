import React, { useMemo } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { CurrencyDisplay } from './CurrencyDisplay';
import { Layers, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const MATERIAL_MAP = [
  { tier: 6, ids: [24295, 24289, 24283, 24277, 24351, 24357, 24294, 24291], name: 'Tier 6 (T6)' },
  { tier: 5, ids: [24299, 24296, 24292, 24280, 24345, 24350, 24300, 24278], name: 'Tier 5 (T5)' },
  { tier: 4, ids: [24341, 24356, 24293, 24282, 24290, 24288, 24298, 24276], name: 'Tier 4 (T4)' },
  { tier: 3, ids: [24341, 24356, 24293, 24282, 24290, 24288, 24298, 24276].map(id => id - 1), name: 'Tier 3 (T3)' }, // Approximation for brevity
];

export const ProfitTierMatrix: React.FC = () => {
  const { items } = useMarketStore();

  const tierStats = useMemo(() => {
    return MATERIAL_MAP.map(group => {
      const groupItems = items.filter(i => group.ids.includes(i.id));
      const avgRoi = groupItems.reduce((acc, i) => acc + i.roi, 0) / (groupItems.length || 1);
      const totalProfit = groupItems.reduce((acc, i) => acc + i.profitPerUnit, 0);
      const topFlip = groupItems.sort((a, b) => b.roi - a.roi)[0];

      return {
        ...group,
        avgRoi,
        totalProfit,
        topFlip,
        count: groupItems.length
      };
    });
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {tierStats.map((tier) => (
        <div key={tier.tier} className="glass-card !p-0 border-white/5 bg-slate-900/60 overflow-hidden group">
          <div className="p-3 bg-slate-800/80 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{tier.name}</span>
            </div>
            <span className="text-[8px] font-bold text-slate-500 uppercase">{tier.count}/8 Synced</span>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Matrix Yield</span>
                <span className={clsx(
                  "text-lg font-black italic",
                  tier.avgRoi > 15 ? "text-emerald-400" : tier.avgRoi > 5 ? "text-amber-400" : "text-slate-500"
                )}>
                  +{tier.avgRoi.toFixed(1)}%
                </span>
              </div>
              <div className="text-right">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Spread Aggregation</span>
                 <CurrencyDisplay amount={tier.topFlip?.profitPerUnit || 0} className="text-[11px] font-bold text-indigo-300" />
              </div>
            </div>

            {tier.topFlip ? (
               <div className="bg-black/40 p-2 rounded-xl border border-white/5 flex items-center gap-3 group-hover:bg-indigo-500/10 transition-colors">
                  <img src={tier.topFlip.icon} className="w-8 h-8 rounded-lg" alt="" />
                  <div className="flex flex-col min-w-0">
                     <span className="text-[9px] font-black text-white uppercase truncate">{tier.topFlip.name}</span>
                     <span className="text-[8px] font-bold text-emerald-400">BEST OPTION</span>
                  </div>
                  <Zap size={12} className="ml-auto text-indigo-500 animate-pulse" />
               </div>
            ) : (
               <div className="h-12 flex items-center justify-center text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">
                  Scanning Tier...
               </div>
            )}
          </div>
          
          <div className="h-1 w-full bg-slate-800">
             <motion.div 
               className="h-full bg-indigo-500"
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(tier.avgRoi * 2, 100)}%` }}
             />
          </div>
        </div>
      ))}
    </div>
  );
};
