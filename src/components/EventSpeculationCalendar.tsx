import React from 'react';
import { EVENT_SPECULATION } from '../services/community-strategies.service';
import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export const EventSpeculationCalendar: React.FC = () => {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 h-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-400">
        <Calendar className="text-pink-500" /> 
        Event Speculation
      </h2>
      
      <div className="space-y-4">
        {EVENT_SPECULATION.map((spec, idx) => (
          <div key={idx} className="bg-slate-800/60 p-4 rounded-lg hover:bg-slate-800 transition-colors border-l-2 border-pink-500 relative">
            <div className="flex justify-between items-start mb-2">
               <div>
                 <h3 className="font-bold text-slate-200">{spec.event}</h3>
                 <p className="text-xs text-slate-400 mt-0.5">{spec.date}</p>
               </div>
               <span className={clsx("text-[10px] px-2 py-0.5 rounded-full border", 
                 spec.confidence === 'Very High' ? 'border-green-500 text-green-400 bg-green-500/10' :
                 spec.confidence === 'High' ? 'border-blue-500 text-blue-400 bg-blue-500/10' :
                 'border-slate-500 text-slate-400'
               )}>
                 {spec.confidence} Conf.
               </span>
            </div>
            
            <div className="mt-3 bg-slate-900/50 p-2 rounded text-xs border border-slate-700/50">
               <div className="flex items-start gap-2 mb-2">
                 <TrendingUp size={14} className="text-profit-400 mt-0.5" />
                 <div>
                   <span className="text-slate-500 block text-[10px] uppercase font-bold">Action</span>
                   <span className="text-profit-300 font-medium">{spec.action}</span>
                 </div>
               </div>
               
               <div className="flex items-start gap-2">
                 <AlertTriangle size={14} className="text-orange-400 mt-0.5" />
                 <div>
                   <span className="text-slate-500 block text-[10px] uppercase font-bold">Watch Items</span>
                   <div className="flex flex-wrap gap-1 mt-1">
                     {spec.items.map(item => (
                       <span key={item} className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                         {item}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
