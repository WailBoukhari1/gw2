import { SALVAGE_STRATEGIES } from '../services/community-strategies.service';
import { Scissors, Settings, Coins, Bot, RefreshCw } from 'lucide-react';
import { aiService } from '../services/ai.service';
import { Modal } from './Modal';
import { useState } from 'react';

export const SalvageOptimizer: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [analyzingItem, setAnalyzingItem] = useState<string | null>(null);

  const handleVerify = async (itemName: string) => {
     setAnalyzingItem(itemName);
     setAiResult(null);
     setModalOpen(true);
     const result = await aiService.analyzeItem({ name: itemName } as any, null, undefined);
     setAiResult(result);
  };

  return (
    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 h-full">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-teal-400">
        <Scissors className="text-teal-500" /> 
        Salvage Optimizer
      </h2>
      
      <div className="space-y-4">
        {SALVAGE_STRATEGIES.map(( strat, idx) => (
          <div key={idx} className="bg-slate-800/60 p-4 rounded-lg hover:bg-slate-800 transition-colors border-l-2 border-teal-500 relative">
             <div className="flex justify-between items-start mb-2">
               <h3 className="font-bold text-slate-200 text-sm">{strat.item}</h3>
               <span className="text-gold-400 flex items-center gap-1 text-xs font-mono">
                 <Coins size={10} /> {strat.expectedValue}s
               </span>
             </div>
             
             <div className="text-xs text-slate-300 font-medium mb-2">
               {strat.action}
             </div>

             <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900/50 px-2 py-1 rounded w-fit">
               <Settings size={10} /> 
               {strat.tool}
             </div>
             
             <button
                onClick={() => handleVerify(strat.item)}
                className="absolute bottom-2 right-2 p-1.5 text-teal-500/50 hover:text-teal-400 bg-slate-900/30 hover:bg-teal-500/10 rounded transition-all"
                title="AI Verification"
             >
                <Bot size={12} />
             </button>
          </div>
        ))}
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={analyzingItem ? `Strategies for: ${analyzingItem}` : 'AI Verification'}
        icon={Bot}
      >
        {!aiResult ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500">
             <RefreshCw className="animate-spin mb-4 text-teal-400" size={32} />
             <p className="animate-pulse text-xs font-bold uppercase tracking-widest">Cross-referencing community data...</p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                   <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-slate-200 text-lg">{aiResult.recommendation}</h4>
                       <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded uppercase font-bold">Risk: {aiResult.risk_level}</span>
                   </div>
                   <p className="text-sm text-slate-300 leading-relaxed font-arabic">
                      {aiResult.reasoning}
                   </p>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
