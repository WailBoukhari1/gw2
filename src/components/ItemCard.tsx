import React, { useState } from 'react';
import type { MarketItem } from '../types';
import { CurrencyDisplay } from './CurrencyDisplay';
import { Clock, Star, Brain, Sparkles, Loader2, AlertTriangle, Lock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { api } from '../services/api.service';
import { aiService } from '../services/ai.service';
import { useAccountStore } from '../store/useAccountStore';
import { STRATEGIES } from '../services/community-strategies.service';
import { Modal } from './Modal';

interface Props {
  item: MarketItem;
}

export const ItemCard: React.FC<Props> = ({ item }) => {
  const [qty, setQty] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const { pinnedIds, togglePin, addPosition, positions, investmentLimit } = useAccountStore();
  
  const isPinned = pinnedIds.includes(item.id);
  const isLocked = positions.some(p => p.itemId === item.id);
  const totalProfit = (item.profitPerUnit * qty);
  const profitColor = item.profitPerUnit > 0 ? 'text-profit-500' : 'text-loss-500';
  const roiColor = item.roi > 20 ? 'text-profit-500' : item.roi > 10 ? 'text-gold-400' : 'text-slate-400';

  const handleLockPosition = async () => {
    if (isLocked) return;
    
    try {
      const { apiKey } = useAccountStore.getState();
      if (!apiKey) {
        // No API key - default to holding
        addPosition({
          itemId: item.id,
          itemName: item.name,
          itemIcon: item.icon || '',
          buyPrice: item.buyPrice,
          quantity: qty,
          timestamp: new Date().toISOString(),
          type: 'sell',
          status: 'holding'
        });
        return;
      }

      // Smart lock - check Trading Post API first to determine status
      const [buyOrders, sellListings] = await Promise.all([
        api.getTransactionHistory(apiKey, 'buys', 'current'),
        api.getTransactionHistory(apiKey, 'sells', 'current')
      ]);

      // Find ALL orders/listings for this item and sum quantities
      const itemBuyOrders = buyOrders.filter((order: any) => order.item_id === item.id);
      const itemSellListings = sellListings.filter((listing: any) => listing.item_id === item.id);

      // PRIORITY: Check sell listings FIRST (usually higher quantities)
      if (itemSellListings.length > 0) {
        // Found in sell listings - SELLING phase
        const totalQty = itemSellListings.reduce((sum: number, listing: any) => sum + listing.quantity, 0);
        const avgPrice = Math.round(
          itemSellListings.reduce((sum: number, listing: any) => sum + (listing.price * listing.quantity), 0) / totalQty
        );
        
        addPosition({
          itemId: item.id,
          itemName: item.name,
          itemIcon: item.icon || '',
          buyPrice: item.buyPrice, // Use market buy price as cost basis
          sellPrice: avgPrice,
          quantity: totalQty,
          originalQuantity: totalQty,
          timestamp: new Date().toISOString(),
          type: 'sell',
          status: 'active'
        });
      } else if (itemBuyOrders.length > 0) {
        // Found in buy orders - BUYING phase
        const totalQty = itemBuyOrders.reduce((sum: number, order: any) => sum + order.quantity, 0);
        const avgPrice = Math.round(
          itemBuyOrders.reduce((sum: number, order: any) => sum + (order.price * order.quantity), 0) / totalQty
        );
        
        addPosition({
          itemId: item.id,
          itemName: item.name,
          itemIcon: item.icon || '',
          buyPrice: avgPrice,
          quantity: totalQty,
          originalQuantity: totalQty,
          timestamp: new Date().toISOString(),
          type: 'buy',
          status: 'active'
        });
      } else {
        // Not found in TP - assume HOLDING (you own it but haven't listed)
        addPosition({
          itemId: item.id,
          itemName: item.name,
          itemIcon: item.icon || '',
          buyPrice: item.buyPrice, // Use market buy price as cost basis
          quantity: qty, // Use quantity from card
          originalQuantity: qty,
          timestamp: new Date().toISOString(),
          type: 'sell',
          status: 'holding'
        });
      }
    } catch (error) {
      console.error('Error checking TP status:', error);
      // Fallback to holding if API fails
      addPosition({
        itemId: item.id,
        itemName: item.name,
        itemIcon: item.icon || '',
        buyPrice: item.buyPrice,
        quantity: qty,
        originalQuantity: qty,
        timestamp: new Date().toISOString(),
        type: 'sell',
        status: 'holding'
      });
    }
  };

  const handleAnalyze = async () => {
    setModalOpen(true);
    if (analysis) return; 
    
    setAnalyzing(true);
    try {
      const listings = await api.getListings(item.id);
      const result = await aiService.analyzeItem(item, listings, investmentLimit);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

   const strategy = STRATEGIES.getFlipRecommendation(item);

  return (
    <div className={clsx(
      "glass-card p-4 relative group transition-all hover:shadow-gold-500/10 hover:-translate-y-1",
      isPinned && "border-gold-500/50 bg-gold-500/5"
    )}>
      {/* AI Button (Absolute Top Right under star) */}
      <button 
        onClick={handleAnalyze}
        disabled={analyzing}
        className="absolute top-2 right-2 bg-slate-800/80 p-1.5 rounded-full hover:bg-gold-500/20 hover:text-gold-400 transition-colors z-10"
        title="Ask AI Advisor"
      >
        {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
      </button>
      {/* Header */}
      <div className="flex gap-3 mb-4">
        <div className="relative">
          <img src={item.icon} alt={item.name} className="w-12 h-12 rounded border border-slate-600" />
          <div className="absolute -top-2 -right-2 flex flex-col gap-1">
            <button 
              onClick={() => togglePin(item.id)}
              className={clsx(
                "bg-slate-800 p-1 rounded-full transition-all hover:scale-110 shadow-lg",
                isPinned ? "text-gold-500 opacity-100 scale-110 shadow-gold-500/20" : "opacity-0 group-hover:opacity-100 text-slate-500"
              )}
            >
              <Star size={14} fill={isPinned ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleLockPosition}
              className={clsx(
                "bg-slate-800 p-1 rounded-full transition-all hover:scale-110 shadow-lg",
                isLocked ? "text-indigo-400 opacity-100 scale-110 shadow-indigo-500/20" : "opacity-0 group-hover:opacity-100 text-slate-500"
              )}
              title={isLocked ? "Position Locked" : "Lock Trade Position"}
            >
              <Lock size={14} fill={isLocked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-100 truncate text-glow">{item.name}</h3>
          <span className={clsx("text-xs px-2 py-0.5 rounded-full border", 
            item.rarity === 'Legendary' ? 'border-purple-500 text-purple-400 bg-purple-500/10' :
            item.rarity === 'Ascended' ? 'border-pink-500 text-pink-400 bg-pink-500/10' :
            item.rarity === 'Exotic' ? 'border-orange-500 text-orange-400 bg-orange-500/10' :
            item.rarity === 'Rare' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' :
            'border-slate-500 text-slate-400'
          )}>
            {item.rarity}
          </span>
        </div>
      </div>

      {/* Prices Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-slate-950/50 p-2 rounded">
          <span className="text-slate-500 block text-xs mb-1">Buy Price</span>
          <CurrencyDisplay amount={item.buyPrice} />
        </div>
        <div className="bg-slate-950/50 p-2 rounded">
          <span className="text-slate-500 block text-xs mb-1">Sell Price</span>
          <CurrencyDisplay amount={item.sellPrice} />
        </div>
      </div>

      {/* Profit Section */}
      <div className="border-t border-slate-700/50 pt-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm">Profit / Unit (15% Tax)</span>
          <span className={`font-mono font-bold ${profitColor}`}>
            <CurrencyDisplay amount={item.profitPerUnit} />
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 text-sm">ROI</span>
          <span className={`font-bold ${roiColor}`}>{item.roi.toFixed(1)}%</span>
        </div>

        {/* Input & Total */}
        <div className="flex gap-2 items-center bg-slate-800/50 p-2 rounded mb-3">
          <span className="text-xs text-slate-500">Qty:</span>
          <input 
            type="number" 
            value={qty} 
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 bg-transparent border-b border-slate-600 focus:border-gold-500 text-center outline-none text-sm"
          />
          <div className="flex-1 text-right">
            <span className="text-xs text-slate-500 block">Total Profit</span>
            <CurrencyDisplay amount={totalProfit} className="justify-end font-bold text-profit-400" />
          </div>
        </div>

        {/* Insta-Trading Activity Potential */}
        <div className="bg-slate-900/40 p-3 rounded-2xl mb-3 border border-white/5">
          <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-widest">
            <div className="flex flex-col">
              <span className="text-blue-400">Insta-Sell Into (Bids)</span>
              <span className="text-white text-xs">{item.buysQty.toLocaleString()}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-orange-400">Insta-Buy From (Lists)</span>
              <span className="text-white text-xs">{item.sellsQty.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="h-2 w-full bg-slate-800 rounded-full flex overflow-hidden ring-1 ring-white/5">
             <div 
               className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-700" 
               style={{ width: `${Math.min((item.buysQty / (item.buysQty + item.sellsQty || 1)) * 100, 100)}%` }}
             />
             <div 
               className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)] transition-all duration-700" 
               style={{ width: `${Math.min((item.sellsQty / (item.buysQty + item.sellsQty || 1)) * 100, 100)}%` }}
             />
          </div>

          <div className="mt-2.5 flex items-center justify-between">
             <div className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Fill Velocity</span>
                <span className={clsx(
                  "text-[10px] font-bold",
                  item.buysQty > 1000 ? "text-emerald-400" : item.buysQty > 200 ? "text-blue-400" : "text-slate-500"
                )}>
                  {item.buysQty > 1000 ? "EXTREME" : item.buysQty > 200 ? "STEADY" : "VOLATILE"}
                </span>
             </div>
             <div className="text-right flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Market Pressure</span>
                <span className={clsx(
                  "text-[10px] font-bold",
                  item.buysQty > item.sellsQty * 2 ? "text-blue-400" : item.sellsQty > item.buysQty * 2 ? "text-orange-400" : "text-indigo-400"
                )}>
                  {item.buysQty > item.sellsQty * 2 ? "BUYER DOMINANT" : item.sellsQty > item.buysQty * 2 ? "SELLER FLOOD" : "BALANCED"}
                </span>
             </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Badges */}
      <div className="flex gap-2 mt-3 justify-end items-center">
         <div className="flex-1">
           {item.priorityScore > 70 && (
             <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider flex items-center gap-1">
               <Sparkles size={12} /> Top Tier Flip ({item.priorityScore})
             </span>
           )}
         </div>
         <span className={clsx("flex items-center gap-1 text-[10px] px-2 py-1 rounded",
           item.flipTime === 'Instant' ? 'bg-green-500/20 text-green-400' :
           item.flipTime === 'Fast' ? 'bg-blue-500/20 text-blue-400' :
           'bg-slate-500/20 text-slate-400'
         )}>
           <Clock size={12} /> {item.flipTime}
         </span>
         {item.isManipulated && (
           <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded animate-pulse">
             <AlertTriangle size={12} /> Manipulated
           </span>
         )}
      </div>

      {strategy && (
        <div className="mt-3 p-2 bg-slate-800/30 rounded border border-slate-700/50 flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Strategy: {strategy.strategy}</span>
            <span className={clsx("text-[9px] px-1 rounded", 
              strategy.confidence === 'High' ? 'text-green-400 bg-green-500/10' : 
              strategy.confidence === 'Medium' ? 'text-gold-400 bg-gold-500/10' : 
              'text-slate-500 bg-slate-500/10'
            )}>{strategy.confidence}</span>
          </div>
          <p className="text-[11px] text-slate-300 font-semibold">{strategy.action}</p>
        </div>
      )}


      {/* AI Analysis Result Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`AI Analysis: ${item.name}`}
        icon={Brain}
      >
        {analyzing && !analysis ? (
             <div className="flex flex-col items-center justify-center p-8 text-slate-500">
                <Loader2 className="animate-spin mb-4 text-indigo-400" size={32} />
                <p className="animate-pulse text-xs font-bold uppercase tracking-widest">Consulting the Mists...</p>
             </div>
        ) : analysis ? (
            <div className="space-y-4">
               <div className="flex justify-between font-bold mb-1 relative z-10 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                 <div className="flex items-center gap-2">
                    <span className={clsx(
                      "uppercase text-lg",
                      analysis.recommendation === 'Buy' ? 'text-profit-400' : 'text-red-400'
                    )}>
                      {analysis.recommendation} 
                    </span>
                    {analysis.strategy && <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-700">{analysis.strategy}</span>}
                 </div>
                 <span className="text-slate-500 text-xs">Risk: {analysis.risk_level}</span>
               </div>

               <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/20 border border-indigo-500/20 p-4 rounded-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10 text-indigo-400"><Sparkles size={60} /></div>
                   <div className="flex items-center gap-2 mb-2 text-indigo-400">
                      <Brain size={16} />
                      <span className="text-xs font-bold uppercase">Reasoning</span>
                   </div>
                   <p className="text-slate-300 relative z-10 leading-relaxed text-sm">{analysis.reasoning}</p>
               </div>
               
               {(analysis.fill_chance_buy || analysis.fill_chance_sell) && (
                  <div className="bg-slate-800/80 p-5 rounded-2xl border border-white/5 space-y-4">
                     <div className="flex items-center gap-2 mb-2 text-indigo-400">
                        <Zap size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Instant Trade Probability</span>
                     </div>
                     
                     <div className="space-y-3">
                        <div className="space-y-1">
                           <div className="flex justify-between text-[10px] font-bold uppercase">
                              <span className="text-blue-400">Bid Fill Chance (Insta-Sellers)</span>
                              <span className="text-white">{analysis.fill_chance_buy}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${analysis.fill_chance_buy}%` }}
                                 className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                              />
                           </div>
                        </div>

                        <div className="space-y-1">
                           <div className="flex justify-between text-[10px] font-bold uppercase">
                              <span className="text-orange-400">List Sale Chance (Insta-Buyers)</span>
                              <span className="text-white">{analysis.fill_chance_sell}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${analysis.fill_chance_sell}%` }}
                                 className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {analysis.velocity && (
                 <div className="flex gap-4 pt-2 text-xs">
                    <div className="bg-slate-800 p-2 rounded flex-1 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Velocity</span>
                        <span className="text-indigo-300 font-bold">{analysis.velocity}</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded flex-1 text-center">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Target Time</span>
                        <span className="text-gold-400 font-bold">{analysis.target_sell_time}</span>
                    </div>
                 </div>
               )}
            </div>
        ) : null}
      </Modal>
      {/* Purchase Modal */}
    </div>
  );
};
