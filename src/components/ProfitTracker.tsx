import React, { useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { api } from '../services/api.service';
import { aiService } from '../services/ai.service';
import { CurrencyDisplay } from './CurrencyDisplay';
import { TrendingUp, Clock, AlertCircle, ShoppingCart, RefreshCw, BarChart2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export const ProfitTracker: React.FC = () => {
  const { positions, removePosition, investmentLimit, isValid } = useAccountStore();
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [aiReport, setAiReport] = useState<Record<number, any>>({});

  // Pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Show ONLY locked positions (Manual Trackers)
  const allTrades = positions.map(p => ({ 
    ...p, 
    isManual: true, 
    item_id: p.itemId, 
    price: p.buyPrice, 
    purchased: p.timestamp 
  }));

  const paginatedTrades = allTrades.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(allTrades.length / ITEMS_PER_PAGE);

  const runAnalysis = async (item: any) => {
    setAnalyzingId(item.item_id || item.itemId);
    try {
      const prices = await api.getPrices([item.item_id || item.itemId]);
      const listings = await api.getListings(item.item_id || item.itemId);
      const currentMarket = {
        name: item.name || 'Unknown Item',
        buyPrice: prices[0]?.buys.unit_price || 0,
        sellPrice: prices[0]?.sells.unit_price || 0,
        profitPerUnit: (prices[0]?.sells.unit_price * 0.85) - (item.price || item.buyPrice),
        roi: (((prices[0]?.sells.unit_price * 0.85) / (item.price || item.buyPrice)) - 1) * 100,
        buysQty: prices[0]?.buys.quantity || 0,
        sellsQty: prices[0]?.sells.quantity || 0
      };

      const report = await aiService.analyzeItem(currentMarket as any, listings, investmentLimit);
      setAiReport(prev => ({ ...prev, [item.item_id || item.itemId]: report }));
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  if (!isValid) return null;



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="text-profit-400" size={24} /> Profit Tracker & Exit Strategy
          </h2>
          <p className="text-xs text-slate-500 mt-1">AI-powered analysis of your recent purchases and active positions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paginatedTrades.length === 0 && (
          <div className="glass-card p-10 text-center border-dashed border-2 border-slate-800">
             <ShoppingCart size={48} className="mx-auto text-slate-800 mb-4" />
             <p className="text-slate-500 text-sm">No locked positions. Go buy something and lock it!</p>
          </div>
        )}

        {paginatedTrades.map((trade, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={trade.item_id || idx}
            className="glass-card p-4 hover:border-slate-700 transition-all group"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 relative overflow-hidden">
                     {trade.itemIcon ? (
                        <img src={trade.itemIcon} alt="" className="w-full h-full object-cover" />
                     ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent flex items-center justify-center text-xl">📦</div>
                     )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                       {trade.itemName || `Item ID: ${trade.item_id}`} 
                       <span className={clsx(
                         "text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold",
                         trade.status === 'completed' ? "bg-green-500/20 text-green-400" :
                         trade.type === 'sell' ? "bg-purple-500/20 text-purple-400" :
                         trade.isManual ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-500"
                       )}>
                         {trade.status === 'completed' ? "Sold & Profit" : 
                          trade.type === 'sell' ? "Selling" :
                          trade.isManual ? "Locked Position" : "API History"}
                       </span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-mono text-gold-400">Bought @ <CurrencyDisplay amount={trade.price} /></span>
                      <span className="text-[10px] opacity-60">• {new Date(trade.purchased || trade.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  {trade.isManual && (
                    <button 
                      onClick={() => removePosition(trade.item_id)}
                      className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                      title="Remove Tracker"
                    >
                      <AlertCircle size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => runAnalysis(trade)}
                    disabled={analyzingId === trade.item_id}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg",
                      aiReport[trade.item_id] 
                        ? "bg-profit-500/10 text-profit-400 border border-profit-500/20" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    )}
                  >
                    {analyzingId === trade.item_id ? <RefreshCw className="animate-spin" size={14} /> : <BarChart2 size={14} />}
                    {aiReport[trade.item_id] ? 'Re-Analyze' : 'Get Exit Strategy'}
                  </button>
               </div>
            </div>

            <AnimatePresence>
               {aiReport[trade.item_id] && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   className="mt-4 pt-4 border-t border-slate-800 overflow-hidden"
                 >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/50">
                          <label className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Decision</label>
                          <div className={clsx(
                            "text-lg font-black uppercase",
                            aiReport[trade.item_id].recommendation === 'Buy' ? "text-profit-400" : "text-red-400"
                          )}>
                             {aiReport[trade.item_id].strategy || 'HOLD / SELL'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                             <Clock size={10} /> Target: {aiReport[trade.item_id].target_sell_time || 'Check Market'}
                          </div>
                       </div>
                       <div className="md:col-span-2">
                          <label className="text-[10px] text-slate-500 uppercase font-black block mb-2 tracking-widest">AI Reasoning</label>
                          <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-3">
                            "{aiReport[trade.item_id].reasoning}"
                          </p>
                       </div>
                    </div>
                 </motion.div>
               )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4 border-t border-slate-800 mb-6">
           <button 
             onClick={() => setPage(p => Math.max(1, p - 1))}
             disabled={page === 1}
             className="p-2 bg-slate-800 rounded-full text-slate-400 disabled:opacity-30 hover:bg-slate-700 transition"
           >
             <ChevronRight size={16} className="rotate-180" />
           </button>
           <span className="text-xs font-mono text-slate-500">
             Page <span className="text-white">{page}</span> of {totalPages}
           </span>
           <button 
             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
             disabled={page === totalPages}
             className="p-2 bg-slate-800 rounded-full text-slate-400 disabled:opacity-30 hover:bg-slate-700 transition"
           >
             <ChevronRight size={16} />
           </button>
        </div>
      )}

      <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-start gap-3">
         <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
         <p className="text-[11px] text-amber-200/70 leading-relaxed">
            <b>Baron Tip:</b> The GW2 API only returns the last 90 days of transaction history. For long-term investments, 
            manual tracking of buy prices is recommended! Use our "Manual Position" tool to track items held for months.
         </p>
      </div>
    </div>
  );
};
