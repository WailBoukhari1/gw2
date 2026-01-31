import React from 'react';
import { LEGENDARY_PROFITS } from '../services/community-strategies.service';
import { Hammer, TrendingUp } from 'lucide-react';
import { CurrencyDisplay } from './CurrencyDisplay';

export const LegendaryCraftingGuide: React.FC = () => {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 h-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-400">
        <Hammer className="text-orange-500" /> 
        Legendary Crafting Profits
      </h2>
      
      <div className="space-y-4">
        {LEGENDARY_PROFITS.map((leg, idx) => (
          <div key={idx} className="bg-slate-800/60 p-4 rounded-lg hover:bg-slate-800 transition-colors border-l-2 border-orange-500 relative group">
            <div className="flex justify-between items-start mb-3">
               <h3 className="font-bold text-slate-100 text-lg group-hover:text-gold-400 transition-colors">{leg.name}</h3>
               <div className="text-right">
                 <span className="text-xs text-slate-500 block mb-0.5">Est. Profit</span>
                 <span className="text-profit-400 font-mono font-bold text-xl flex items-center gap-1">
                   +{leg.profit}g
                 </span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm bg-slate-950/30 p-3 rounded-lg border border-slate-800">
               <div>
                  <span className="text-xs text-slate-500 block mb-1">Investment</span>
                  <CurrencyDisplay amount={leg.investment * 10000} />
               </div>
               <div className="text-right">
                  <span className="text-xs text-slate-500 block mb-1">Sell Price</span>
                  <CurrencyDisplay amount={leg.sellPrice * 10000} />
               </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
               <span className="flex items-center gap-1"><ClockIcon size={12} /> {leg.craftingTime} avg time</span>
               <span className="flex items-center gap-1 text-blue-400"><TrendingUp size={12} /> High Demand</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClockIcon = ({ size }: { size: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
