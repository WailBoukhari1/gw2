import React, { useState } from 'react';
import { 
  LayoutList, 
  Table2, 
  Cpu,
  Wallet
} from 'lucide-react';
import clsx from 'clsx';
import { PositionTracker } from './PositionTracker';
import { DailyTradePlan } from './DailyTradePlan';
import { useMarketStore } from '../store/useMarketStore';
import { useAccountStore } from '../store/useAccountStore';
import { TopFlipsShowcase } from './TopFlipsShowcase';
import { CurrencyDisplay } from './CurrencyDisplay';

export const Dashboard: React.FC = () => {
  const { items } = useMarketStore();
  const { 
    realMaturityLevel, 
    positions, 
    virtualWallet,
    simMaturityLevel,
    shadowPositions,
    accountData,
    scoutActivity,
    resetAll
  } = useAccountStore();
  
  const [activeTab, setActiveTab] = useState<'tracker' | 'recommendations'>('tracker');
  const activeInvestments = positions.filter((p: any) => p.status === 'active').length;
  const totalProfit = positions.reduce((acc: number, p: any) => acc + (p.realizedProfit || 0), 0);
  
  // Get main wallet from accountData if available, otherwise 0
  const mainWallet = accountData?.wallet?.find((w: any) => w.id === 1)?.value || 0;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* COMPACT DASHBOARD HEADER */}
      <header className="flex items-center justify-between bg-slate-900/40 border border-white/5 p-2 rounded-[2px] backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="flex flex-col border-r border-white/5 pr-4">
              <h1 className="text-sm font-black text-white tracking-widest uppercase italic flex items-center gap-2">
                <Cpu size={14} className="text-indigo-500" />
                COMMAND <span className="text-indigo-500">MATRIX</span>
              </h1>
              <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none">Status: Operational</span>
           </div>

           <div className="hidden lg:flex items-center gap-8">
              <div className="flex flex-col">
                 <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Total Yield</span>
                 <CurrencyDisplay amount={totalProfit} className="text-[11px] font-black" />
              </div>
              
              <MetricMini label="Nodes" value={activeInvestments} color="text-indigo-400" />
              <MetricMini label="Rank" value={`${realMaturityLevel}`} color="text-amber-400" />
           </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-2 py-1 px-3 bg-black/40 border border-white/5 rounded-[1px]">
              <Wallet size={10} className="text-indigo-400" />
              <CurrencyDisplay amount={mainWallet} className="text-[10px] font-black" />
           </div>

           <div className="flex p-0.5 bg-black/40 rounded-[1px] border border-white/5 gap-0.5">
              <TabButtonCompact active={activeTab === 'tracker'} onClick={() => setActiveTab('tracker')} icon={LayoutList} label="MATRIX" />
              <TabButtonCompact active={activeTab === 'recommendations'} onClick={() => setActiveTab('recommendations')} icon={Table2} label="ALPHA" />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 items-start relative">
        {/* FIXED TACTICAL SIDEBAR - STICKY POSITIONING */}
        <aside className="col-span-12 lg:col-span-3 lg:sticky lg:top-0 h-fit">
           <div className="flex flex-col gap-3">
              {/* Neural Shadow Matrix */}
              <div className="glass-card !p-0 border-white/5 bg-slate-900/40 flex flex-col overflow-hidden">
                 <div className="p-2 border-b border-white/5 bg-slate-900/60 flex items-center justify-between">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none text-indigo-100">Shadow Layer</span>
                    <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-tighter">LVL {simMaturityLevel} SYNC</span>
                 </div>
                 <div className="p-0.5 space-y-px max-h-[300px] overflow-y-auto no-scrollbar bg-black/5">
                    {shadowPositions.length === 0 ? (
                       <div className="p-4 text-center text-[8px] text-slate-600 uppercase font-black tracking-widest">Awaiting Neural Link...</div>
                    ) : (
                       shadowPositions.map((sim) => (
                          <div key={sim.id} className="flex items-center justify-between p-1.5 hover:bg-white/5 border-b border-white/[0.02] transition-colors group">
                             <div className="flex items-center gap-2 min-w-0">
                                <img 
                                  src={sim.itemIcon || 'https://render.guildwars2.com/file/22F1351110777977433B319DA2ACD77785F2C553/61015.png'} 
                                  onError={(e) => {
                                     (e.target as HTMLImageElement).src = 'https://render.guildwars2.com/file/22F1351110777977433B319DA2ACD77785F2C553/61015.png';
                                  }}
                                  alt="" 
                                  className="w-5 h-5 rounded-[1px] group-hover:scale-110 transition-transform bg-slate-800" 
                                />
                                <span className="text-[9px] font-bold text-slate-400 truncate tracking-tight uppercase group-hover:text-indigo-300 transition-colors">{sim.itemName}</span>
                             </div>
                             <span className="text-[9px] font-black text-emerald-400/80">+{Math.round(sim.roiEstimate)}%</span>
                          </div>
                       ))
                    )}
                 </div>
                 <div className="p-2 bg-slate-900/80 border-t border-white/5 flex items-center justify-between text-[8px]">
                    <span className="text-slate-600 uppercase font-black">Reserve Flow</span>
                    <CurrencyDisplay amount={virtualWallet} className="text-[9px] font-bold" />
                 </div>
              </div>

              {/* Scout Activity Log */}
              <div className="glass-card !p-0 border-white/5 bg-slate-900/40 flex flex-col overflow-hidden">
                 <div className="p-2 border-b border-white/5 bg-slate-800/40 flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neural Activity</span>
                    <div className="flex gap-0.5">
                       <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                       <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75" />
                    </div>
                 </div>
                 <div className="p-2 space-y-2 max-h-[150px] overflow-y-auto no-scrollbar">
                    {scoutActivity.map((log, i) => (
                       <div key={i} className="flex gap-2">
                          <div className={clsx(
                             "w-0.5 h-auto rounded-full",
                             log.type === 'brain' ? "bg-indigo-500" : log.type === 'alert' ? "bg-rose-500" : "bg-slate-700"
                          )} />
                          <p className="text-[7px] text-slate-500 font-mono leading-tight">
                             <span className="text-slate-700">[{log.timestamp.split('T')[1].split('.')[0]}]</span> {log.message}
                          </p>
                       </div>
                    ))}
                    {scoutActivity.length === 0 && (
                       <p className="text-[7px] text-slate-700 font-mono italic">Scanning spectral noise...</p>
                    ) }
                 </div>
              </div>

              {/* Emergency Reset */}
              <button 
                onClick={() => {
                  if(confirm("PROTOCOL ALERT: This will purge ALL tactical data, positions, and virtual capital. Proceed?")) {
                    resetAll();
                  }
                }}
                className="w-full py-2 bg-rose-500/5 hover:bg-rose-500/20 border border-rose-500/20 rounded-[1px] text-[8px] font-black text-rose-500 uppercase tracking-widest transition-all"
              >
                Full System Purge
              </button>
           </div>
        </aside>

        {/* Main Content Areas */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
          <TopFlipsShowcase items={items} />
          
          <div className="flex flex-col">
            {activeTab === 'tracker' ? (
              <PositionTracker marketData={items} />
            ) : (
              <DailyTradePlan items={items} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricMini = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
  <div className="flex flex-col border-l border-white/5 pl-4">
    <span className="text-[6px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</span>
    <span className={clsx("text-[11px] font-black", color)}>{value}</span>
  </div>
);

const TabButtonCompact = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center gap-2 px-4 py-1.5 rounded-[1px] transition-all",
      active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
    )}
  >
    <Icon size={12} />
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);
