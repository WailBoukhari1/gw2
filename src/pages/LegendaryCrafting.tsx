import React from 'react';
import { Hammer, Scroll, Gem, AlertCircle, ShoppingCart } from 'lucide-react';
import { CurrencyDisplay } from '../components/CurrencyDisplay';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const LEGENDARIES = [
  { name: "The Bifrost", type: "Staff", gen: 1, progress: 45, cost: 21000000 },
  { name: "Twilight", type: "Greatsword", gen: 1, progress: 12, cost: 25000000 },
  { name: "Ad Infinitum", type: "Back Item", gen: 0, progress: 85, cost: 8000000 },
];

export const LegendaryCrafting: React.FC = () => {
  return (
    <div className="space-y-6 text-glow">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Hammer className="text-indigo-400" size={32} /> Legendary Forge
          </h1>
          <p className="text-slate-400 mt-1">Track your progress and calculate the cost for legendary equipment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
           {LEGENDARIES.map((leg, i) => (
             <div key={i} className="glass-card p-6 hover:bg-slate-800/10 transition-all cursor-pointer group">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex gap-4">
                   <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20 text-purple-400">
                     <Gem size={28} />
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{leg.name}</h3>
                     <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">{leg.type} • Gen {leg.gen || 'Special'}</span>
                   </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Estimated Cost Remaining</span>
                    <div className="text-lg font-bold text-gold-400 font-mono">
                      <CurrencyDisplay amount={leg.cost * (1 - leg.progress/100)} />
                    </div>
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-slate-400">Overall Progress</span>
                   <span className="text-indigo-400 font-bold">{leg.progress}%</span>
                 </div>
                 <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${leg.progress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                   />
                 </div>
               </div>
             </div>
           ))}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-indigo-500/20">
             <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
               <Scroll size={20} /> Material Shortlist
             </h2>
             <div className="space-y-4">
                {[
                  { name: "Mystic Clover", have: 12, need: 77 },
                  { name: "Glob of Ectoplasm", have: 120, need: 250 },
                  { name: "Gift of Battle", have: 0, need: 1 },
                ].map((mat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{mat.name}</span>
                    <span className={clsx("font-mono", mat.have >= mat.need ? "text-profit-400" : "text-slate-500")}>
                      {mat.have} / {mat.need}
                    </span>
                  </div>
                ))}
                <button className="w-full mt-4 bg-indigo-500/10 py-2 rounded-lg text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
                  <ShoppingCart size={14} /> Buy Missing from TP
                </button>
             </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
             <AlertCircle size={18} className="text-amber-400 shrink-0 mt-0.5" />
             <p className="text-[11px] text-amber-200 leading-relaxed italic">
               Psst! You have 347 Mithril Ingots in your bank. Using them to craft "Gift of Metal" will save you 150 gold instead of buying the finished gift.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
