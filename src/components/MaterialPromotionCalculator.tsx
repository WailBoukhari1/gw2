import React from 'react';
import { MATERIAL_PROMOTIONS } from '../services/community-strategies.service';
import { RefreshCcw, ArrowRight, Zap } from 'lucide-react';

export const MaterialPromotionCalculator: React.FC = () => {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 h-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
        <Zap className="text-indigo-500" /> 
        Spirit Shard Arbitrage
      </h2>
      
      <div className="space-y-4">
        {MATERIAL_PROMOTIONS.map((promo, idx) => (
          <div key={idx} className="bg-slate-800/60 p-4 rounded-lg hover:bg-slate-800 transition-colors border-l-2 border-indigo-500 relative group">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-slate-200">{promo.name}</h3>
               <span className="text-profit-400 font-mono font-bold text-sm bg-profit-500/10 px-2 py-1 rounded">
                 {promo.profitPerShard}g / Shard
               </span>
             </div>
             
             <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/30 p-2 rounded">
               <span>{promo.input}</span>
               <ArrowRight size={10} className="text-slate-600" />
               <span className="text-slate-200">{promo.output}</span>
             </div>

             <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500">
               <span>Cost: {promo.spiritShards} Shards</span>
               <span className="flex items-center gap-1"><RefreshCcw size={10} /> Repeatable</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
