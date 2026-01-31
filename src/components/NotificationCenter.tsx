import React, { useState, useRef, useEffect } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { Bell, ShoppingCart, Coins, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
  const { tradeNotifications, clearNotifications } = useAccountStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasNotifications = tradeNotifications.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon & Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative p-2.5 rounded-xl transition-all border group",
          isOpen 
            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30" 
            : "bg-slate-800/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10"
        )}
      >
        <Bell size={20} className={clsx(hasNotifications && !isOpen && "animate-[bell-ring_2s_infinite]")} />
        {hasNotifications && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-black items-center justify-center text-white">
              {tradeNotifications.length}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-slate-900 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] backdrop-blur-xl"
          >
            <div className="p-4 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
                 <Bell size={14} className="text-indigo-400" />
                 Market Intel
              </h3>
              <button 
                onClick={(e) => { e.stopPropagation(); clearNotifications(); }}
                className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                title="Clear Logs"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-2">
              {tradeNotifications.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center opacity-20 grayscale">
                    <Bell size={32} />
                    <span className="text-[10px] font-black uppercase mt-4 tracking-widest">No New Intel</span>
                </div>
              ) : (
                tradeNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={clsx(
                      "p-3 rounded-2xl border border-white/5 flex items-start gap-3 transition-colors",
                      notif.type === 'sell' ? "bg-emerald-500/5 hover:bg-emerald-500/10" : "bg-indigo-500/5 hover:bg-indigo-500/10"
                    )}
                  >
                    <div className={clsx(
                        "p-2 rounded-xl shrink-0 shadow-lg",
                        notif.type === 'sell' ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-600/20 text-indigo-400"
                    )}>
                        {notif.type === 'sell' ? <Coins size={14} /> : <ShoppingCart size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-200 leading-snug">{notif.message}</p>
                        <time className="text-[9px] font-black text-slate-500 uppercase mt-1 block tracking-tighter">
                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                        </time>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link 
                to="/trading-post"
                onClick={() => setIsOpen(false)}
                className="w-full p-4 block text-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors border-t border-white/5"
            >
                Open Terminal <ExternalLink size={10} className="inline ml-1" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
