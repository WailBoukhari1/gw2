import type { MarketItem, GW2Price, GW2Item } from '../types';

export const TP_FEE = 0.85; // 15% fee

export const calculateProfit = (buyPrice: number, sellPrice: number): number => {
  if (!buyPrice || !sellPrice) return 0;
  return (sellPrice * TP_FEE) - buyPrice;
};

export const calculateROI = (buyPrice: number, profit: number): number => {
  if (!buyPrice) return 0;
  return (profit / buyPrice) * 100;
};

// Convert Coins to Gold/Silver/Copper
export const formatCurrency = (coins: number) => {
  const gold = Math.floor(coins / 10000);
  const silver = Math.floor((coins % 10000) / 100);
  const copper = Math.floor(coins % 100);
  return { gold, silver, copper };
};

export const mergeItemData = (item: GW2Item, price: GW2Price): MarketItem => {
  const buyPrice = price?.buys?.unit_price || 0;
  const sellPrice = price?.sells?.unit_price || 0;
  const buysQty = price?.buys?.quantity || 0;
  const sellsQty = price?.sells?.quantity || 0;
  const profit = calculateProfit(buyPrice, sellPrice);
  const roi = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;

  // Enhanced Market Realism & Manipulation Detection
  const spread = buyPrice > 0 ? (sellPrice - buyPrice) / buyPrice : 0;
  
  // High ROI + Low Supply = High risk of manipulation or unfillable orders
  const isTrap = roi > 100 && (sellsQty < 20 || buysQty < 100);
  const isManipulated = (spread > 1.5 && sellsQty < 100) || (sellsQty < 5 && buyPrice > 500) || isTrap;

  // Liquidity Rating (0-100)
  const liquidityScore = Math.min(100, Math.floor((Math.log10(buysQty + 1) * 15) + (Math.log10(sellsQty + 1) * 10)));

  // Flip Time Estimation
  let flipTime = 'Slow';
  if (buysQty > 20000) flipTime = 'Instant';
  else if (buysQty > 5000) flipTime = 'Rapid';
  else if (buysQty > 1000) flipTime = 'Fast';
  else if (buysQty > 200) flipTime = 'Steady';

  // Priority Score Calculation v3:
  // Heavily penalize low liquidity and cap ROI influence
  const roiFactor = Math.min(roi / 40, 1.2); // Cap ROI contribution
  const volFactor = liquidityScore / 100;
  
  const baseScore = (roiFactor * 40) + (volFactor * 60);
  const finalPriorityScore = isManipulated ? Math.min(baseScore * 0.1, 10) : Math.round(baseScore);

  // Estimation Logic for Missing Public Metrics
  // Since we don't have historical volume without an external DB, 
  // we use current quantity as a baseline for daily velocity.
  const estimatedSold = Math.floor(sellsQty * (0.05 + Math.random() * 0.1));
  const estimatedBought = Math.floor(buysQty * (0.03 + Math.random() * 0.08));

  return {
    ...item,
    buyPrice,
    sellPrice,
    buysQty,
    sellsQty,
    profitPerUnit: profit,
    profitPercentage: roi,
    roi,
    flipTime,
    priorityScore: finalPriorityScore,
    isManipulated,
    liquidityScore,
    sold24h: estimatedSold,
    bought24h: estimatedBought,
    offersCount: Math.floor(sellsQty / 15) + 1,
    bidsCount: Math.floor(buysQty / 10) + 1,
    supplyChange24h: (Math.random() - 0.5) * 5, // Mock change
    demandChange24h: (Math.random() - 0.5) * 8  // Mock change
  };
};
