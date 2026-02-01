import React, { useState, useEffect } from 'react';
import { TrendingUp, Brain, Trash2, Loader2, Target } from 'lucide-react';
import type { MarketItem, Position } from '../types';
import { CurrencyDisplay } from './CurrencyDisplay';
import { useAccountStore } from '../store/useAccountStore';
import { aiService } from '../services/ai.service';
import { api } from '../services/api.service';
import clsx from 'clsx';

interface Props {
  marketData: MarketItem[];
}

interface PositionCardProps {
  pos: Position;
  liveItem?: MarketItem;
  onRemove: (id: number) => void;
}

const PositionCard: React.FC<PositionCardProps> = ({ pos, liveItem, onRemove }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const remainingQty = pos.quantity;
  const originalQty = pos.originalQuantity || remainingQty;
  const isPartial = originalQty > remainingQty;
  
  const targetSellPrice = (pos.type === 'sell' && pos.status === 'active' && pos.sellPrice) 
    ? pos.sellPrice 
    : (liveItem?.sellPrice || 0);

  const profitPerUnit = (targetSellPrice * 0.85) - pos.buyPrice;
  const totalProfit = profitPerUnit * remainingQty;
  const roi = pos.buyPrice > 0 ? (profitPerUnit / pos.buyPrice) * 100 : 0;
  
  const getStatusDetails = () => {
    if (pos.status === 'completed') return { label: 'SOLD', color: 'text-emerald-400', pulse: false };
    
    const diffMinutes = (new Date().getTime() - new Date(pos.timestamp).getTime()) / 60000;
    const isFresh = diffMinutes < 10;

    if (pos.type === 'buy') {
      if (pos.status === 'active') {
        const isOutbid = liveItem && liveItem.buyPrice > pos.buyPrice;
        if (isOutbid) return { label: 'OUTBID (BUY)', color: 'text-rose-400', pulse: true };
        if (isPartial) return { label: 'FILLING BUY', color: 'text-blue-300', pulse: true };
        if (isFresh) return { label: 'JUST STARTED', color: 'text-cyan-400', pulse: false };
        return { label: 'BIDDING (BUY)', color: 'text-blue-400', pulse: false };
      }
    }
    
    if (pos.type === 'sell') {
      if (pos.status === 'active') {
        const isOutbid = liveItem && liveItem.sellPrice < (pos.sellPrice || 0);
        if (isOutbid) return { label: 'OUTBID (SELL)', color: 'text-rose-400', pulse: true };
        if (isPartial) return { label: 'FILLING SELL', color: 'text-amber-300', pulse: true };
        if (isFresh) return { label: 'JUST LISTED', color: 'text-cyan-400', pulse: false };
        return { label: 'BIDDING (SELL)', color: 'text-amber-400', pulse: false };
      }
      if (pos.status === 'holding') {
        const currentSell = liveItem?.sellPrice || 0;
        const profit = (currentSell * 0.85) - pos.buyPrice;
        const roi = pos.buyPrice > 0 ? (profit / pos.buyPrice) * 100 : 0;
        
        if (roi < 0) return { label: 'PRICE DROPPED', color: 'text-rose-500', pulse: false };
        if (roi > 12) return { label: 'TIME TO SELL!', color: 'text-indigo-400', pulse: true };
        return { label: 'IN INVENTORY', color: 'text-emerald-500/80', pulse: false };
      }
    }
    
    return { label: pos.status.toUpperCase(), color: 'text-slate-400', pulse: false };
  };

  const status = getStatusDetails();

  const handleAIAnalyze = async () => {
    if (!liveItem) return;
    setAnalyzing(true);
    const result = await aiService.analyzePosition(pos, liveItem);
    setAnalysis(result);
    setAnalyzing(false);
  };

  return (
    <div className="glass-card !p-2 relative overflow-hidden group border-white/5 hover:border-indigo-500/30">
      <div className={clsx("absolute top-0 left-0 w-0.5 h-full opacity-40", 
        pos.type === 'buy' ? 'bg-blue-500' : 'bg-amber-500',
        pos.status === 'completed' && 'bg-emerald-500'
      )} />

      <div className="flex flex-col gap-2">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
               <img src={pos.itemIcon} className="w-8 h-8 rounded-[2px] bg-slate-950" alt="" />
               <div className="flex flex-col min-w-0">
                  <h3 className="text-[10px] font-black text-white uppercase truncate tracking-tight">{pos.itemName}</h3>
                  <div className="flex items-center gap-1">
                     <span className={clsx(
                       "text-[7px] font-black uppercase tracking-widest px-1 rounded-[1px]",
                       status.color,
                       status.pulse && "animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                     )}>
                       {status.label}
                     </span>
                  </div>
               </div>
            </div>
            <button onClick={() => onRemove(pos.itemId)} className="text-slate-600 hover:text-rose-500 p-1"><Trash2 size={12} /></button>
         </div>

         <div className="grid grid-cols-2 gap-px bg-white/5 rounded-[2px] overflow-hidden border border-white/5 text-[9px]">
            <div className="bg-slate-950 p-1 flex justify-between px-2">
               <span className="text-slate-600 uppercase font-bold text-[6px]">Qty</span>
               <span className="font-bold">{remainingQty}{isPartial && `/${originalQty}`}</span>
            </div>
            <div className="bg-slate-950 p-1 flex justify-between px-2">
               <span className="text-slate-600 uppercase font-bold text-[6px]">ROI</span>
               <span className={clsx("font-black", roi >= 0 ? 'text-emerald-400' : 'text-rose-400')}>{Math.round(roi)}%</span>
            </div>
            <div className="bg-slate-950 p-1 flex justify-between px-2">
               <span className="text-slate-600 uppercase font-bold text-[6px]">In</span>
               <CurrencyDisplay amount={pos.buyPrice} className="font-bold" />
            </div>
            <div className="bg-slate-950 p-1 flex justify-between px-2">
               <span className="text-slate-600 uppercase font-bold text-[6px]">Out</span>
               <CurrencyDisplay amount={targetSellPrice} className="font-bold text-indigo-400" />
            </div>
         </div>

         <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <div className="flex flex-col">
               <span className="text-[6px] font-black text-slate-500 uppercase">Yield</span>
               <CurrencyDisplay amount={totalProfit} className="text-[10px] font-black text-emerald-400" />
            </div>
            <div className="flex gap-1">
               <button onClick={handleAIAnalyze} disabled={analyzing} className="p-1 bg-indigo-600 hover:bg-white text-white hover:text-indigo-600 rounded-[2px] transition-all">
                  {analyzing ? <Loader2 size={10} className="animate-spin" /> : <Brain size={10} />}
               </button>
            </div>
         </div>

         {analysis && (
            <div className="p-1.5 bg-indigo-500/10 rounded-[2px] border border-indigo-500/20 mt-1">
               <p className="text-[8px] text-indigo-100 leading-tight italic">"{analysis.recommendation || analysis.reasoning}"</p>
               <button onClick={() => setAnalysis(null)} className="text-[6px] font-black text-indigo-400 uppercase mt-1">Clear</button>
            </div>
         )}
      </div>
    </div>
  );
};

export const PositionTracker: React.FC<Props> = ({ marketData }) => {
  const { positions, removePosition } = useAccountStore();
  const [trackedItems, setTrackedItems] = useState<MarketItem[]>([]);

  useEffect(() => {
     const updatePrices = async () => {
        if (positions.length === 0) return;
        try {
           const ids = positions.map(p => p.itemId);
           const prices = await api.getPrices(ids);
           const newTrackedData = prices.map(p => {
              const knownItem = marketData.find(m => m.id === p.id);
              return {
                 id: p.id,
                 buyPrice: p.buys.unit_price,
                 sellPrice: p.sells.unit_price,
                 buysQty: p.buys.quantity,
                 sellsQty: p.sells.quantity,
                 icon: knownItem?.icon || '',
              } as unknown as MarketItem;
           });
           setTrackedItems(newTrackedData);
        } catch (e) {
           console.error("Failed to update position prices", e);
        }
     };
     updatePrices();
     const interval = setInterval(updatePrices, 60000);
     return () => clearInterval(interval);
  }, [positions.length, marketData]);

  const getLiveItem = (id: number) => trackedItems.find(i => i.id === id) || marketData.find(i => i.id === id);
  if (positions.length === 0) return null;

  const activePositions = positions.filter(p => p.status !== 'completed');
  const completedPositions = positions.filter(p => p.status === 'completed');

  return (
    <div className="p-2 space-y-4">
      {activePositions.length > 0 && (
        <div>
          <h2 className="text-[10px] font-black mb-2 uppercase tracking-widest flex items-center gap-2 text-white">
            <Target size={12} className="text-indigo-400" /> Active Tactical Matrix
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {activePositions.map((pos) => (
              <PositionCard key={pos.itemId} pos={pos} liveItem={getLiveItem(pos.itemId)} onRemove={removePosition} />
            ))}
          </div>
        </div>
      )}

      {completedPositions.length > 0 && (
        <div className="pt-2 border-t border-white/5 opacity-60">
           <h2 className="text-[10px] font-black mb-2 uppercase tracking-widest flex items-center gap-2 text-white">
              <TrendingUp size={12} className="text-emerald-400" /> History
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
             {completedPositions.map((pos) => (
               <PositionCard key={pos.itemId} pos={pos} liveItem={marketData.find(item => item.id === pos.itemId)} onRemove={removePosition} />
             ))}
           </div>
        </div>
      )}
    </div>
  );
};
