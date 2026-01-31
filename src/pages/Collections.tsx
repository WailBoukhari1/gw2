import React from 'react';
import { Trophy, Compass, Star, CheckCircle, MapPin, Search } from 'lucide-react';

const COLLECTIONS = [
  { name: "Beer Enthusiast", category: "General", progress: 8, total: 24, reward: "Title: Beer Enthusiast" },
  { name: "Jormag Rising", category: "Story", progress: 15, total: 15, reward: "Mastery Point" },
  { name: "Kaiser Snake Weapons", category: "SAB", progress: 2, total: 16, reward: "Unique Skin" },
];

export const Collections: React.FC = () => {
  return (
    <div className="space-y-6 text-glow">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Trophy className="text-indigo-400" size={32} /> Collection Archive
          </h1>
          <p className="text-slate-400 mt-1">Track your skins, achievements, and unique item hunts.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input className="glass-input pl-10 text-sm py-2" placeholder="Search collections..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COLLECTIONS.map((col, i) => {
          const isDone = col.progress === col.total;
          return (
            <div key={i} className="glass-card p-6 hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group">
              {isDone && (
                <div className="absolute top-0 right-0 p-3 text-profit-400">
                  <CheckCircle size={20} />
                </div>
              )}
              
              <div className="mb-4">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{col.category}</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{col.name}</h3>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${(col.progress/col.total)*100}%` }} />
                </div>
                <span className="text-xs font-mono text-slate-400">{col.progress}/{col.total}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-1.5 text-slate-500 italic">
                   <Star size={14} className="text-amber-500" /> {col.reward}
                </div>
                <Compass size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-8 text-center bg-indigo-500/5 border-dashed border-2 border-indigo-500/20">
         <div className="inline-flex bg-indigo-500/20 p-4 rounded-full mb-4">
           <MapPin size={32} className="text-indigo-400" />
         </div>
         <h2 className="text-2xl font-bold text-slate-100 mb-2">Want more completions?</h2>
         <p className="text-slate-400 max-w-lg mx-auto mb-6">
           The "Dungeon Master" collection is currently 80% cheaper than last month due to high dungeon currency drops. 
           Complete it now for the unique title!
         </p>
         <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20">
           Start Nearest Collection
         </button>
      </div>
    </div>
  );
};
