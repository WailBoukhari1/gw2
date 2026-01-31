import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Radar, 
  BookOpen, 
  Timer, 
  Package, 
  Calendar, 
  Hammer, 
  Trophy,
  LayoutDashboard,
  Globe,
  Briefcase,
  Settings,
  Scale,
  ShieldCheck,
  ChevronRight,
  User,
  RefreshCw, 
  Pause, 
  Play, 
  Zap 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useAccountBootstrap } from '../hooks/useAccountBootstrap';
import { useMarketStore } from '../store/useMarketStore';
import { useAccountStore } from '../store/useAccountStore';
import { NotificationCenter } from './NotificationCenter';
import { CurrencyDisplay } from './CurrencyDisplay';

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  useAccountBootstrap(); 
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isRTL = i18n.language === 'ar';
  
  const { 
    loading, 
    isPaused, 
    setPaused, 
    startBackgroundScan
  } = useMarketStore();

  const { accountData, isValid, wallet } = useAccountStore();
  const goldBalance = wallet.find(c => c.id === 1)?.value || 0;

  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const navItems = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/market', label: t('nav.market'), icon: Radar },
    { path: '/trading-post', label: t('nav.trading_post', 'Trading Post'), icon: Scale },
    { path: '/investment', label: t('nav.invest'), icon: Briefcase },
    { path: '/strategies', label: t('nav.strategies'), icon: BookOpen },
    { path: '/inventory', label: t('nav.inventory'), icon: Package },
    { path: '/timers', label: t('nav.timers'), icon: Timer },
    { path: '/guides', label: t('nav.dailies'), icon: Calendar },
    { path: '/legendary', label: t('nav.legendary'), icon: Hammer },
    { path: '/collections', label: t('nav.collections'), icon: Trophy },
    { path: '/settings', label: t('nav.settings', 'Settings'), icon: Settings },
  ];

  return (
    <div className={clsx(
      "h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden fixed inset-0",
      isRTL ? "font-arabic" : "font-sans"
    )}>
      {/* LOCKED TACTICAL SIDEBAR */}
      <aside className="w-72 border-r border-white/5 bg-slate-950 flex flex-col z-50 flex-shrink-0 h-full relative">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-900/40 backdrop-blur-2xl -z-10" />
        
        {/* Sidebar Header */}
        <div className="p-8 pb-4">
           <div className="flex items-center gap-3 mb-8 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/20 transform group-hover:scale-110 transition-transform">
                  <Radar size={24} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter text-white uppercase italic">GW2 <span className="text-indigo-400">Baron</span></span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Market Intelligence</span>
              </div>
           </div>

           <div className="relative mb-4 rounded-[2px] overflow-hidden aspect-[16/10] border border-white/5 group bg-slate-950 shadow-2xl">
              <img 
                src="/market_scout_robot.png" 
                alt="Market Scout" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-indigo-950/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                 <div className="flex items-center gap-2 px-2 py-1 rounded-[1px] bg-black/60 backdrop-blur-md border border-white/10 w-fit">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">Scout Sync: Active</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-2 space-y-1">
           <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group relative",
                      isActive 
                        ? "bg-indigo-500/10 text-indigo-100 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]" 
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "relative transition-all",
                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                      )}>
                         {isActive && (
                           <motion.div 
                             layoutId="active-nav-glow"
                             className="absolute inset-0 blur-md bg-indigo-500/40"
                           />
                         )}
                         <Icon size={18} className="relative" />
                      </div>
                      <span className={clsx("font-bold text-[11px] uppercase tracking-wide", isActive ? "text-white" : "")}>
                         {item.label}
                      </span>
                    </div>
                    {isActive && <ChevronRight size={12} className="text-indigo-500" />}
                  </Link>
                );
              })}
           </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto border-t border-white/5 p-6 space-y-4 bg-slate-950">
          <button 
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <div className="flex items-center gap-3">
               <Globe size={16} />
               <span className="text-[10px] font-black uppercase tracking-widest">{i18n.language === 'en' ? 'English' : 'Arabic'}</span>
            </div>
            <div className="w-6 h-4 rounded bg-slate-800 flex items-center justify-center text-[8px] font-bold">
               {i18n.language.toUpperCase()}
            </div>
          </button>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-white/5">
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                {accountData ? (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                     {accountData.name.charAt(0)}
                  </div>
                ) : (
                  <User size={20} className="text-slate-500" />
                )}
             </div>
             <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-black text-white uppercase tracking-tight truncate">
                   {accountData?.name || 'Guest Baron'}
                </span>
                <div className="flex items-center gap-1.5">
                   <ShieldCheck size={10} className={isValid ? "text-emerald-500" : "text-slate-500"} />
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                      {isValid ? 'API Secured' : 'No Access'}
                   </span>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Scroll Controlled */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-slate-950">
        <header className="flex-shrink-0 z-40 px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between border-l border-white/5">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-[2px] border border-white/5 shadow-inner">
                    <CurrencyDisplay amount={goldBalance} />
                </div>

                <div className="flex items-center gap-6 border-l border-white/5 pl-8">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Session Pulse</span>
                        <div className="flex items-center gap-2">
                            <Zap size={12} className={clsx(loading && !isPaused ? "text-indigo-400 animate-pulse" : "text-slate-600")} />
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                                {loading ? "Analyzing Live Feed" : "Frequency Standard"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-[2px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest leading-none">Scout V4.8 Ready</span>
                </div>

                <div className="h-6 w-px bg-white/5 mx-2" />
                
                <div className="flex items-center gap-1">
                    <button 
                       onClick={() => setPaused(!isPaused)}
                       title={isPaused ? "Resume Scout" : "Pause Scout"}
                       className={clsx(
                         "p-2 rounded-[2px] transition-all border shadow-lg",
                         isPaused 
                           ? "bg-yellow-500 text-slate-950 border-yellow-400 shadow-yellow-500/20" 
                           : "bg-white/5 text-slate-400 hover:text-white border-white/5 hover:bg-white/10"
                       )}
                    >
                       {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} />}
                    </button>
                    <button 
                       onClick={() => startBackgroundScan()}
                       disabled={loading && !isPaused}
                       title="Force Neural Sync"
                       className="p-2 rounded-[2px] bg-white/5 text-slate-400 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/30 disabled:opacity-20 transition-all"
                    >
                       <RefreshCw size={14} className={loading && !isPaused ? "animate-spin" : ""} />
                    </button>
                </div>
                
                <NotificationCenter />
            </div>
        </header>

        {/* This is the only scrolling container for the app content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950/20">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
