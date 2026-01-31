import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Target
} from 'lucide-react';
import { CurrencyDisplay } from './CurrencyDisplay';
import { useAccountStore } from '../store/useAccountStore';
import type { MarketItem } from '../types';
import clsx from 'clsx';

interface Props {
  items: MarketItem[];
}

export const TopFlipsShowcase: React.FC<Props> = ({ items }) => {
  const { addPosition, positions, scoringDNA } = useAccountStore();

  const topFlips = items
    .filter(i => 
      i.buysQty > 300 && 
      i.roi > 10 && 
      !i.isManipulated &&
      !['Armor', 'Weapon', 'Back', 'Trinket'].includes(i.type) &&
      !positions.some(p => p.itemId === i.id && p.status !== 'completed')
    )
    .map(item => {
      const spreadPercent = ((item.sellPrice - item.buyPrice) / item.buyPrice) * 100;
      const score = (item.roi * scoringDNA.roiWeight * 2) + 
                    (Math.log10(item.buysQty + 1) * scoringDNA.volumeWeight * 15);
      
      let alphaStrategy = 'Balanced';
      if (item.roi > 25) alphaStrategy = 'Yield';
      else if (item.buysQty > 5000) alphaStrategy = 'Velocity';

      return { ...item, internalScore: score, alphaStrategy, spreadPercent };
    })
    .sort((a, b) => b.internalScore - a.internalScore)
    .slice(0, 4);

  const handleQuickAdd = (item: any) => {
    const advisedQty = Math.max(10, Math.min(250, Math.floor(item.buysQty * 0.1)));
    addPosition({
      itemId: item.id,
      itemName: item.name,
      itemIcon: item.icon || '',
      buyPrice: item.buyPrice,
      quantity: advisedQty,
      originalQuantity: advisedQty,
      timestamp: new Date().toISOString(),
      type: 'buy',
      status: 'planning'
    });
  };

  if (topFlips.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
           <Target className="text-indigo-400" size={16} />
           <h2 className="text-xs font-black text-white uppercase tracking-widest">High Speed Alpha Hub</h2>
        </div>
        <div className="flex items-center gap-2 text-[7px] font-black text-slate-500 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded-[2px]">
           <span className="text-indigo-400">DNA: {Math.round(scoringDNA.roiWeight * 100)}R / {Math.round(scoringDNA.volumeWeight * 100)}V</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {topFlips.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="group glass-card !p-2 border-white/5 hover:border-indigo-500/50 relative"
          >
            <div className="absolute top-1 right-1">
               <span className={clsx(
                  "text-[6px] font-black px-1 py-0.5 rounded-[1px] uppercase tracking-widest border",
                  item.alphaStrategy === 'Velocity' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  item.alphaStrategy === 'Yield' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                  "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
               )}>{item.alphaStrategy}</span>
            </div>

            <div className="flex items-start gap-2 mb-3 mt-1">
               <img src={item.icon} alt="" className="w-8 h-8 rounded-[2px] bg-slate-800" />
               <div className="min-w-0 flex-1">
                  <h3 className="text-[9px] font-black text-white truncate uppercase tracking-tight mb-0.5">{item.name}</h3>
                  <div className="flex items-center gap-1.5 leading-none">
                     <span className="text-[8px] font-black text-emerald-400">+{Math.round(item.roi)}%</span>
                     <span className="text-[6px] font-bold text-slate-600 font-mono italic">ID:{item.id}</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-1 mb-3">
               <div className="bg-black/40 p-1.5 rounded-[2px] border border-white/5">
                  <span className="text-[5px] font-black text-slate-500 uppercase tracking-widest block">Input</span>
                  <CurrencyDisplay amount={item.buyPrice} className="text-[9px] font-bold" />
               </div>
               <div className="bg-black/40 p-1.5 rounded-[2px] border border-white/5">
                  <span className="text-[5px] font-black text-slate-500 uppercase tracking-widest block">Yield</span>
                  <CurrencyDisplay amount={item.profitPerUnit} className="text-[9px] font-bold text-emerald-400" />
               </div>
            </div>

            <div className="mb-2 bg-slate-950 p-1 rounded-[1px] flex items-center justify-between border-b border-indigo-500/20">
               <span className="text-[6px] font-black text-slate-700 uppercase">Velocity Depth: {item.buysQty.toLocaleString()}</span>
               <div className="flex gap-0.5">
                  {[1,2,3,4].map(i => (
                     <div key={i} className={clsx("w-1 h-1 rounded-full", item.buysQty > (i*500) ? "bg-indigo-500" : "bg-slate-800")} />
                  ))}
               </div>
            </div>

            <button 
              onClick={() => handleQuickAdd(item)}
              className="w-full bg-slate-800 hover:bg-indigo-600 text-white py-1.5 rounded-[2px] font-black text-[8px] uppercase tracking-widest transition-all flex items-center justify-center gap-1 border border-white/5"
            >
               DEPLOY ALPHA
               <ArrowUpRight size={10} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
