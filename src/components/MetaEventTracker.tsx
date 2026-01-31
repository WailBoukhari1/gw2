import { META_EVENTS } from '../services/community-strategies.service';
import { Clock, Trophy } from 'lucide-react';

export const MetaEventTracker: React.FC = () => {
  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 h-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gold-400">
        <Trophy className="text-gold-500" /> 
        Meta Events
      </h2>
      
      <div className="space-y-4">
        {META_EVENTS.map((event, idx) => (
          <div key={idx} className="bg-slate-800/60 p-4 rounded-lg hover:bg-slate-800 transition-colors border-l-2 border-gold-500">
             <div className="flex justify-between items-start mb-2">
               <h3 className="font-bold">{event.name}</h3>
               <span className="text-profit-500 font-mono text-sm">{event.gph}g/hr</span>
             </div>
             
             <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
               <Clock size={14} /> {event.time}
             </div>
             
             <div className="flex flex-wrap gap-1 mt-2">
               {event.rewards.map(r => (
                 <span key={r} className="text-xs bg-slate-950 px-2 py-1 rounded text-purple-300">
                   {r}
                 </span>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
