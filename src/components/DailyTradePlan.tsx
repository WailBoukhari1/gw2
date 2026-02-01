import React, { useEffect, useState } from 'react';
import { Zap, BrainCircuit, Activity } from 'lucide-react';
import { useAccountStore } from '../store/useAccountStore';
import clsx from 'clsx';
import { CurrencyDisplay } from './CurrencyDisplay';
import { aiService } from '../services/ai.service';
import type { MarketItem } from '../types';

interface Props {
  items: MarketItem[];
}

interface RankedItem extends MarketItem {
  logicScore: number;
  aiScore: string;
  aiReason: string;
  advisedQty: number;
  estTotalProfit: number;
  spreadPercent: number;
  velocityRating: 'Extreme' | 'High' | 'Moderate' | 'Low';
  confidence: number;
  strategy: string;
}

export const DailyTradePlan: React.FC<Props> = ({ items }) => {
  const { addPosition, positions, aiEnabled, scoringDNA } = useAccountStore();
  const [rankedItems, setRankedItems] = useState<RankedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    if (items.length === 0) return;
    setLoading(true);
    
    const candidates = items
      .filter(i => {
          // ELITE LIQUIDITY FILTER: Supply (Sells) and Demand (Buys) must both be active
          const hasSupply = i.sellsQty > 20;
          const hasDemand = i.buysQty > 100;
          const isHealthy = !i.isManipulated && i.roi < 500; // Filter insane theoretical ROIs
          const isNotOwned = !positions.some(p => p.itemId === i.id && p.status !== 'completed');
          const isAllowedType = !['Armor', 'Weapon', 'Back', 'Trinket'].includes(i.type);
          
          return hasSupply && hasDemand && isHealthy && isNotOwned && isAllowedType;
      })
      .map(item => {
         const spreadPercent = ((item.sellPrice - item.buyPrice) / item.buyPrice) * 100;
         
         // Priority Logic v4: Liquidity is King
         const liquidityWeight = (item.liquidityScore || 0) / 100;
         const roiWeight = Math.min(item.roi / 200, 1) * scoringDNA.roiWeight;
         
         const logicScore = Math.floor(
            (liquidityWeight * 70) + 
            (roiWeight * 30)
         );
         
         let velocityRating: 'Extreme' | 'High' | 'Moderate' | 'Low' = 'Low';
         if (item.buysQty > 10000) velocityRating = 'Extreme';
         else if (item.buysQty > 2000) velocityRating = 'High';
         else if (item.buysQty > 500) velocityRating = 'Moderate';

         let advisedQty = Math.max(25, Math.min(500, Math.floor(item.buysQty * 0.05)));
         const estTotalProfit = item.profitPerUnit * advisedQty;
         const confidence = Math.min(99, Math.floor((liquidityWeight * 60) + (roiWeight * 40)));
         
         return { 
           ...item, 
           logicScore, 
           advisedQty, 
           estTotalProfit, 
           spreadPercent,
           velocityRating,
           confidence,
           strategy: velocityRating === 'Extreme' ? 'Rapid' : 'Balanced',
           aiScore: '...', 
           aiReason: '' 
         };
      })
      .sort((a, b) => b.logicScore - a.logicScore)
      .slice(0, 50);

    const analyzed = await Promise.all(candidates.map(async (item) => {
        let aiResult = { recommendation: "Stable", reasoning: "Market depth verified." };
        if (aiEnabled) {
             try {
                aiResult = await (aiService.analyzeItem as any)(item, [], 0);
             } catch (e) { }
        }
        return { ...item, aiScore: aiResult.recommendation, aiReason: aiResult.reasoning };
    }));

    setRankedItems(analyzed);
    setLoading(false);
  };

  useEffect(() => {
    if (items.length > 0) generateRecommendations();
  }, [items.length, aiEnabled]);

  return (
    <div className="glass-card mt-6 !p-0 overflow-hidden relative">
      <div className="bg-slate-900/80 p-3 border-b border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <BrainCircuit size={18} className="text-indigo-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-tighter">Alpha Matrix Recon</h2>
         </div>
         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{items.length} Assets Analyzed</span>
      </div>
      
      <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
            <thead>
               <tr className="bg-black/20 text-[8px] text-slate-500 uppercase font-black tracking-widest border-b border-white/5">
                  <th className="p-3 w-[25%]">Asset</th>
                  <th className="p-3 w-[20%] text-center">Velocity & Liquidity</th>
                  <th className="p-3 w-[20%] text-center">ROI / Yield</th>
                  <th className="p-3 w-[20%] text-center">Neural State</th>
                  <th className="p-3 w-[15%] text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
               {rankedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-all group">
                     <td className="p-3">
                        <div className="flex items-center gap-3">
                           <img src={item.icon} alt="" className="w-8 h-8 rounded-[4px] bg-slate-800" />
                           <div className="flex flex-col min-w-0">
                               <span className="font-black text-slate-100 truncate text-[11px] uppercase tracking-tighter">{item.name}</span>
                               <span className="text-[8px] text-slate-600 font-mono">ID:{item.id}</span>
                           </div>
                        </div>
                     </td>

                     <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                           <div className={clsx(
                               "text-[8px] font-black uppercase px-2 py-0.5 rounded-[2px] inline-flex items-center gap-1",
                               item.velocityRating === 'Extreme' ? "bg-emerald-500/10 text-emerald-400" :
                               item.velocityRating === 'High' ? "bg-indigo-500/10 text-indigo-400" :
                               "bg-slate-500/10 text-slate-400"
                           )}>
                              <Zap size={8} /> {item.velocityRating}
                           </div>
                           <div className="flex items-center gap-1.5 mt-0.5">
                               <span className="text-[7px] text-slate-500 uppercase font-black tracking-tighter">
                                  Liq: {item.liquidityScore}%
                               </span>
                               <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500" 
                                    style={{ width: `${item.liquidityScore}%` }}
                                  />
                               </div>
                            </div>
                        </div>
                     </td>

                     <td className="p-3 text-center">
                        <div className="flex flex-col items-center">
                           <span className="text-[11px] font-black text-emerald-400 tracking-tighter">+{Math.round(item.roi)}%</span>
                           <CurrencyDisplay amount={item.profitPerUnit} className="text-[9px] text-slate-500 font-bold" />
                        </div>
                     </td>

                     <td className="p-3">
                        <div className="bg-white/5 p-1.5 rounded-[4px] border border-white/5">
                           <div className="flex items-center gap-1 mb-0.5">
                              <div className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span className="text-[7px] font-black text-indigo-300 uppercase">{item.aiScore}</span>
                           </div>
                           <p className="text-[8px] text-slate-500 leading-tight line-clamp-1 italic">"{item.aiReason}"</p>
                        </div>
                     </td>

                     <td className="p-3 text-right">
                        <button 
                           onClick={() => addPosition({
                             itemId: item.id,
                             itemName: item.name,
                             itemIcon: item.icon || '',
                             buyPrice: item.buyPrice,
                             quantity: item.advisedQty,
                             originalQuantity: item.advisedQty,
                             timestamp: new Date().toISOString(),
                             type: 'buy',
                             status: 'planning'
                           })}
                           className="bg-indigo-600 hover:bg-white text-white hover:text-indigo-600 px-2.5 py-1 rounded-[3px] text-[8px] font-black uppercase tracking-tighter transition-all active:scale-95"
                        >
                           Deploy
                        </button>
                     </td>
                  </tr>
               ))}
               {rankedItems.length === 0 && !loading && (
                 <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
                       No Elite Liquidity Assets Found. Protocol Scanning...
                    </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
      
      {loading && (
         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
            <Activity className="text-indigo-500 animate-spin" size={24} />
         </div>
      )}
    </div>
  );
};
