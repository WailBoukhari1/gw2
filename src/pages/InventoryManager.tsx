import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  User, 
  Building2, 
  Backpack, 
  ChevronRight,
  AlertCircle,
  Sparkles,
  Bot,
  Brain
} from 'lucide-react';
import { aiService } from '../services/ai.service';
import { useAccountStore } from '../store/useAccountStore';
import { api } from '../services/api.service';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Modal } from '../components/Modal';

interface StorageContainer {
  id: string;
  name: string;
  type: 'character' | 'bank' | 'shared';
  items: any[];
  totalValue: number;
}

export const InventoryManager: React.FC = () => {
  const { apiKey, isValid } = useAccountStore();
  
  const [loading, setLoading] = useState(false);
  const [containers, setContainers] = useState<StorageContainer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  
  // AI Modal States
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [analyzingItem, setAnalyzingItem] = useState<{name: string, icon?: string} | null>(null);

  const fetchFullInventory = async () => {
    if (!apiKey || !isValid) return;
    setLoading(true);
    try {
      const results: StorageContainer[] = [];

      // Define independent fetchers with error handling
      const fetchBank = async () => {
        try {
          const items = await api.getBank(apiKey);
          results.push({
            id: 'bank',
            name: 'Account Bank',
            type: 'bank',
            items: items.filter(Boolean).map((item: any, idx: number) => ({ ...item, uniqueKey: `bank-${item.id}-${idx}` })),
            totalValue: 0
          });
        } catch (e) { console.warn("Failed to fetch Bank", e); }
      };

      const fetchShared = async () => {
        try {
          const items = await api.getSharedInventory(apiKey);
          results.push({
            id: 'shared',
            name: 'Shared Slots',
            type: 'shared',
            items: (items || []).filter(Boolean).map((item: any, idx: number) => ({ ...item, uniqueKey: `shared-${item.id}-${idx}` })),
            totalValue: 0
          });
        } catch (e) { console.warn("Failed to fetch Shared Inventory", e); }
      };

      const fetchMaterials = async () => {
        try {
            const items = await api.getMaterials(apiKey);
            // Filter out empty slots (count > 0) to avoid clutter
            const activeMats = items.filter((i: any) => i.count > 0);
            results.push({
                id: 'materials',
                name: 'Material Storage',
                type: 'bank', // Reusing bank icon/type logic broadly
                items: activeMats.map((item: any, idx: number) => ({ ...item, uniqueKey: `mat-${item.id}-${idx}` })),
                totalValue: 0
            });
        } catch (e) { console.warn("Failed to fetch Materials", e); }
      };

      const fetchCharacters = async () => {
        try {
          const names = await api.getCharacters(apiKey);
          // Process chunks to avoid rate limits if many chars
          const chunks = [];
          for (let i = 0; i < names.length; i += 5) {
             chunks.push(names.slice(i, i + 5));
          }

          for (const chunk of chunks) {
             const promises = chunk.map(async (name) => {
                try {
                    const inv = await api.getCharacterInventory(apiKey, name);
                    if (!Array.isArray(inv)) return null;
                    const flatItems = inv.flatMap(bag => bag?.inventory || []).filter(Boolean).map((item: any, idx: number) => ({ ...item, uniqueKey: `char-${name}-${item.id}-${idx}` }));
                    return {
                        id: `char-${name}`,
                        name: name,
                        type: 'character',
                        items: flatItems,
                        totalValue: 0
                    };
                } catch (e) {
                    console.warn(`Failed individual char ${name}`, e);
                    return null;
                }
             });
             
             const chunkResults = await Promise.all(promises);
             chunkResults.filter(Boolean).forEach((c: any) => results.push(c));
          }
        } catch (e) { console.warn("Failed to fetch Character List", e); }
      };

      // Execute all major fetches in parallel (robustly)
      await Promise.all([
         fetchBank(),
         fetchShared(),
         fetchMaterials(),
         fetchCharacters()
      ]);

      // 4. Fetch Item Details for whatever we found
      // We only analyze top items to save API calls, prioritize by count/rarity if possible, but for now take first 300 unique IDs
      const allIds = [...new Set(results.flatMap(c => c.items.map((i: { id: any; }) => i.id)))];
      const topIds = allIds.slice(0, 400); 
      const itemDetails = await api.getItems(topIds);

      const finalized = results.map(c => ({
        ...c,
        items: c.items.map((i: any) => {
          const detail = itemDetails.find(d => d.id === i.id);
          return { ...i, detail };
        })
      }));

      // Sort: Bank, Shared, Materials, then Characters alphabetically
      finalized.sort((a, b) => {
          const order = { 'bank': 1, 'shared': 2, 'materials': 3 };
          const oa = order[a.id as keyof typeof order] || 99;
          const ob = order[b.id as keyof typeof order] || 99;
          if (oa !== ob) return oa - ob;
          return a.name.localeCompare(b.name);
      });

      setContainers(finalized as any);
      if (!selectedContainer && finalized.length > 0) setSelectedContainer(finalized[0].id);

    } catch (err) {
      console.error("Critical error in inventory sync", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async (item: any) => {
    if(!item.detail) return;
    setAnalyzingItem({ name: item.detail.name, icon: item.detail.icon });
    setAiResult(null);
    setAiModalOpen(true);
    
    const result = await aiService.analyzeItem(item.detail, null, 0);
    setAiResult(result);
  };

  useEffect(() => {
    fetchFullInventory();
  }, [apiKey, isValid]);

  const getAdvice = (item: any) => {
    const d = item.detail;
    if (!d) return { action: 'WAIT', color: 'text-slate-500', label: 'Loading...' };
    if (d.rarity === 'Junk') return { action: 'SELL', color: 'text-red-400', label: 'Vendor' };
    if (d.type === 'Weapon' || d.type === 'Armor') {
        if (d.rarity === 'Basic' || d.rarity === 'Fine' || d.rarity === 'Masterwork') return { action: 'SALVAGE', color: 'text-indigo-400', label: 'Salvage' };
        return { action: 'CHECK', color: 'text-gold-400', label: 'Check TP' };
    }
    if (d.type === 'Container') return { action: 'OPEN', color: 'text-green-400', label: 'Open' };
    return { action: 'KEEP', color: 'text-slate-400', label: 'Hold' };
  };

  if (!isValid) return null;

  const activeContainer = containers.find(c => c.id === selectedContainer) || containers.find(c => c.id === 'bank') || containers[0];
  const filteredItems = (activeContainer?.items || []).filter((i: any) => 
    (i.detail?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     i.id.toString().includes(searchTerm))
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400 tracking-tighter uppercase">
            Multiverse Storage Hub
          </h1>
          <p className="text-slate-400 flex items-center gap-2 mt-1 font-arabic">
             <Backpack size={16} /> إدارة المخزون عبر جميع الشخصيات وتحليل الذهب السائل.
          </p>
        </div>
        <div className="flex gap-3 font-arabic">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="تصفية العناصر..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-11 py-3 text-sm text-right" 
            />
          </div>
          <button 
            onClick={fetchFullInventory}
            disabled={loading}
            className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && containers.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-500">
           <RefreshCw className="animate-spin text-indigo-500" size={48} />
           <p className="text-sm font-bold animate-pulse uppercase tracking-widest font-arabic">جاري فحص خزائن الحساب...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Scrollable Container List */}
          <div className="lg:col-span-3 space-y-4">
             <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 font-arabic text-right">عقد التخزين</h3>
             <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {containers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                       setSelectedContainer(c.id);
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={clsx(
                      "w-full p-4 rounded-2xl border transition-all flex items-center justify-between group",
                      selectedContainer === c.id || (!selectedContainer && c.id === 'bank')
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3 w-full">
                       <div className={clsx(
                         "p-2 rounded-lg shrink-0",
                         (selectedContainer === c.id || (!selectedContainer && c.id === 'bank')) ? "bg-white/20" : "bg-slate-800 group-hover:bg-slate-700"
                       )}>
                         {c.type === 'bank' && <Building2 size={18} />}
                         {c.type === 'shared' && <Package size={18} />}
                         {c.type === 'character' && <User size={18} />}
                       </div>
                       <div className="text-right font-arabic flex-1">
                          <div className="font-bold text-xs truncate">{c.name}</div>
                          <div className="text-[10px] opacity-60 font-medium">{c.items.length} عنصر</div>
                       </div>
                       {(selectedContainer === c.id || (!selectedContainer && c.id === 'bank')) && <ChevronRight size={16} className="rotate-180" />}
                    </div>
                  </button>
                ))}
             </div>
          </div>

          {/* Item View */}
          <div className="lg:col-span-9 space-y-6">
             {activeContainer && (
               <motion.div 
                 key={activeContainer.id}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="space-y-6"
               >
                  <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-3xl border border-slate-800 font-arabic">
                     <div className="text-right">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{activeContainer.name}</h2>
                        <p className="text-xs text-slate-500 uppercase font-black">تخزين {activeContainer.type} نشط</p>
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] text-slate-500 font-black uppercase">إجمالي العناصر</p>
                        <p className="text-2xl font-black text-indigo-400">{activeContainer.items.reduce((acc, i) => acc + i.count, 0)}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                     {activeContainer.items.length === 0 ? (
                       <div className="col-span-full py-20 bg-slate-900/10 rounded-3xl border-2 border-dashed border-slate-900 flex flex-col items-center justify-center text-slate-600 font-arabic">
                          <Package size={48} className="mb-4 opacity-20" />
                          <p className="uppercase font-black text-xs tracking-widest">حاوية التخزين فارغة</p>
                       </div>
                     ) : (
                       filteredItems.map((item, idx) => {
                         const advice = getAdvice(item);
                         const d = item.detail;
                         return (
                           <div 
                             key={`${item.id}-${idx}`}
                             className="glass-card p-4 hover:border-slate-700 transition-all flex flex-col justify-between group h-fit"
                           >
                              <div className="flex items-start justify-between gap-4 mb-4">
                                 <div className="flex items-center gap-4">
                                    <div className="relative">
                                       <div className="w-12 h-12 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                                          {d?.icon ? (
                                            <img src={d.icon} alt="" className="w-full h-full object-cover" />
                                          ) : (
                                            <Package size={24} className="m-3 text-slate-600" />
                                          )}
                                       </div>
                                       <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-black px-1.5 rounded-md border border-slate-950">x{item.count}</span>
                                    </div>
                                    <div className="overflow-hidden">
                                       <h4 className="font-bold text-xs text-slate-200 truncate">{d?.name || `ID: ${item.id}`}</h4>
                                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{d?.rarity || 'Unknown'}</p>
                                    </div>
                                 </div>
                                 <div className={clsx("px-2 py-0.5 rounded text-[9px] font-black uppercase border shrink-0", advice.color.replace('text', 'bg').replace('400', '500/10'), advice.color.replace('text', 'border').replace('400', '500/20'), advice.color)}>
                                    {advice.label}
                                 </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                                 <div className="text-[10px] text-slate-600 italic font-arabic text-right">
                                   {advice.action === 'SELL' && "بيعه للتاجر للحصول على ذهب."}
                                   {advice.action === 'SALVAGE' && "فكه للحصول على مواد."}
                                   {advice.action === 'OPEN' && "يحتوي على مكافآت محتملة."}
                                   {advice.action === 'CHECK' && "إمكانية قيمة عالية."}
                                   {advice.action === 'KEEP' && "مفيد للحرف اليدوية/التقدم."}
                                   {advice.action === 'WAIT' && "جاري جمع معلومات العنصر..."}
                                 </div>
          
                                  <div className="flex gap-2">
                                     <button 
                                        onClick={() => handleAskAI(item)}
                                        className="p-1.5 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 rounded"
                                        title="Ask AI Advisor"
                                     >
                                        <Bot size={14} />
                                     </button>
                                     <button className="p-1.5 text-slate-600 hover:text-indigo-400 transition-colors">
                                        <AlertCircle size={14} />
                                     </button>
                                  </div>
                               </div>
                           </div>
                         );
                       })
                     )}
                  </div>
               </motion.div>
             )}
          </div>
        </div>
      )}

      {/* Footer Insight */}
      {!loading && containers.length > 0 && (
        <div className="bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/20 flex items-start gap-5 font-arabic text-right">
           <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400 shadow-lg shadow-indigo-500/10">
              <Sparkles size={28} />
           </div>
           <div>
              <h4 className="text-lg font-black text-indigo-300 uppercase tracking-tighter mb-1">تحليل المخزون العالمي</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                 لقد قمت بتحليل جميع عقد التخزين الخاصة بك. لديك <strong>{containers.reduce((acc: number, c: any) => acc + c.items.filter((i: any) => i.detail?.rarity === 'Junk').length, 0)} خانة</strong> مشغولة بعناصر غير قيمة. 
                 تنظيف هذه العناصر سيوفر لك مساحة قيمة لعمليات الجمع القادمة.
              </p>
           </div>
        </div>
      )}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title={analyzingItem ? `Analyzing: ${analyzingItem.name}` : 'AI Advisor'}
        icon={Bot}
      >
        {!aiResult ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-500">
             <RefreshCw className="animate-spin mb-4 text-indigo-400" size={32} />
             <p className="animate-pulse text-xs font-bold uppercase tracking-widest">Running neural predictive models...</p>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                {analyzingItem?.icon && <img src={analyzingItem.icon} className="w-12 h-12 rounded-lg border border-slate-600" alt="" />}
                <div>
                   <h4 className="font-bold text-slate-200 text-lg">{aiResult.recommendation}</h4>
                   <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded uppercase font-bold">Risk: {aiResult.risk_level}</span>
                      {aiResult.velocity && <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase font-bold">Vel: {aiResult.velocity}</span>}
                   </div>
                </div>
             </div>
             
             <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                 <div className="flex items-center gap-2 mb-2 text-indigo-400">
                    <Brain size={16} />
                    <span className="text-xs font-bold uppercase">AI Reasoning</span>
                 </div>
                 <p className="text-sm text-slate-300 leading-relaxed font-arabic">
                    {aiResult.reasoning}
                 </p>
             </div>

             {aiResult.suggested_qty && (
                <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg text-xs">
                   <span className="text-slate-500 font-bold uppercase">Suggested Move Qty</span>
                   <span className="text-slate-200 font-mono">{aiResult.suggested_qty} units</span>
                </div>
             )}
          </div>
        )}
      </Modal>
    </div>
  );
};
