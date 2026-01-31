import React from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Coins, X, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

export const TradeNotificationFeed: React.FC = () => {
    const { tradeNotifications, clearNotifications } = useAccountStore();

    if (tradeNotifications.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
            <div className="glass-card overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10">
                <div className="bg-slate-900/80 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trade Intelligence Log</span>
                    </div>
                    <button 
                        onClick={clearNotifications}
                        className="p-1 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
                
                <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-slate-950/40">
                    <AnimatePresence initial={false}>
                        {tradeNotifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={clsx(
                                    "p-3 rounded-xl border border-white/5 flex items-start gap-3 relative overflow-hidden group",
                                    notif.type === 'sell' ? "bg-emerald-500/10" : "bg-indigo-500/10"
                                )}
                            >
                                <div className={clsx(
                                    "p-2 rounded-lg shrink-0",
                                    notif.type === 'sell' ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
                                )}>
                                    {notif.type === 'sell' ? <Coins size={14} /> : <ShoppingCart size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-200 leading-snug">{notif.message}</p>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase mt-1 block">
                                        {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                                
                                <div className={clsx(
                                    "absolute top-0 right-0 w-1 h-full",
                                    notif.type === 'sell' ? "bg-emerald-500/50" : "bg-indigo-500/50"
                                )} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
