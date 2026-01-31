import { create } from 'zustand';
import { api, POPULAR_ITEM_IDS } from '../services/api.service';
import { db } from '../services/db.service';
import { mergeItemData } from '../utils/calculation';
import { useAccountStore } from './useAccountStore';
import type { MarketItem } from '../types';

interface MarketState {
  items: MarketItem[];
  loading: boolean;
  priorityLoading: boolean; 
  isPaused: boolean;
  lastFullScan: number | null;
  lastPriorityScan: number | null;
  scanProgress: { current: number; total: number } | null;
  
  // Actions
  setPaused: (paused: boolean) => void;
  startBackgroundScan: () => void;
  loadFromDB: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  items: [],
  loading: false,
  priorityLoading: false,
  isPaused: false,
  lastFullScan: null,
  lastPriorityScan: null,
  scanProgress: null,

  setPaused: (paused) => set({ isPaused: paused }),

  loadFromDB: async () => {
    const cachedItems = await db.items.toArray();
    if (cachedItems.length > 0) {
      set({ items: cachedItems });
    }
  },

  startBackgroundScan: async () => {
    if (get().loading) return;
    
    // Only show global loading if we have NO items at all
    const hasItems = get().items.length > 0;
    if (!hasItems) {
      set({ loading: true });
    }
    
    // UI Update Throttling
    let pendingChanges = new Map<number, MarketItem>();
    let lastUpdateAt = Date.now();
    const UPDATE_INTERVAL = 4000; 

    const flushChanges = () => {
      if (pendingChanges.size === 0) return;
      
      set(state => {
        const existingItems = state.items;
        const newItemsMap = new Map(existingItems.map(item => [item.id, item]));
        
        pendingChanges.forEach((item, id) => {
          newItemsMap.set(id, item);
        });
        
        const allItems = Array.from(newItemsMap.values());
        
        // Trigger Neural Background Learning
        useAccountStore.getState().runNeuralShadowTraining(allItems);
        
        pendingChanges.clear();
        lastUpdateAt = Date.now();
        
        return { items: allItems };
      });
    };

    const shouldUpdate = (newItem: MarketItem, existing?: MarketItem) => {
       if (!existing) return true;
       const priceDiff = Math.abs((newItem.sellPrice || 0) - (existing.sellPrice || 0));
       if (priceDiff / (existing.sellPrice || 1) > 0.005) return true;
       const qtyDiff = Math.abs((newItem.buysQty || 0) - (existing.buysQty || 0));
       if (qtyDiff / (existing.buysQty || 1) > 0.02) return true;
       return false;
    };

    const fetchBatch = async (ids: number[]) => {
       if (ids.length === 0) return;
       try {
         const [details, prices] = await Promise.all([
             api.getItems(ids),
             api.getPrices(ids)
         ]);
         
         const fetchedItems = details.map(item => {
             const price = prices.find(p => p.id === item.id);
             return mergeItemData(item, price || { 
               id: item.id, whitelisted: true, 
               buys: { unit_price: 0, quantity: 0 }, 
               sells: { unit_price: 0, quantity: 0 } 
             });
         });

         if (fetchedItems.length > 0) {
            await db.items.bulkPut(fetchedItems);
            const currentMap = new Map(get().items.map(i => [i.id, i]));
            fetchedItems.forEach(item => {
              if (shouldUpdate(item, currentMap.get(item.id))) {
                 pendingChanges.set(item.id, item);
              }
            });
         }
       } catch (e) { console.error("Batch fetch failed", e); }
    };

    const runPriorityScan = async () => {
        set({ priorityLoading: true });
        try {
            const { positions, pinnedIds } = useAccountStore.getState();
            const importantIds = [...new Set([
                ...positions.map(p => p.itemId), 
                ...pinnedIds, 
                ...POPULAR_ITEM_IDS
            ])];
            await fetchBatch(importantIds);
            flushChanges();
            set({ lastPriorityScan: Date.now() });
        } finally {
            set({ priorityLoading: false });
        }
    };

    const runFullScan = async () => {
        try {
            const scoutIds = await api.getMarketScoutItems();
            set({ scanProgress: { current: 0, total: scoutIds.length } });
            
            const CHUNK_SIZE = 120; // Slightly smaller for stability
            for (let i = 0; i < scoutIds.length; i += CHUNK_SIZE) {
                while (get().isPaused) await new Promise(r => setTimeout(r, 1000));
                const chunkIds = scoutIds.slice(i, i + CHUNK_SIZE);
                await fetchBatch(chunkIds);
                if (Date.now() - lastUpdateAt > UPDATE_INTERVAL) flushChanges();
                set({ scanProgress: { current: Math.min(i + CHUNK_SIZE, scoutIds.length), total: scoutIds.length } });
                await new Promise(r => setTimeout(r, 300));
            }
            flushChanges();
            set({ lastFullScan: Date.now(), scanProgress: null });
        } catch (e) {
            set({ scanProgress: null });
        }
    };

    // Kick off scans
    await runPriorityScan();
    set({ loading: false }); // First priority scan done, we are "interactive"

    // Set up recurring loops
    setInterval(runPriorityScan, 60000);

    const fullScanLoop = async () => {
        while (true) {
            await runFullScan();
            await new Promise(r => setTimeout(r, 15 * 60 * 1000)); // Every 15 mins for full market sweep
        }
    };
    fullScanLoop();
  }
}));
