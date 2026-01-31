import React, { useEffect } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { useMarketStore } from '../store/useMarketStore';

export const SimulationEngine: React.FC = () => {
  const { 
    virtualWallet, 
    activeSimulations, 
    updateActiveSimulations, 
    addSimLearningData,
    simMaturityLevel
  } = useAccountStore();
  
  const { items } = useMarketStore();

  useEffect(() => {
    // Run simulation loop every 5 seconds
    const interval = setInterval(() => {
      // 1. Process active simulations (Try to sell)
      if (activeSimulations.length > 0) {
        const updatedSims = activeSimulations.filter(sim => {
          const currentItem = items.find(i => i.id === sim.itemId);
          if (!currentItem) return true; // Keep tracking if item not found (maybe filtered out)

          // Check if profitable to sell
          // Sell condition: Current Sell Price > Buy Price + Fees + Target Profit
          const currentSell = currentItem.sellPrice;
          const profit = (currentSell * 0.85) - sim.buyPrice;
          const roi = (profit / sim.buyPrice) * 100;

          // Artificial hold time/randomness for realism
          const duration = Date.now() - new Date(sim.timestamp).getTime();
          const minDuration = 30000; // 30 seconds minimum hold

          if (duration > minDuration && roi > 2) {
            // "Sell"
            const totalProfit = Math.floor(profit * sim.quantity);
            addSimLearningData(10 + Math.floor(roi), totalProfit, {
              itemId: sim.itemId,
              name: sim.itemName,
              buyPrice: sim.buyPrice,
              sellPrice: currentSell,
              quantity: sim.quantity,
              profit: totalProfit,
              timestamp: new Date().toISOString(),
              duration
            });
            // Remove from active
            return false;
          }
          
          // Stop loss (optional, for now we hold)
          return true;
        });

        if (updatedSims.length !== activeSimulations.length) {
          updateActiveSimulations(updatedSims);
        }
      }

      // 2. Buy new positions (if wallet allows and slots available)
      // Max concurrent simulations increases with level
      const maxSims = 3 + (simMaturityLevel * 2); 
      
      if (activeSimulations.length < maxSims && items.length > 0) {
        // Find a candidate
        // Randomly pick from top ROI items to simulate AI "finding" deals
        const candidates = items
          .filter(i => i.roi > 10 && i.buysQty > 100) // Basic filters
          .slice(0, 20); // Top 20

        if (candidates.length > 0) {
          const target = candidates[Math.floor(Math.random() * candidates.length)];
          
          // Don't buy if already simulating this item
          if (!activeSimulations.find(s => s.itemId === target.id)) {
            const qty = Math.min(250, Math.floor((virtualWallet * 0.1) / target.buyPrice)); // Use 10% of wallet

            if (qty > 0) {
              const newSim = {
                id: Math.random().toString(36).substr(2, 9),
                itemId: target.id,
                itemName: target.name,
                buyPrice: target.buyPrice,
                quantity: qty,
                timestamp: new Date().toISOString()
              };
              
              updateActiveSimulations([...activeSimulations, newSim]);
            }
          }
        }
      }

    }, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, [items, activeSimulations, virtualWallet, simMaturityLevel]);

  return null; // Headless component
};
