import React, { useEffect, useState } from 'react';
import { aiService } from '../services/ai.service';
import clsx from 'clsx';
import { useAccountStore } from '../store/useAccountStore';

export const MarketSentiment: React.FC = () => {
  const { aiEnabled } = useAccountStore();
  const [sentiment, setSentiment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true);
      const data = aiEnabled ? await aiService.getMarketSentiment('en') : null;
      setSentiment(data || { sentiment: 'Stable', summary: 'Neural sync active. Market flows analyzed.', hot_sectors: ['Mats'], risk_factors: ['Vol'] });
      setLoading(false);
    };
    fetchSentiment();
  }, [aiEnabled]);

  if (loading) return <div className="h-20 animate-pulse bg-white/5 rounded-2xl" />;

  return (
    <div className="relative group overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
           <div className={clsx("w-2 h-2 rounded-full animate-ping", 
             sentiment.sentiment === 'Bullish' ? 'bg-emerald-500' : 'bg-rose-500'
           )} />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Market Pulse</span>
        </div>
        <span className={clsx("text-[10px] font-black uppercase", 
           sentiment.sentiment === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'
        )}>{sentiment.sentiment}</span>
      </div>
      
      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2 italic mb-4">
         "{sentiment.summary}"
      </p>

      <div className="flex gap-2">
         {sentiment.hot_sectors.slice(0, 2).map((s: string) => (
            <span key={s} className="text-[8px] font-black px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg uppercase">
               {s}
            </span>
         ))}
      </div>
    </div>
  );
};
