import React, { useState } from 'react';
import { BookOpen, TrendingUp, ShieldCheck, Zap, ArrowRight, MessageSquare, Coins, Wrench, Map } from 'lucide-react';
import { 
  META_EVENTS, 
  FRACTAL_TIERS, 
  MATERIAL_PROMOTIONS, 
  SALVAGE_STRATEGIES 
} from '../services/community-strategies.service';
import clsx from 'clsx';

export const CommunityStrategies: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Metas');

  const categories = ['Metas', 'Fractals', 'Promotions', 'Salvage'];

  const getActiveData = () => {
    switch(activeCategory) {
      case 'Metas': return META_EVENTS.map(m => ({ id: 'META', title: m.name, sub: `${m.gph}g/hr • ${m.difficulty}`, desc: `Rewards: ${m.rewards.join(', ')}`, type: 'High Yield' }));
      case 'Fractals': return FRACTAL_TIERS.map(f => ({ id: 'FRAC', title: f.tier, sub: `${f.gph}g/hr • ${f.duration}`, desc: `Drops: ${f.rewards.join(', ')}`, type: 'Stable' }));
      case 'Promotions': return MATERIAL_PROMOTIONS.map(p => ({ id: 'PROM', title: p.name, sub: `${p.profitPerShard}g/shard`, desc: `Input: ${p.input} -> Output: ${p.output}`, type: 'Efficient' }));
      case 'Salvage': return SALVAGE_STRATEGIES.map(s => ({ id: 'SALV', title: s.item, sub: s.tool, desc: s.action, type: 'Essential' }));
      default: return [];
    }
  };

  const data = getActiveData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-glow">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <BookOpen className="text-indigo-400" size={32} /> Strategy Center
          </h1>
          <p className="text-slate-400 mt-1">Battle-tested methods from the GW2 Baron community.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
              activeCategory === cat 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]" 
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.map((item, i) => (
          <div key={i} className="glass-card p-6 flex flex-col group hover:scale-[1.01]">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider">
                      {item.id}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-profit-400 font-bold px-2 py-0.5 bg-profit-500/10 rounded uppercase">
                      <TrendingUp size={10} /> {item.type}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-1 leading-tight group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono font-bold tracking-tight">{item.sub}</p>
               </div>
               <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-indigo-400 transition-colors">
                  {activeCategory === 'Metas' && <Map size={24} />}
                  {activeCategory === 'Fractals' && <Zap size={24} />}
                  {activeCategory === 'Promotions' && <Coins size={24} />}
                  {activeCategory === 'Salvage' && <Wrench size={24} />}
               </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expert Commentary</h4>
              <p className="text-sm text-slate-400 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                {item.desc}
              </p>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                   <MessageSquare size={14} /> 12 Discussion
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                   <ShieldCheck size={14} className="text-profit-500" /> Verified
                </div>
              </div>
              <button className="flex items-center gap-2 text-indigo-400 text-sm font-bold hover:gap-3 transition-all">
                Full Guide <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-3xl border border-indigo-500/20 flex items-center justify-between">
         <div className="max-w-md">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Have a secret method?</h2>
            <p className="text-slate-400 text-sm">Submit your own trading strategies and earn community reputation and badges.</p>
         </div>
         <button className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold shadow-xl shadow-indigo-600/25 transition-all">
            Share Strategy
         </button>
      </div>
    </div>
  );
};
