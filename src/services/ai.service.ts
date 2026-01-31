import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MarketItem } from "../types";
import { config } from "../config";
import { useAccountStore } from "../store/useAccountStore";

const getApiKey = () => {
  return useAccountStore.getState().aiApiKey || config.gemini.apiKey;
};

let genAI: GoogleGenerativeAI | null = null;
let currentKey: string | null = null;

const getAI = () => {
    const key = getApiKey();
    if (!key) return null;
    
    if (!genAI || currentKey !== key) {
        try {
            // Explicitly set apiVersion to 'v1' (not v1beta) for standard models
            genAI = new GoogleGenerativeAI(key);
            currentKey = key;
        } catch (e) {
            console.error("Failed to initialize AI", e);
            genAI = null;
        }
    }
    return genAI;
};

export const aiService = {
  setApiKey(_key: string) {
    // Legacy support, store updates handle this via getApiKey()
  },

  async analyzeItem(item: MarketItem, _listings?: any, _investmentLimit?: number) {
    if (!useAccountStore.getState().aiFeatures.askAi) return { recommendation: "Disabled", reasoning: "Feature disabled in settings." };

    // 1. Calculate History Context upfront for both AI and Fallback
    const { positions } = useAccountStore.getState();
    const pastTrades = positions.filter(p => p.itemId === item.id && p.status === 'completed');
    
    let historyContext = "";
    if (pastTrades.length > 0) {
      const avgDurationMs = pastTrades.reduce((sum, p) => {
          const start = new Date(p.timestamp).getTime();
          const end = p.sellTimestamp ? new Date(p.sellTimestamp).getTime() : Date.now();
          return sum + (end - start);
      }, 0) / pastTrades.length;
      
      const avgHours = Math.round(avgDurationMs / (1000 * 60 * 60));
      historyContext = avgHours < 24 
          ? ` (You avg ${avgHours}h flip time)` 
          : ` (Historically slow: ${Math.round(avgHours/24)}d avg hold)`;
    }
    
    const ai = getAI();

    if (!ai) {
      if (import.meta.env.DEV) {
        return {
          recommendation: item.roi > 20 ? "Buy" : "Avoid",
          risk_level: item.sellsQty < 50 ? "High" : "Low",
          reasoning: "Mock: High spread detected. Consider as a Slow Burn.",
          predicted_trend: "Stable",
          velocity: "Medium",
          suggested_qty: 250,
          fill_chance_buy: 75,
          fill_chance_sell: 60
        };
      }
      return { recommendation: "API Key Missing" };
    }

    try {
      // Cascading models for resilience (Flash is cheaper/faster, Pro is smarter)
      // Note: gemini-1.5-flash and gemini-1.5-pro are best used with v1beta
      const models = [
        { name: "gemini-1.5-flash-latest", version: 'v1beta' },
        { name: "gemini-1.5-flash", version: 'v1' },
        { name: "gemini-1.5-flash-8b", version: 'v1beta' },
        { name: "gemini-1.5-pro-latest", version: 'v1beta' },
        { name: "gemini-1.0-pro", version: 'v1' }
      ];
      
      let result = null;
      let lastError: any = null;

      for (const m of models) {
        try {
          const api = getAI();
          if (!api) break;

          const model = api.getGenerativeModel({ model: m.name }, { apiVersion: m.version });
          const prompt = `
            Analyze this GW2 market trade:
            Item: ${item.name}
            Market: Buy ${item.buyPrice}c, Sell ${item.sellPrice}c, ROI ${item.roi.toFixed(1)}%, Bids waiting: ${item.buysQty}, Listings waiting: ${item.sellsQty}.
            Personal History: ${historyContext || "None"}
            Focus: Predicting "Instant Trade" reliability. High Bids = High chance of fill when you bid.
            Return JSON format only: 
            {"recommendation":"Buy"|"Avoid","strategy":"Short Term"|"Wait","risk_level":"Low"|"Med"|"High","reasoning":"string","velocity":"string","suggested_qty":number,"target_sell_time":"string","fill_chance_buy":number,"fill_chance_sell":number}
          `;
          
          result = await model.generateContent(prompt);
          if (result) break;
        } catch (e: any) {
          lastError = e;
          if (e.message?.includes('429')) {
             console.warn("AI Rate limited, switching to local analysis.");
             break; 
          }
          console.warn(`Model ${m.name} (${m.version}) failed: ${e.message || 'Error'}`);
          if (e.message?.includes('ERR_NAME_NOT_RESOLVED')) break;
        }
      }

      if (!result) throw lastError || new Error("All AI models failed");

      const response = await result.response;
      const text = response.text();
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error: any) {
      // SMART FALLBACK: If AI is restricted or offline, build a human-like logical reasoning
      const isGood = item.roi > 20 && item.buysQty > 100;
      const isExtreme = item.roi > 400;
      
      const spreadText = `${item.roi.toFixed(0)}% ${item.roi > 50 ? "aggressive" : "stable"} margin`;
         
      const volText = `with ${item.buysQty > 1000 ? "excellent liquidity" : "sufficient turnover"}`;

      const verdict = isExtreme
         ? "Caution: Potential price jump detected. Check price history."
         : (isGood 
            ? `Supportive data found for ${spreadText} ${volText}.`
            : "Market indicators suggest waiting. Data is too thin.");

      // Predictive fill rates based on depth
      const buyFill = Math.min(Math.round((item.buysQty / 1000) * 100), 95);
      const sellFill = Math.min(Math.round((item.sellsQty / 1000) * 100), 90);

      return { 
        recommendation: isGood && !isExtreme ? "Buy" : "Watch", 
        strategy: isGood ? "Active Flip" : "Monitoring",
        risk_level: isExtreme ? "High" : (item.buysQty < 300 ? "Med" : "Low"), 
        reasoning: `[HYBRID LOGIC] ${verdict}${historyContext}`,
        velocity: item.buysQty > 1000 ? "High" : "Moderate",
        suggested_qty: isGood ? 250 : 0,
        target_sell_time: "Depends on volume",
        fill_chance_buy: buyFill,
        fill_chance_sell: sellFill
      };
    }
  },

  async getMarketSentiment(lang: string = 'en') {
    if (!useAccountStore.getState().aiFeatures.marketAnalysis) return null;

    const isAr = lang === 'ar';
    const langInstruction = isAr ? "Respond ONLY in Arabic." : "Respond in English.";
    const ai = getAI();

    if (!ai) return this.getMockSentiment(isAr);

    try {
      const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
      let result = null;

      for (const modelName of models) {
        try {
          const model = ai.getGenerativeModel({ model: modelName }, { apiVersion: 'v1beta' });
          const prompt = `Guild Wars 2 market report. ${langInstruction} Return JSON: {"sentiment":"Bullish"|"Bearish"|"Neutral","summary":"string","hot_sectors":["string"],"risk_factors":["string"]}`;
          result = await model.generateContent(prompt);
          if (result) break;
        } catch (e) {
          console.warn(`Sentiment Model ${modelName} failed`);
        }
      }

      if (!result) return this.getMockSentiment(isAr);
      
      const response = await result.response;
      const text = response.text();
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error("Sentiment Analysys failed", error);
      return this.getMockSentiment(isAr);
    }
  },

  getMockSentiment(isAr: boolean) {
    return {
      sentiment: isAr ? "متفائل (محاكاة)" : "Bullish (Simulated)",
      summary: isAr ? "[محاكاة] السوق مستقر حاليا مع طلب قوي على المواد الأساسية." : "[Simulation] Market is currently stable with strong demand for core materials.",
      hot_sectors: isAr ? ["المواد الخام", "زخارف الجيل الثالث"] : ["Raw Materials", "Gen 3 Legendaries"],
      risk_factors: isAr ? ["تعديلات القيمة"] : ["Balance patch speculation"]
    };
  },

  async getDailyTradePlan(topItems: MarketItem[], lang: string = 'en') {
    if (!useAccountStore.getState().aiFeatures.dailyPlan) return null;

    const isAr = lang === 'ar';
    const langInstruction = isAr ? "IMPORTANT: Respond ONLY in Arabic." : "Respond in English.";
    const ai = getAI();
    
    const getMockPlan = () => ({
      safe_bets: [
        { name: topItems[0]?.name || "Ectoplasm", reason: "Stable volume and high spread.", action: "Buy at 1c above top order." },
        { name: topItems[1]?.name || "T6 Leather", reason: "Consistent demand for legendaries.", action: "Slow buy over 24h." }
      ],
      aggressive_play: { name: topItems[2]?.name || "Rare Dye", reason: "High risk, but low supply could spike prices.", action: "Flip 5 units max." },
      pro_tip: "[SIMULATION] Real AI restricted. Stick to high-volume materials for safety."
    });

    if (!ai) return getMockPlan();

    try {
      // Use v1beta for gemini-1.5 models
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });
      
      const itemData = topItems.slice(0, 8).map(i => {
        return `- ${i.name}: ROI ${i.roi.toFixed(1)}%, Buy-Sell Spread: ${i.sellPrice - i.buyPrice}, Volume (B/S): ${i.buysQty}/${i.sellsQty}, Risk: ${i.isManipulated ? 'High/Manipulated' : 'Normal'}`;
      }).join("\n");
      
      const prompt = `
        As a GW2 TP Baron, create a daily trade plan from this market data:
        ${itemData}
        
        Requirements:
        1. Select 2 "Safe Bets" (High volume, stable ROI).
        2. Select 1 "Aggressive Play" (High spread, lower volume, or trend potential).
        3. Provide a "Pro Tip" about current market dynamics.
        
        ${langInstruction}
        Return strictly JSON matching this structure:
        {"safe_bets":[{"name":"string","reason":"string","action":"string"}],"aggressive_play":{"name":"string","reason":"string","action":"string"},"pro_tip":"string"}
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const cleanText = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.warn("Trade Plan AI failed, using simulation", error);
      return getMockPlan();
    }
  },

  async analyzePosition(pos: any, currentItem: MarketItem, lang: string = 'en') {
    if (!useAccountStore.getState().aiFeatures.investmentAdvice) return null;

    const isAr = lang === 'ar';
    const langInstruction = isAr ? "IMPORTANT: Respond ONLY in Arabic." : "Respond in English.";
    const ai = getAI();
    
    const getSmartAnalysis = () => {
      // Calculate real metrics
      const currentVal = currentItem.sellPrice * 0.85; // After tax
      const profit = currentVal - pos.buyPrice;
      const roi = pos.buyPrice > 0 ? (profit / pos.buyPrice) * 100 : 0;
      
      // Time Factor
      const heldDurationMs = new Date().getTime() - new Date(pos.timestamp).getTime();
      const heldHours = Math.max(1, Math.floor(heldDurationMs / (1000 * 60 * 60))); // Avoid div by 0
      const daysHeld = Math.floor(heldHours / 24);
      
      let decision = "HOLD";
      let reasoning = "";
      let risk = "Low";

      // Logic: Prioritize Velocity. 10% in 1 hour is better than 20% in 1 month.
      
      if (roi > 20) {
        decision = "SELL";
        reasoning = `Excellent ${roi.toFixed(1)}% ROI! Capitalize on this profit now.`;
        risk = "Low - Secure the win.";
      } 
      else if (roi > 10) {
        if (heldHours < 24) {
           decision = "SELL"; // Quick flip
           reasoning = `Great velocity! ${roi.toFixed(1)}% return in under 24h. Sell to compound earnings.`;
        } else {
           decision = "HOLD"; // Maybe wait for more if it's been a while
           reasoning = `Good return (${roi.toFixed(1)}%), but considering the time held (${daysHeld}d), you might wait for a spike.`;
        }
      } 
      else if (roi > 0) {
        // Marginal profit
        if (heldHours > 72) {
           decision = "EXIT"; // Stale trade
           reasoning = `Stagnant trade (${daysHeld}d held). ROI is only ${roi.toFixed(1)}%. Recommend exiting to free up gold for faster flips.`;
           risk = "Opportunity Cost is high.";
        } else {
           decision = "HOLD";
           reasoning = `Technically profitable, but typically we target >15%. Wait for demand.`;
        }
      } 
      else {
        // Losing
        if (heldHours > 168) { // 1 Week
           decision = "EXIT";
           reasoning = `Cut losses. Held for ${daysHeld} days and still negative. Better to redeploy capital elsewhere.`;
           risk = "High - Dead capital.";
        } else {
           decision = "HOLD";
           reasoning = `Market is down, but holding is better than realizing a loss this early.`;
        }
      }

      return {
        decision,
        reasoning: reasoning, // Smart, time-aware advice
        target_price: Math.round(pos.buyPrice * 1.25),
        risk_comment: risk
      };
    };

    if (!ai) return getSmartAnalysis();

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });
      
      const prompt = `Analyze: ${pos.itemName}, Bought at: ${pos.buyPrice}, Current Sell: ${currentItem.sellPrice}. Decision SELL/HOLD/EXIT? ${langInstruction} Return JSON: {"decision":"SELL"|"HOLD"|"EXIT","reasoning":"string","target_price":number,"risk_comment":"string"}`;

      const result = await model.generateContent(prompt);
      const cleanText = (await result.response).text().replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.warn("Position AI failed, using heuristics", error);
      return getSmartAnalysis();
    }
  }
};
