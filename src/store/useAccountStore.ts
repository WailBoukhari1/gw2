import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position, InvestmentPlan, ShadowPosition, MarketItem } from '../types';
import { api } from "../services/api.service";

interface AccountState {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  isValid: boolean;
  setIsValid: (valid: boolean) => void;
  accountData: any | null;
  setAccountData: (data: any | null) => void;
  wallet: any[];
  setWallet: (wallet: any[]) => void;
  permissions: string[];
  setPermissions: (permissions: string[]) => void;
  pinnedIds: number[];
  togglePin: (id: number) => void;
  investmentLimit: number;
  setInvestmentLimit: (limit: number) => void;
  positions: Position[];
  addPosition: (pos: Position) => void;
  removePosition: (itemId: number) => void;
  updatePosition: (itemId: number, updates: Partial<Position>) => void;
  updatePositionBuyPrice: (itemId: number, price: number) => void;
  investmentPlans: InvestmentPlan[];
  addInvestmentPlan: (plan: InvestmentPlan) => void;
  updateInvestmentPlan: (id: string, updates: Partial<InvestmentPlan>) => void;
  removeInvestmentPlan: (id: string) => void;
  aiEnabled: boolean;
  toggleAi: () => void;
  
  // Real Maturity (User Trades)
  realMaturityLevel: number;
  realLearningProgress: number;
  completedTrades: number;
  
  // AI Shadow Logic
  simMaturityLevel: number;
  simLearningProgress: number;
  simulatedTrades: number;
  virtualWallet: number; 
  shadowPositions: ShadowPosition[];
  runNeuralShadowTraining: (items: MarketItem[]) => void;

  condensedMemory: Record<string, { wins: number; value: number; avgDuration?: number }>;
  
  // Neural Intelligence Profile
  scoringDNA: {
    roiWeight: number;
    volumeWeight: number;
    spreadWeight: number;
    preferredCategories: string[];
    riskTolerance: number; // 0-1
    lastEvolution: string;
  };
  evolveLogic: () => void;
  
  // Market Scout Autonomous Layer
  scoutBias: {
    categoryOrder: string[];
    volatilityThreshold: number;
    targetRoiRange: [number, number];
  };
  setScoutBias: (bias: Partial<AccountState['scoutBias']>) => void;

  aiApiKey: string | null;
  aiModelName: string | null;
  aiBudget: number;
  setAiApiKey: (key: string) => void;
  aiFeatures: {
    marketAnalysis: boolean;
    askAi: boolean;
    dailyPlan: boolean;
    investmentAdvice: boolean;
  };
  toggleAiFeature: (feature: keyof AccountState['aiFeatures']) => void;

  addRealLearningData: (xp: number, tradeCount?: number) => void;
  addSimLearningData: (xp: number, profit: number, pos: ShadowPosition) => void;
  syncTradingPost: () => Promise<void>;
  reconcilePositions: (historyBuys: any[], historySells: any[], currentSells: any[], currentBuys: any[]) => void;
  clearMemory: () => void;
  relianceScore: number; // 0-100
  relianceStrategy: 'supervised' | 'competitive' | 'autonomous';
  evaluateAIDecision: (isBetter: boolean, scoreDelta?: number) => void;
  lastProcessedBuyId: number;
  lastProcessedSellId: number;
  tradeNotifications: { id: string; type: 'buy' | 'sell'; message: string; timestamp: string }[];
  clearNotifications: () => void;
  scoutActivity: { message: string; type: 'info' | 'brain' | 'alert'; timestamp: string }[];
  addScoutLog: (message: string, type?: 'info' | 'brain' | 'alert') => void;
  resetAll: () => void;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key ? key.trim() : null, isValid: false, accountData: null, wallet: [] }),
      isValid: false,
      setIsValid: (valid) => set({ isValid: valid }),
      accountData: null,
      setAccountData: (data) => set({ accountData: data }),
      wallet: [],
      setWallet: (wallet) => set({ wallet }),
      permissions: [],
      setPermissions: (permissions) => set({ permissions }),
      pinnedIds: [],
      togglePin: (id) => {
        const { pinnedIds } = get();
        if (pinnedIds.includes(id)) {
          set({ pinnedIds: pinnedIds.filter(pid => pid !== id) });
        } else {
          set({ pinnedIds: [...pinnedIds, id] });
        }
      },
      investmentLimit: 5000000,
      setInvestmentLimit: (limit) => set({ investmentLimit: limit }),
      positions: [],
      addPosition: (pos) => {
        const { positions } = get();
        if (!positions.some(p => p.itemId === pos.itemId)) {
          set({ positions: [pos, ...positions] });
        }
      },
      removePosition: (itemId) => set({ positions: get().positions.filter(p => p.itemId !== itemId) }),
      updatePosition: (itemId, updates) => set({
        positions: get().positions.map(p => p.itemId === itemId ? { ...p, ...updates } : p)
      }),
      updatePositionBuyPrice: (itemId, price) => set({
        positions: get().positions.map(p => p.itemId === itemId ? { ...p, buyPrice: price } : p)
      }),
      investmentPlans: [],
      addInvestmentPlan: (plan) => set({ investmentPlans: [plan, ...get().investmentPlans] }),
      updateInvestmentPlan: (id, updates) => set({
        investmentPlans: get().investmentPlans.map(p => p.id === id ? { ...p, ...updates } : p)
      }),
      removeInvestmentPlan: (id) => set({ investmentPlans: get().investmentPlans.filter(p => p.id !== id) }),
      aiEnabled: true,
      toggleAi: () => set({ aiEnabled: !get().aiEnabled }),
      
      realMaturityLevel: 1,
      realLearningProgress: 0,
      completedTrades: 0,
      
      simMaturityLevel: 1,
      simLearningProgress: 0,
      simulatedTrades: 0,
      virtualWallet: 1000000, // Initial 100G
      shadowPositions: [],

      condensedMemory: {},
      scoutActivity: [],
      addScoutLog: (message, type = 'info') => set(state => ({
        scoutActivity: [{ message, type, timestamp: new Date().toISOString() }, ...state.scoutActivity].slice(0, 30)
      })),
      
      scoringDNA: {
        roiWeight: 0.4,
        volumeWeight: 0.3,
        spreadWeight: 0.3,
        preferredCategories: ['CraftingMaterial', 'Consumable'],
        riskTolerance: 0.5,
        lastEvolution: new Date().toISOString(),
      },

      scoutBias: {
        categoryOrder: ['CraftingMaterial', 'Consumable', 'UpgradeComponent'],
        volatilityThreshold: 0.05,
        targetRoiRange: [15, 60]
      },
      setScoutBias: (bias) => set({ scoutBias: { ...get().scoutBias, ...bias } }),

      runNeuralShadowTraining: (items: MarketItem[]) => {
        const { shadowPositions, evolveLogic, addSimLearningData, condensedMemory, virtualWallet } = get();
        const now = new Date();
        const resolvedPositions: ShadowPosition[] = [];
        const activePositions: ShadowPosition[] = [];

        // REALISM RESET: 100G Threshold for "Unrealistic" scouting
        if (virtualWallet > 100000000) { // If it hits 10k Gold, sanitizer reset
           set({ virtualWallet: 1000000 }); // Back to 100G
           get().addScoutLog("Reality Sync: Purged unfillable virtual profit. Reset to 100G.", "alert");
        }

        shadowPositions.forEach(pos => {
          // PURGE unrealistic data (e.g. ROI > 500% or buy price < 10c)
          if (pos.roiEstimate > 500 || pos.buyPrice < 10) {
             return; // Drop this garbage
          }
          
          if (new Date(pos.expectedExitTimestamp) <= now) {
            resolvedPositions.push(pos);
          } else {
            activePositions.push(pos);
          }
        });

        resolvedPositions.forEach(pos => {
          const goldProfit = (pos.sellPrice * 0.85) - pos.buyPrice;
          const totalProfit = goldProfit * pos.quantity;
          
          const entry = new Date(pos.entryTimestamp).getTime();
          const exit = new Date(pos.expectedExitTimestamp).getTime();
          const durationHours = Math.max(0.1, (exit - entry) / (1000 * 60 * 60));
          const profitPerHour = totalProfit / durationHours;

          if (totalProfit > 500000) {
             get().addScoutLog(`High Yield Simulated: ${pos.itemName} closed with ${Math.round(totalProfit/10000)}g`, 'brain');
          }

          // XP is a factor of ROI and efficiency (profit/hour)
          const xp = Math.max(10, Math.min(100, Math.floor((pos.roiEstimate * 2) + (profitPerHour / 5000))));
          addSimLearningData(xp, totalProfit, pos);

          const memKey = `sim:${pos.itemId}`;
          const currentMem = condensedMemory[memKey] || { wins: 0, value: 0, avgDuration: 0 };
          
          set((state) => ({
            condensedMemory: {
              ...state.condensedMemory,
              [memKey]: {
                wins: (currentMem.wins || 0) + 1,
                value: ((currentMem.value || 0) + totalProfit) / ((currentMem.wins || 0) + 1),
                avgDuration: ((currentMem.avgDuration || 1) + durationHours) / 2
              }
            }
          }));
        });

        if (activePositions.length < 12 && items.length > 0) {
          const candidates = items
            .filter(i => {
              // ADVANCED SCOUT FILTERING: Demand & Healthy Spread
              const hasDemand = i.buysQty > 200;
              const hasSupply = i.sellsQty > 10;
              const isLiquid = (i.liquidityScore || 0) > 40;
              const isHealthy = i.roi > 15 && i.roi < 150; // Filter insane traps
              const isCrafting = get().scoutBias.categoryOrder.includes(i.type);
              
              return hasDemand && hasSupply && isLiquid && isHealthy && (isCrafting || i.roi > 25);
            })
            .sort((a, b) => {
               // Autonomous Scoring: Weighted ROI + Liquidity Bonus
               const scoreA = (a.roi * 1.5) + (a.liquidityScore || 0);
               const scoreB = (b.roi * 1.5) + (b.liquidityScore || 0);
               return scoreB - scoreA;
            })
            .slice(0, 12);
          
          candidates.forEach(item => {
            if (!activePositions.some(p => p.itemId === item.id)) {
              // VELOCITY CALC: 
              // 10000+ volume = ~15-30m
              // 1000+ volume = ~1-3h
              // <1000 volume = ~6-24h
              let hours = 12;
              if (item.buysQty > 10000) hours = 0.25 + Math.random() * 0.5;
              else if (item.buysQty > 2000) hours = 1 + Math.random() * 2;
              else if (item.buysQty > 500) hours = 4 + Math.random() * 8;
              else hours = 12 + Math.random() * 24;

              const exitTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
              
              activePositions.push({
                id: `shadow-${Date.now()}-${item.id}`,
                itemId: item.id,
                itemName: item.name,
                itemIcon: item.icon || '',
                buyPrice: item.buyPrice,
                sellPrice: item.sellPrice,
                // HARD REALISM: Only capture 2% of volume (competition is high)
                quantity: Math.max(1, Math.floor(item.buysQty * 0.02)),
                entryTimestamp: now.toISOString(),
                expectedExitTimestamp: exitTime.toISOString(),
                status: 'active',
                roiEstimate: item.roi,
                liquidityScore: item.liquidityScore || 0
              });
            }
          });

          // SELF-CLEANING: Purge stale or low-probability shadow orders
          if (activePositions.length > 20) activePositions.splice(20);
        }

        set({ shadowPositions: activePositions });
        if (resolvedPositions.length > 0) evolveLogic();
      },

      evolveLogic: () => {
        const { condensedMemory, scoringDNA } = get();
        const memoryEntries = Object.entries(condensedMemory);
        if (memoryEntries.length < 5) return;

        // Profit Efficiency = (Win Value / Avg Duration)
        const efficiency = memoryEntries.reduce((sum, [_, m]) => {
           return sum + (m.value / (m.avgDuration || 1));
        }, 0) / memoryEntries.length;

        const newDNA = { ...scoringDNA, lastEvolution: new Date().toISOString() };
        
        // NEW: Autonomous Volatility Awareness
        if (efficiency > 80000) {
           get().addScoutLog("Elite Efficiency Detected: Raising Alpha Thresholds.", "alert");
           newDNA.riskTolerance = Math.min(0.95, scoringDNA.riskTolerance + 0.05);
        }

        // Shifting Weights: High efficiency (Profit/Hour) favors ROI complexity
        if (efficiency > 50000) { // High yield/hour -> optimize for even higher ROI
            newDNA.roiWeight = Math.min(0.7, scoringDNA.roiWeight + 0.02);
            newDNA.volumeWeight = Math.max(0.1, scoringDNA.volumeWeight - 0.02);
            get().addScoutLog("Neural Shift: Prioritizing ROI complexity due to high efficiency.", "brain");
        } else { // Low efficiency -> pivot back to high-volume stability
            newDNA.volumeWeight = Math.min(0.7, scoringDNA.volumeWeight + 0.02);
            newDNA.roiWeight = Math.max(0.1, scoringDNA.roiWeight - 0.02);
            get().addScoutLog("Neural Shift: Stabilizing for volume due to market drag.", "brain");
        }

        set({ scoringDNA: newDNA });
      },
      
      aiApiKey: null,
      aiModelName: 'gemini-1.5-flash',
      aiBudget: 1000,
      setAiApiKey: (key) => set({ aiApiKey: key }),
      aiFeatures: {
        marketAnalysis: true,
        askAi: true,
        dailyPlan: true,
        investmentAdvice: true
      },
      toggleAiFeature: (feature) => set({
        aiFeatures: { ...get().aiFeatures, [feature]: !get().aiFeatures[feature] }
      }),

      relianceScore: 10,
      relianceStrategy: 'supervised',

      evaluateAIDecision: (isBetter, scoreDelta = 1) => {
          const { relianceScore } = get();
          const newScore = Math.max(0, Math.min(100, relianceScore + (isBetter ? scoreDelta : -scoreDelta * 2)));
          
          let newStrategy: AccountState['relianceStrategy'] = 'supervised';
          if (newScore >= 90) newStrategy = 'autonomous';
          else if (newScore >= 40) newStrategy = 'competitive';

          set({ relianceScore: newScore, relianceStrategy: newStrategy });
      },

      addRealLearningData: (xp, tradeCount = 0) => {
        const { realMaturityLevel, realLearningProgress } = get();
        let newLevel = realMaturityLevel;
        let newProgress = realLearningProgress + xp;
        
        while (newProgress >= 100) {
          newProgress -= 100;
          newLevel++;
        }
        
        set((state) => ({ 
          realMaturityLevel: newLevel, 
          realLearningProgress: newProgress,
          completedTrades: state.completedTrades + tradeCount
        }));
      },

      addSimLearningData: (xp, profit, pos) => {
        const { simMaturityLevel, simLearningProgress, simulatedTrades, virtualWallet } = get();
        
        let currentLvl = simMaturityLevel;
        let req = 100 * currentLvl; 
        let currentRaw = (simLearningProgress / 100) * req;
        let totalRaw = currentRaw + xp;
        
        while (totalRaw >= req) {
           totalRaw -= req;
           currentLvl++;
           req = 100 * currentLvl;
        }
        
        let newPercentage = (totalRaw / req) * 100;

        // GRIT REALISM: Linking fill success to actual liquidity
        // High liquidity (popular items) = Harder to catch orders (high competition)
        // low liquidity = Orders sit forever (unfillable)
        const liquidityFactor = (pos.liquidityScore || 50) / 100;
        const fillChance = Math.random();
        
        // Popular items have 70% fail rate due to competition
        // Unpopular items have 90% fail rate because nobody is insta-buying/selling
        const success = liquidityFactor > 0.8 ? (fillChance > 0.7) : (fillChance > 0.9);
        
        const adjustedProfit = success ? Math.floor(profit * 0.6) : 0; 
        if (success) {
           get().addScoutLog(`Simulated Fill: ${pos.itemName} (+${Math.round(profit/10000)}g)`, "info");
        }

        set({
          simLearningProgress: newPercentage,
          simMaturityLevel: currentLvl,
          simulatedTrades: simulatedTrades + 1,
          virtualWallet: Math.min(100000000, virtualWallet + adjustedProfit) // Cap at 10k Gold
        });
      },

      lastProcessedBuyId: 0,
      lastProcessedSellId: 0,
      tradeNotifications: [],
      clearNotifications: () => set({ tradeNotifications: [] }),

      syncTradingPost: async () => {
         const { apiKey, reconcilePositions, lastProcessedBuyId, lastProcessedSellId, tradeNotifications } = get();
         if (!apiKey) return;
         try {
            const [hBuys, hSells, cSells, cBuys] = await Promise.all([
               api.getTransactionHistory(apiKey, 'buys', 'history').catch(() => []),
               api.getTransactionHistory(apiKey, 'sells', 'history').catch(() => []),
               api.getTransactionHistory(apiKey, 'sells', 'current').catch(() => []),
               api.getTransactionHistory(apiKey, 'buys', 'current').catch(() => [])
            ]);

            const { toast } = await import('react-toastify');
            const newNotifs = [...tradeNotifications];
            let updateLastBuyId = lastProcessedBuyId;
            let updateLastSellId = lastProcessedSellId;
            
            const newSells = hSells.filter((s: any) => s.id > lastProcessedSellId);
            if (newSells.length > 0) {
              updateLastSellId = Math.max(...newSells.map((s: any) => s.id));
              if (lastProcessedSellId > 0) {
                let msg = '';
                if (newSells.length === 1) {
                  const item = await api.getItem(newSells[0].item_id).catch(() => null);
                  msg = `Sold 1x ${item?.name || 'item'} for ${(newSells[0].price / 10000).toFixed(2)}g!`;
                } else {
                  const total = newSells.reduce((acc: number, s: any) => acc + (s.price * s.quantity), 0);
                  msg = `Market Sale: ${newSells.length} items sold for ${(total / 10000).toFixed(2)}g total!`;
                }
                toast.success(msg);
                newNotifs.unshift({ id: `sell-${updateLastSellId}`, type: 'sell', message: msg, timestamp: new Date().toISOString() });
              }
            }

            const newBuys = hBuys.filter((b: any) => b.id > lastProcessedBuyId);
            if (newBuys.length > 0) {
              updateLastBuyId = Math.max(...newBuys.map((b: any) => b.id));
              if (lastProcessedBuyId > 0) {
                let msg = '';
                if (newBuys.length === 1) {
                  const item = await api.getItem(newBuys[0].item_id).catch(() => null);
                  msg = `Buy order filled: Got 1x ${item?.name || 'item'}!`;
                } else {
                  msg = `Inventory Update: ${newBuys.length} buy orders filled.`;
                }
                toast.info(msg);
                newNotifs.unshift({ id: `buy-${updateLastBuyId}`, type: 'buy', message: msg, timestamp: new Date().toISOString() });
              }
            }

            set({ 
              lastProcessedBuyId: updateLastBuyId, 
              lastProcessedSellId: updateLastSellId,
              tradeNotifications: newNotifs.slice(0, 20)
            });

            reconcilePositions(hBuys, hSells, cSells, cBuys);
         } catch (e) {
            console.error("TP Sync error", e);
         }
      },

      reconcilePositions: (historyBuys, historySells, currentSells, currentBuys) => {
          const { positions, updatePosition, condensedMemory, evolveLogic } = get();
          let evolved = false;

          positions.forEach(pos => {
            const activeSellOrder = currentSells.find((s: any) => s.item_id == pos.itemId);
            const activeBuyOrder = currentBuys.find((b: any) => b.item_id == pos.itemId);

            if (activeSellOrder) {
                updatePosition(pos.itemId, { 
                  status: 'active', 
                  type: 'sell', 
                  sellPrice: activeSellOrder.price,
                  quantity: activeSellOrder.quantity 
                });
                return;
            }

            if (activeBuyOrder) {
                updatePosition(pos.itemId, { 
                  status: 'active', 
                  type: 'buy', 
                  buyPrice: activeBuyOrder.price,
                  quantity: activeBuyOrder.quantity,
                  originalQuantity: pos.originalQuantity || activeBuyOrder.quantity
                });
                return;
            }

            if (pos.type === 'buy' && pos.status === 'active') {
                const matchHistory = historyBuys.find(h => 
                   h.item_id == pos.itemId && 
                   (new Date(h.purchased || h.created).getTime() > new Date(pos.timestamp).getTime())
                );

                if (matchHistory) {
                   updatePosition(pos.itemId, {
                      type: 'sell',
                      status: 'holding',
                      buyPrice: matchHistory.price,
                      quantity: matchHistory.quantity
                   });
                }
                return;
            }

            if (pos.type === 'sell' && pos.status === 'active') {
                const matchHistory = historySells.find(h => 
                   h.item_id == pos.itemId && 
                   (new Date(h.purchased || h.created).getTime() > new Date(pos.timestamp).getTime())
                );

                if (matchHistory) {
                   const profit = (matchHistory.price * 0.85) - pos.buyPrice;
                   
                   const memKey = `real:${pos.itemId}`;
                   const currentMem = condensedMemory[memKey] || { wins: 0, value: 0, avgDuration: 0 };
                   const duration = pos.timestamp ? (new Date(matchHistory.purchased || matchHistory.created).getTime() - new Date(pos.timestamp).getTime()) / (1000 * 60 * 60) : 1;

                   set((state) => ({
                      condensedMemory: {
                        ...state.condensedMemory,
                        [memKey]: {
                          wins: currentMem.wins + 1,
                          value: (currentMem.value + profit) / 2,
                          avgDuration: (currentMem.avgDuration || 0 + duration) / 2
                        }
                      }
                   }));

                   updatePosition(pos.itemId, {
                      status: 'completed',
                      sellPrice: matchHistory.price,
                      sellTimestamp: matchHistory.purchased || matchHistory.created,
                      realizedProfit: profit * matchHistory.quantity
                   });
                   evolved = true;
                }
                return;
            }
          });
          
          if (evolved) evolveLogic();
      },

      clearMemory: () => set({ condensedMemory: {} }),
      
      resetAll: () => set({
        positions: [],
        shadowPositions: [],
        realMaturityLevel: 1,
        realLearningProgress: 0,
        completedTrades: 0,
        simMaturityLevel: 1,
        simLearningProgress: 0,
        simulatedTrades: 0,
        virtualWallet: 1000000,
        scoutActivity: [{ message: "System Reboot: All tactical data purged.", type: "alert", timestamp: new Date().toISOString() }],
        condensedMemory: {},
        lastProcessedBuyId: 0,
        lastProcessedSellId: 0,
        tradeNotifications: [],
        relianceScore: 10,
        relianceStrategy: 'supervised'
      }),
    }),
    {
      name: 'gw2-account-storage',
      partialize: (state) => ({ 
        apiKey: state.apiKey,
        pinnedIds: state.pinnedIds,
        investmentLimit: state.investmentLimit,
        positions: state.positions,
        investmentPlans: state.investmentPlans,
        aiEnabled: state.aiEnabled,
        realMaturityLevel: state.realMaturityLevel,
        realLearningProgress: state.realLearningProgress,
        completedTrades: state.completedTrades,
        simMaturityLevel: state.simMaturityLevel,
        simLearningProgress: state.simLearningProgress,
        simulatedTrades: state.simulatedTrades,
        virtualWallet: state.virtualWallet,
        shadowPositions: state.shadowPositions,
        condensedMemory: state.condensedMemory,
        scoringDNA: state.scoringDNA,
        aiApiKey: state.aiApiKey,
        aiFeatures: state.aiFeatures,
        relianceScore: state.relianceScore,
        relianceStrategy: state.relianceStrategy
      }),
    }
  )
);
