import React, { useEffect } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { api } from '../services/api.service';
import { learningService } from '../services/learning.service';
import { CurrencyDisplay } from './CurrencyDisplay';
import { Wallet, User, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const AccountOverview: React.FC = () => {
  const { 
    apiKey, 
    isValid, 
    accountData, 
    wallet, 
    addRealLearningData, 
    updateMemory
  } = useAccountStore();
  
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';




  // Real Learning Loop (History)
  useEffect(() => {
    if (apiKey && isValid) {
      const learn = async () => {
        const result = await learningService.learnFromHistory(apiKey);
        addRealLearningData(result.xp, result.trades);
        updateMemory(result.memory);
      };
      learn();
      const interval = setInterval(learn, 300000); // 5 mins
      return () => clearInterval(interval);
    }
  }, [apiKey, isValid]);

  // TP Sync Loop (Positions & Orders)
  const { syncTradingPost } = useAccountStore();
  useEffect(() => {
    if (apiKey && isValid) {
      syncTradingPost();
      const interval = setInterval(syncTradingPost, 60000); // 1 min sync
      return () => clearInterval(interval);
    }
  }, [apiKey, isValid]);

  // Simulation Loop (AI Shadow Trading)
  useEffect(() => {
    const simulate = async () => {
            const { activeSimulations, updateActiveSimulations, addSimLearningData, condensedMemory } = useAccountStore.getState();

            try {
                const ids = await api.getMarketScoutItems();
                const items = await api.getItems(ids.slice(0, 50));
                const prices = await api.getPrices(ids.slice(0, 50));
                const marketItems = items.map(i => {
                    const p = prices.find(pr => pr.id === i.id);
                    return { ...i, ...p, profitPerUnit: 0, roi: 0, priorityScore: 0 }; 
                });
                
                marketItems.forEach((i: any) => {
                    const sell = i.sells?.unit_price || 0;
                    const buy = i.buys?.unit_price || 0;
                    if (buy > 0) {
                        i.roi = ((sell * 0.85 - buy) / buy) * 100;
                        i.priorityScore = i.roi;
                    }
                });

                const result = learningService.runSimulation(marketItems, activeSimulations, condensedMemory);
                updateActiveSimulations(result.updatedSims);

            if (result.xp > 0 || result.profit > 0) {
                addSimLearningData(result.xp, result.profit, result.completedTrade);
            }
        } catch (e) { console.error("Sim error", e); }
    };
    
    const interval = setInterval(simulate, 30000);
    return () => clearInterval(interval);
  }, []);


  const goldCurrency = wallet.find((c: any) => c.id === 1)?.value || 0;

  return (
    <div className={clsx("glass-card p-5 mb-8 border-l-4 border-indigo-500 overflow-hidden relative", isAr && "rtl font-arabic text-right")}>
      <div className={clsx("flex justify-between items-start", isAr && "flex-row-reverse")}>
        <div className={clsx("flex items-center gap-5", isAr && "flex-row-reverse")}>
          <div className={clsx(
            "p-3 rounded-xl transition-all duration-500",
            isValid ? "bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "bg-slate-800 text-slate-500"
          )}>
            <User size={28} />
          </div>
          <div>
            {accountData ? (
              <div className="animate-in fade-in slide-in-from-left duration-700">
                <div className={clsx("flex items-center gap-2 mb-1", isAr && "flex-row-reverse")}>
                  <h2 className="font-bold text-xl text-slate-100 tracking-tight">{accountData.name}</h2>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase">
                    Rank {accountData.wvw_rank || 'N/A'}
                  </span>
                </div>
                <div className={clsx("flex flex-wrap items-center gap-x-4 gap-y-1 text-sm", isAr && "flex-row-reverse")}>
                  <span className="flex items-center gap-1.5 text-profit-400 font-medium">
                    <CheckCircle size={14} /> {isAr ? 'الارتباط نشط' : 'Link Active'}
                  </span>
                  <span className="flex items-center gap-1.5 text-gold-400 font-mono">
                    <Wallet size={14} /> <CurrencyDisplay amount={goldCurrency} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="opacity-70">
                <h2 className="font-bold text-lg text-slate-300">{isAr ? 'الحساب مقيد' : 'Account Restricted'}</h2>
                <p className="text-xs text-slate-500">{isAr ? 'قدم مفتاح API لفتح البيانات المخصصة.' : 'Provide an API key to unlock personalized data.'}</p>
              </div>
            )}
          </div>
        </div>

        <div className={clsx("flex gap-3", isAr && "flex-row-reverse")}>
           {/* Space reserved for future buttons */}
        </div>
      </div>




      {isValid && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl pointer-events-none rounded-full" />
      )}
    </div>
  );
};
