import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { api } from '../services/api.service';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  RefreshCw, 
  Coins, 
  Package, 
  Clock,
  ChevronRight,
  Lock,
  Zap,
  LayoutDashboard,
} from 'lucide-react';
import { CurrencyDisplay } from '../components/CurrencyDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: number;
  item_id: number;
  price: number;
  quantity: number;
  created: string;
  purchased?: string;
  itemDetail?: any;
}

export const TradingPostPage: React.FC = () => {
  const { apiKey, isValid, syncTradingPost, wallet } = useAccountStore();
  
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  const [currentBuys, setCurrentBuys] = useState<Transaction[]>([]);
  const [currentSells, setCurrentSells] = useState<Transaction[]>([]);
  const [historyBuys, setHistoryBuys] = useState<Transaction[]>([]);
  const [historySells, setHistorySells] = useState<Transaction[]>([]);
  const [delivery, setDelivery] = useState<{ coins: number, items: any[] } | null>(null);

  const walletGold = useMemo(() => {
    return wallet.find(c => c.id === 1)?.value || 0;
  }, [wallet]);

  const fetchTPData = useCallback(async (isBackground = false) => {
    if (!apiKey || !isValid) return;
    if (!isBackground) setLoading(true);
    try {
      // Use the global store sync too so we detect notifications
      await syncTradingPost();

      const [cBuys, cSells, hBuys, hSells, deliv] = await Promise.all([
        api.getTransactionHistory(apiKey, 'buys', 'current'),
        api.getTransactionHistory(apiKey, 'sells', 'current'),
        api.getTransactionHistory(apiKey, 'buys', 'history'),
        api.getTransactionHistory(apiKey, 'sells', 'history'),
        api.getDelivery(apiKey)
      ]);

      const allIds = Array.from(new Set([
        ...(cBuys || []).map(t => t.item_id),
        ...(cSells || []).map(t => t.item_id),
        ...(hBuys || []).map(t => t.item_id),
        ...(hSells || []).map(t => t.item_id),
        ...(deliv?.items || []).map((i: any) => i.id)
      ].filter(id => id > 0)));

      let itemMap = new Map();
      if (allIds.length > 0) {
        const items = await api.getItems(allIds);
        itemMap = new Map((items || []).map(i => [i.id, i]));
      }

      const hydrate = (list: any[]) => (list || []).map(t => ({ 
        ...t, 
        itemDetail: itemMap.get(t.item_id || t.id) 
      }));

      setCurrentBuys(hydrate(cBuys));
      setCurrentSells(hydrate(cSells));
      setHistoryBuys(hydrate(hBuys));
      setHistorySells(hydrate(hSells));
      setDelivery(deliv);
      setInitialized(true);
    } catch (err) {
      console.error("TP Hub Fetch Error", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [apiKey, isValid, syncTradingPost]);

  useEffect(() => {
    fetchTPData();
    // Auto-refresh stats every 10 seconds as requested
    const interval = setInterval(() => fetchTPData(true), 10000);
    return () => clearInterval(interval);
  }, [apiKey, isValid, fetchTPData]);

  const stats = useMemo(() => {
    const buyExp = currentBuys.reduce((acc, t) => acc + (t.price * t.quantity), 0);
    const sellVal = currentSells.reduce((acc, t) => acc + (t.price * t.quantity), 0);
    const unclaimed = delivery?.coins || 0;
    const net = walletGold + buyExp + sellVal + unclaimed;
    return { buyExp, sellVal, net, unclaimed, walletGold };
  }, [currentBuys, currentSells, delivery, walletGold]);

  return (
    <div className="space-y-6 pb-24 text-slate-100">
      {/* HUD HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)]">
             <RefreshCw className={clsx("text-white", loading && "animate-spin")} size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase leading-none">Commerce Terminal</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tyrian Exchange Node // Live</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => fetchTPData()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-black uppercase tracking-widest text-slate-200 rounded-xl border border-white/5 transition-all active:scale-95"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Force Sync
          </button>
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-white/5 ring-1 ring-white/5">
             <TabBtn active={activeTab === 'current'} onClick={() => setActiveTab('current')} icon={<Zap size={14}/>} label="Market Live" />
             <TabBtn active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={14}/>} label="Archived" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* STATS MATRIX */}
        <div className="lg:col-span-1 space-y-4">
          <StatCard label="Total Account Liquidity" value={stats.net} icon={<LayoutDashboard size={14}/>} color="indigo" />
          <StatCard label="Wallet Balance" value={stats.walletGold} icon={<Coins size={14}/>} color="amber" />
          <StatCard label="Buy Exposure" value={stats.buyExp} icon={<ArrowDownLeft size={14}/>} color="emerald" />
          <StatCard label="Market Assets" value={stats.sellVal} icon={<ArrowUpRight size={14}/>} color="rose" />
          
          {stats.unclaimed > 0 && (
             <motion.div 
               initial={{ x: -20, opacity: 0 }} 
               animate={{ x: 0, opacity: 1 }}
               className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-[2rem] shadow-xl shadow-amber-500/5"
             >
                <div className="flex items-center gap-2 mb-2">
                   <div className="p-1.5 bg-amber-500/20 text-amber-500 rounded-lg"><Coins size={12} /></div>
                   <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Unclaimed TP Gold</span>
                </div>
                <div className="text-xl font-black text-amber-200">
                  <CurrencyDisplay amount={stats.unclaimed} />
                </div>
                <p className="text-[8px] text-amber-500/60 uppercase font-bold mt-2 tracking-tighter">Available at any Black Lion Representative</p>
             </motion.div>
          )}
        </div>

        {/* MAIN VIEWS */}
        <div className="lg:col-span-3 min-h-[600px] relative">
           <AnimatePresence mode="wait">
             {loading && !initialized ? (
                <TerminalSkeleton key="skeleton" />
             ) : (
                <motion.div 
                   key={activeTab}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                   {activeTab === 'current' ? (
                      <>
                        <TPList title="Purchase Orders" data={currentBuys} type="buy" />
                        <TPList title="Active Listings" data={currentSells} type="sell" />
                      </>
                   ) : (
                      <>
                        <TPList title="Buy History" data={historyBuys} type="buy" />
                        <TPList title="Sell History" data={historySells} type="sell" />
                      </>
                   )}
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const TabBtn = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={clsx(
      "px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 tracking-widest",
      active ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:text-white"
    )}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-slate-900/30 p-5 rounded-[2rem] border border-white/5 hover:bg-slate-900/50 transition-all group">
    <div className="flex items-center gap-2 mb-3">
       <div className={clsx("p-1.5 rounded-lg", 
         color === 'indigo' ? "bg-indigo-500/20 text-indigo-400" :
         color === 'emerald' ? "bg-emerald-500/20 text-emerald-400" :
         "bg-rose-500/20 text-rose-400"
       )}>
          {icon}
       </div>
       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xl font-black text-white group-hover:scale-105 transition-transform origin-left">
      <CurrencyDisplay amount={value} />
    </div>
  </div>
);

const TPList = ({ title, data, type }: any) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalSlots = data.length;
  const pages = Math.ceil(totalSlots / itemsPerPage);
  const viewData = data.slice((page-1)*itemsPerPage, page*itemsPerPage);

  return (
    <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 flex flex-col h-full overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className={clsx("w-2 h-2 rounded-full", type === 'buy' ? "bg-emerald-500" : "bg-rose-500")} />
          {title}
        </h3>
        <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-500 uppercase">{totalSlots} Slots</span>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar max-h-[500px]">
        {viewData.map((t: any, idx: number) => (
          <TransactionRow key={`${t.id}-${idx}`} t={t} type={type} />
        ))}
        {data.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 grayscale">
             <Package size={48} />
             <span className="text-[10px] font-black uppercase mt-4">Buffer Empty</span>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-slate-950/20">
           <button 
             disabled={page === 1}
             onClick={() => setPage(p => p - 1)}
             className="p-2 rounded-xl bg-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
           >
              <ChevronRight size={14} className="rotate-180" />
           </button>
           <span className="text-[10px] font-mono text-slate-500 uppercase font-black">Segment {page} / {pages}</span>
           <button 
             disabled={page === pages}
             onClick={() => setPage(p => p + 1)}
             className="p-2 rounded-xl bg-white/5 text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
           >
              <ChevronRight size={14} />
           </button>
        </div>
      )}
    </div>
  );
};

const TransactionRow = React.memo(({ t, type }: any) => {
  const { positions } = useAccountStore();
  const isTracked = positions.some(p => p.itemId === t.item_id);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group"
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 overflow-hidden shadow-xl">
           {t.itemDetail?.icon ? (
             <img src={t.itemDetail.icon} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900">
                <Package size={16} />
             </div>
           )}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black ring-2 ring-slate-900">
           {t.quantity}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
           <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
              {t.itemDetail?.name || `ID:${t.item_id}`}
           </h4>
           {isTracked && <Lock size={10} className="text-amber-500 animate-pulse" />}
        </div>
        <div className="flex items-center gap-2 mt-1">
           <Clock size={10} className="text-slate-600" />
           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
              {formatDistanceToNow(new Date(t.purchased || t.created), { addSuffix: true })}
           </span>
        </div>
      </div>

      <div className="text-right">
         <div className="text-[11px] font-black text-white font-mono">
            <CurrencyDisplay amount={t.price} />
         </div>
         <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5">
            {type === 'buy' ? 'Unit Bid' : 'List Price'}
         </div>
      </div>
    </motion.div>
  );
});

const TerminalSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
    {[1, 2].map(i => (
      <div key={i} className="bg-slate-900/20 rounded-[2.5rem] border border-white/5 h-[600px] flex flex-col p-6 space-y-4">
         <div className="h-6 bg-white/5 rounded-lg w-1/2" />
         <div className="flex-1 space-y-3">
            {[1, 2, 3, 4, 5].map(j => (
              <div key={j} className="h-16 bg-white/5 rounded-2xl" />
            ))}
         </div>
      </div>
    ))}
  </div>
);
