import React from 'react';
import { FRACTAL_TIERS } from '../services/community-strategies.service';
import { Shield, Clock, Coins } from 'lucide-react';
import clsx from 'clsx';

export const FractalRewardsCalculator: React.FC = () => {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 h-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400">
        <Shield className="text-purple-500" /> 
        Fractal Daily Rewards
      </h2>
      
      <div className="space-y-4">
        {FRACTAL_TIERS.map((tier, idx) => (
          <div key={idx} className="bg-slate-800/60 p-4 rounded-lg hover:bg-slate-800 transition-colors border-l-2 border-purple-500 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2 relative z-10">
               <div>
                 <h3 className="font-bold text-slate-200">{tier.tier}</h3>
                 <span className={clsx("text-xs px-2 py-0.5 rounded-full inline-block mt-1",
                   tier.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                   tier.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400' :
                   'bg-red-500/20 text-red-400'
                 )}>{tier.difficulty}</span>
               </div>
               <div className="text-right">
                 <div className="text-profit-400 font-mono font-bold text-lg flex items-center gap-1 justify-end">
                   {tier.gph}g <span className="text-xs text-slate-500 font-sans">/hr</span>
                 </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-400 relative z-10">
               <span className="flex items-center gap-1"><Clock size={14} /> {tier.duration}</span>
               <span className="flex items-center gap-1"><Coins size={14} /> {tier.rewards[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
