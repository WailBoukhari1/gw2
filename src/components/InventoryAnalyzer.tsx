import React, { useEffect, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { useMarketStore } from '../store/useMarketStore';
import { api } from '../services/api.service';
import type { MarketItem } from '../types';
import { Package, TrendingUp } from 'lucide-react';
import { CurrencyDisplay } from './CurrencyDisplay';

export const InventoryAnalyzer: React.FC = () => {
  const { apiKey, isValid } = useAccountStore();
  const [analyzedItems, setAnalyzedItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { items: marketCache } = useMarketStore();
  
  useEffect(() => {
    if (apiKey && isValid) {
      analyzeInventory();
    }
  }, [apiKey, isValid, marketCache.length]); // Re-analyze if cache grows

  const analyzeInventory = async () => {
    if (!apiKey) return;
    setLoading(true);
    try {
      const inventory = await api.getInventory(apiKey);
      
      // Count duplicates and filter out worthless/stackables that aren't tradable
      const itemCounts = inventory.reduce((acc: any, item: any) => {
        if (!item) return acc;
        acc[item.id] = (acc[item.id] || 0) + item.count;
        return acc;
      }, {});

      const inventoryIds = Object.keys(itemCounts).map(Number);
      
      // Match with our high-speed market cache
      const marketItems = inventoryIds.map(id => {
        const cached = marketCache.find((i: MarketItem) => i.id === id);
        if (!cached || cached.sellPrice === 0) return null;
        
        return {
          ...cached,
          count: itemCounts[id]
        };
      }).filter(Boolean) as any[];

      // Sort by absolute liquid value (Total Potential Profit)
      marketItems.sort((a, b) => (b.profitPerUnit * b.count) - (a.profitPerUnit * a.count));
      
      setAnalyzedItems(marketItems);
    } catch (error) {
      console.error("Failed to analyze inventory", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isValid || (analyzedItems.length === 0 && !loading)) return null;

  if (loading) return (
    <div className="glass-card p-6 mb-8 flex items-center justify-center gap-3">
      <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-slate-500 text-sm">Analyzing your inventory for liquid gold...</span>
    </div>
  );

  const totalPotentialProfit = analyzedItems.reduce((acc, item: any) => acc + (item.profitPerUnit * item.count), 0);

  return (
    <div className="glass-card p-6 mb-8 border-l-4 border-gold-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gold-500/20 p-2 rounded-lg text-gold-500">
            <Package size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Inventory Liquidity Analysis</h2>
            <p className="text-sm text-slate-400">Items you own that are currently profitable to flip or sell</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block uppercase font-bold mb-1">Total Potential Liquid Gold</span>
          <div className="text-2xl font-mono font-bold text-profit-400">
            <CurrencyDisplay amount={totalPotentialProfit} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyzedItems.slice(0, 6).map((item: any) => (
          <div key={item.id} className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 flex items-center justify-between group hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center gap-3">
              <img src={item.icon} alt={item.name} className="w-10 h-10 rounded shadow-md" />
              <div>
                <h3 className="text-sm font-bold text-slate-200 line-clamp-1">{item.name}</h3>
                <span className="text-xs text-slate-400">Qty: {item.count} in bags</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-profit-400 font-mono text-sm font-bold flex items-center gap-1 justify-end">
                <TrendingUp size={12} />
                <CurrencyDisplay amount={item.profitPerUnit * item.count} />
              </div>
              <span className="text-[10px] text-slate-500">Net Profit</span>
            </div>
          </div>
        ))}
      </div>

      {analyzedItems.length > 6 && (
        <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest italic">
          + {analyzedItems.length - 6} more profitable items found in your inventory
        </p>
      )}
    </div>
  );
};
