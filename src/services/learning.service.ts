import { api } from './api.service';

class LearningService {
  /**
   * Learns from detailed trade history.
   * Calculates 'Real Velocity' (how fast you actually flip items).
   */
  async learnFromHistory(apiKey: string): Promise<{ xp: number; trades: number; memory: Record<string, { wins: number; value: number; avgDuration: number }> }> {
    try {
      const buyHist = await api.getTransactionHistory(apiKey, 'buys', 'history');
      const sellHist = await api.getTransactionHistory(apiKey, 'sells', 'history');

      if (!buyHist.length) return { xp: 0, trades: 0, memory: {} };

      let learningPoints = 0;
      let successfulTrades = 0;
      const memory: Record<string, { wins: number; value: number; avgDuration: number }> = {};

      const sellMap = new Map<number, any[]>();
      sellHist.forEach(s => {
        if (!sellMap.has(s.item_id)) sellMap.set(s.item_id, []);
        sellMap.get(s.item_id)?.push(s);
      });

      buyHist.slice(0, 200).forEach(buy => {
        const potentialSells = sellMap.get(buy.item_id) || [];
        // Find the closest sell occurring AFTER the buy
        const matchingSell = potentialSells
          .filter(s => new Date(s.purchased) > new Date(buy.purchased))
          .sort((a, b) => new Date(a.purchased).getTime() - new Date(b.purchased).getTime())[0];
        
        if (matchingSell) {
          const profit = (matchingSell.price * 0.85) - buy.price;
          const duration = new Date(matchingSell.purchased).getTime() - new Date(buy.purchased).getTime();
          
          if (!memory[buy.item_id]) {
            memory[buy.item_id] = { wins: 0, value: 0, avgDuration: 0 };
          }

          if (profit > 0) {
            learningPoints += 10;
            successfulTrades++;
            memory[buy.item_id].wins += 1;
            memory[buy.item_id].value = (memory[buy.item_id].value + profit) / 2;
            
            // Rolling average execution speed (Calibration Point)
            const currentAvg = memory[buy.item_id].avgDuration || duration;
            memory[buy.item_id].avgDuration = (currentAvg + duration) / 2;
          } else {
            learningPoints += 2;
          }
        }
      });

      return { xp: learningPoints, trades: successfulTrades, memory };
    } catch (err) {
      console.error('Learning Engine Failure:', err);
      return { xp: 1, trades: 0, memory: {} };
    }
  }

  /**
   * REALISTIC MARKET SIMULATION ENGINE
   * Uses Supply/Demand pressure and Real History Calibration.
   */
  runSimulation(marketItems: any[], activeSims: any[], memory: Record<string, any> = {}): { xp: number; profit: number; trades: number; updatedSims: any[]; completedTrade?: any } {
    let xp = 0;
    let totalProfit = 0;
    let trades = 0;
    let completedTrade = null;
    const now = Date.now();

    const updatedSims = activeSims.map(sim => {
        const currentItem = marketItems.find(i => i.id === sim.itemId);
        // If API data missing, assume 'Stalled' state, no updates
        if (!currentItem) return sim;

        // CALIBRATION: Check if we have real experience with this item
        const realStats = memory[sim.itemId];
        const calibrationFactor = realStats ? 0.8 : 1.0; // If we know this item, we trade 20% faster/better
        
        const updatedSim = { ...sim };
        
        // --- 1. BUYING PHASE ---
        if (updatedSim.status === 'PENDING_BUY') {
            if (!updatedSim.expectedBuyFill) {
                // Calculation: High Demand (BuysQty) = Slower Fill (Competition). Low Supply = Slower Fill (No sellers).
                // Base: 5 mins.
                const demandPenalty = Math.log10(currentItem.buysQty || 10) * 60000; // More buyers = wait longer
                let estimatedTime = 300000 + demandPenalty; 
                
                // Calibrate with real history if available
                if (realStats && realStats.avgDuration) {
                   // Buying usually takes ~40% of the total flip time? Let's guess
                   estimatedTime = (realStats.avgDuration * 0.4 + estimatedTime) / 2;
                }

                updatedSim.expectedBuyFill = now + (estimatedTime * Math.random() * calibrationFactor);
            }

            if (now >= updatedSim.expectedBuyFill) {
                updatedSim.status = 'BOUGHT';
                updatedSim.boughtAt = now;
                // Realistic Price: We probably had to bid +1c over current max buy
                updatedSim.price = (currentItem.buys?.unit_price || sim.price) + 1; 
                updatedSim.buyDuration = now - updatedSim.timestamp;
            }
            return updatedSim;
        }

        // --- 2. PROCESSING PHASE ---
        if (updatedSim.status === 'BOUGHT') {
            // "Walking to the Trading Post" -> 30s to 2 mins
            if (now - updatedSim.boughtAt > (60000 * Math.random())) {
                updatedSim.status = 'LISTED';
                updatedSim.listedAt = now;
                updatedSim.initialListPrice = currentItem.sells?.unit_price ? currentItem.sells.unit_price - 1 : updatedSim.price * 1.2;
                updatedSim.currentListPrice = updatedSim.initialListPrice;
                
                // Sell Speed Calculation
                // High Supply (SellsQty) = Massive Competition = Slow Sell
                const supplyPenalty = Math.log10(currentItem.sellsQty || 10) * 120000; // 2 mins per log factor
                let sellTime = 300000 + supplyPenalty;

                if (realStats && realStats.avgDuration) {
                    sellTime = (realStats.avgDuration * 0.6 + sellTime) / 2;
                }
                
                updatedSim.expectedSellFill = now + (sellTime * Math.random() * calibrationFactor);
            }
            return updatedSim;
        }

        // --- 3. SELLING PHASE (With Undercut Logic) ---
        if (updatedSim.status === 'LISTED') {
            // UNDERCUT CHECK: Every tick, 10% chance to be undercut
            if (Math.random() < 0.1) {
                const currentLowest = currentItem.sells?.unit_price || Infinity;
                if (currentLowest < updatedSim.currentListPrice) {
                    // We are undercut. Logic:
                    // 1. Relist? (Fees!) -> Simulates shrinking profit
                    // 2. Wait? -> Extends fill time
                    
                    // Simple Sim: We Relist, losing 5% listing fee effectiveness (profit margin shrinks)
                    updatedSim.currentListPrice = currentLowest - 1;
                    updatedSim.relistCount = (updatedSim.relistCount || 0) + 1;
                    // Reset timer partly
                    updatedSim.expectedSellFill += 60000; 
                }
            }

            if (now >= updatedSim.expectedSellFill) {
                // FINAL PROFIT CALCULATION (Realistic Taxes)
                // Gross Sales = Unit Price * Qty
                // Listing Fee = 5% of Listing Price (Paid upfront or on relist, here we sum it)
                // Exchange Fee = 10% of Sold Price (Deducted on sale)
                
                const grossSales = updatedSim.currentListPrice * updatedSim.qty;
                const exchangeFee = Math.ceil(grossSales * 0.10);
                const listingFee = Math.ceil((updatedSim.initialListPrice * updatedSim.qty) * 0.05);
                const relistFees = (updatedSim.relistCount || 0) * Math.ceil((updatedSim.currentListPrice * updatedSim.qty) * 0.05);
                
                // Total Taxes
                const totalFees = exchangeFee + listingFee + relistFees;
                
                // Net Revenue
                const netRevenue = grossSales - totalFees;
                const totalCost = updatedSim.price * updatedSim.qty;
                const totalProfitVal = netRevenue - totalCost;

                updatedSim.status = 'SOLD';
                updatedSim.soldPrice = updatedSim.currentListPrice;
                updatedSim.profit = totalProfitVal;
                updatedSim.soldAt = now;
                updatedSim.sellDuration = now - updatedSim.listedAt;

                // XP Calculation: Balanced
                // Win = 20 XP. Loss = 2 XP.
                xp += totalProfitVal > 0 ? 20 : 2;
                totalProfit += totalProfitVal;
                trades += 1;
                completedTrade = updatedSim;
            }
        }

        return updatedSim;
    });

    const ongoingSims = updatedSims.filter(s => s.status !== 'SOLD');

    // New Opportunities (Conservative)
    const opportunities = marketItems.filter(i => {
       const spread = i.sells?.unit_price && i.buys?.unit_price 
          ? ((i.sells.unit_price * 0.85 - i.buys.unit_price) / i.buys.unit_price) * 100 
          : 0;
       return spread > 15 && i.buysQty > 50; // Real liquidity check
    });
    
    if (ongoingSims.length < 5 && opportunities.length > 0) {
        const choice = opportunities[Math.floor(Math.random() * opportunities.length)];
        if (!ongoingSims.some(s => s.itemId === choice.id)) {
            ongoingSims.push({
                id: `${choice.id}-${now}`, 
                itemId: choice.id,
                itemName: choice.name,
                price: choice.buys?.unit_price || 0,
                qty: 250,
                timestamp: now,
                status: 'PENDING_BUY',
                expectedBuyFill: null
            });
            xp += 5; 
        }
    }

    return { xp, profit: totalProfit, trades, updatedSims: ongoingSims, completedTrade };
  }
}

export const learningService = new LearningService();
