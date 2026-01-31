import React from 'react';
import { FISHING_LOCATIONS } from '../services/community-strategies.service';
import { Anchor, MapPin, CheckCircle2 } from 'lucide-react';

export const FishingProfitAnalyzer: React.FC = () => {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 h-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-cyan-400">
        <Anchor className="text-cyan-500" /> 
        Fishing Profit Analyzer
      </h2>
      
      <div className="space-y-4">
        {FISHING_LOCATIONS.map((loc, idx) => (
          <div key={idx} className="bg-slate-800/60 p-4 rounded-lg hover:bg-slate-800 transition-colors border-l-2 border-cyan-500">
            <div className="flex justify-between items-start mb-2">
               <div>
                 <h3 className="font-bold text-slate-200">{loc.location}</h3>
                 <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                   <MapPin size={12} /> {loc.hotspot}
                 </p>
               </div>
               <div className="text-right">
                 <div className="text-profit-400 font-mono font-bold text-lg">
                   {loc.gph}g <span className="text-xs text-slate-500 font-sans">/hr</span>
                 </div>
               </div>
            </div>
            
            <div className="mt-3 bg-slate-900/50 p-2 rounded text-xs">
              <span className="text-slate-500 uppercase font-bold tracking-wider mb-1 block">Strategy</span>
              <p className="text-slate-300">{loc.strategy}</p>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {loc.requirements.map(req => (
                <span key={req} className="text-[10px] bg-cyan-900/30 text-cyan-200 px-2 py-1 rounded-full flex items-center gap-1 border border-cyan-800/50">
                  <CheckCircle2 size={10} /> {req}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
