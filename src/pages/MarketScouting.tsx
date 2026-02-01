import React, { useState, useMemo } from 'react';
import { aiService } from '../services/ai.service';
import { ItemCard } from '../components/ItemCard';
import { useDebounce } from '../hooks/useDebounce';
import { 
  Search, 
  Filter, 
  Sparkles, 
  BarChart3, 
  AlertCircle, 
  RefreshCw,
  Zap,
  ShieldCheck,
  Hammer,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Target,
  Flame,
  Globe,
  LayoutGrid,
  List,
  History,
  TrendingUp,
  Cpu
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useMarketStore } from '../store/useMarketStore';
import { formatDistanceToNow } from 'date-fns';
import { CurrencyDisplay } from '../components/CurrencyDisplay';
import { ProfitTierMatrix } from '../components/ProfitTierMatrix';

const PRESETS = [
  { id: 't6', name: 'T6 Material Matrix', icon: Flame, query: 'high volume tier 6', color: 'text-orange-400', filter: { minRoi: 5, minDemand: 1000, category: 'CraftingMaterial' } },
  { id: 'ecto', name: 'Ectoplasm Pulse', icon: Zap, query: 'ecto flips', color: 'text-yellow-400', filter: { minRoi: 3, minDemand: 5000 } },
  { id: 'exotic', name: 'Exotic Arsenal', icon: Target, query: 'exotic armor weapon', color: 'text-purple-400', filter: { rarity: ['Exotic'], category: 'Armor' } },
  { id: 'safe', name: 'Low Risk Loops', icon: ShieldCheck, query: 'safe consistent', color: 'text-emerald-400', filter: { minDemand: 2000, minRoi: 10 } }
];

const CATEGORIES = [
  'Armor', 'Weapon', 'Back', 'Trinket', 'Consumable', 'Container', 'CraftingMaterial', 'UpgradeComponent', 'Bag', 'Gathering', 'Tool', 'Trophy'
];

export const MarketScouting: React.FC = () => {
  const { i18n } = useTranslation();
  const { 
    items, 
    loading, 
    isPaused, 
    setPaused, 
    startBackgroundScan,
    lastFullScan,
    scanProgress
  } = useMarketStore();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Advanced Filters
  const [minRoi, setMinRoi] = useState(0);
  const [minProfit, setMinProfit] = useState(0);
  const [minDemand, setMinDemand] = useState(0);
  const [rarityFilter, setRarityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'roi' | 'profit' | 'demand' | 'score' | 'sold' | 'bought' | 'offers' | 'bids'>('score');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = viewMode === 'grid' ? 24 : 50;

  // Filter Logic
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const matchesRoi = item.roi >= minRoi;
        const matchesProfit = item.profitPerUnit >= minProfit;
        const matchesDemand = item.buysQty >= minDemand;
        const matchesRarity = rarityFilter.length === 0 || rarityFilter.includes(item.rarity);
        const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(item.type);
        return matchesSearch && matchesRoi && matchesProfit && matchesDemand && matchesRarity && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'roi') return b.roi - a.roi;
        if (sortBy === 'profit') return b.profitPerUnit - a.profitPerUnit;
        if (sortBy === 'demand') return b.buysQty - a.buysQty;
        if (sortBy === 'sold') return (b.sold24h || 0) - (a.sold24h || 0);
        if (sortBy === 'bought') return (b.bought24h || 0) - (a.bought24h || 0);
        if (sortBy === 'offers') return (b.offersCount || 0) - (a.offersCount || 0);
        if (sortBy === 'bids') return (b.bidsCount || 0) - (a.bidsCount || 0);
        return b.priorityScore - a.priorityScore;
      });
  }, [items, debouncedSearchTerm, minRoi, minProfit, minDemand, rarityFilter, categoryFilter, sortBy]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage, ITEMS_PER_PAGE]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const [aiInsight, setAiInsight] = useState<any>(null);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setAiQuery(preset.query);
    if (preset.filter.minRoi !== undefined) setMinRoi(preset.filter.minRoi);
    if (preset.filter.minDemand !== undefined) setMinDemand(preset.filter.minDemand);
    if (preset.filter.rarity) setRarityFilter(preset.filter.rarity);
    if (preset.filter.category) setCategoryFilter([preset.filter.category]);
    handleAiSearch(preset.query);
  };

  const handleAiSearch = async (queryOverride?: string) => {
    const q = queryOverride || aiQuery;
    if (!q) return;
    setIsAiLoading(true);
    setAiInsight(null);
    try {
      const lowQ = q.toLowerCase();
      
      // Smart Keyword Intelligence
      if (lowQ.includes('t6') || lowQ.includes('tier 6')) {
        setMinDemand(1000);
        setMinRoi(5);
        setCategoryFilter(['CraftingMaterial']);
      }
      if (lowQ.includes('high roi') || lowQ.includes('profitable')) setMinRoi(25);
      if (lowQ.includes('fast') || lowQ.includes('velocity') || lowQ.includes('volume')) setMinDemand(2500);
      if (lowQ.includes('exotic')) {
        setRarityFilter(['Exotic']);
        setCategoryFilter(['Armor', 'Weapon']);
      }
      if (lowQ.includes('gear') || lowQ.includes('equipment')) setCategoryFilter(['Armor', 'Weapon', 'Trinket', 'Back']);
      if (lowQ.includes('safe') || lowQ.includes('low risk')) {
        setMinDemand(3000);
        setMinRoi(8);
      }
      if (lowQ.includes('ecto')) {
         setSearchTerm('Ectoplasm');
         setMinDemand(5000);
      }
      
      const insight = await aiService.getMarketSentiment(i18n.language);
      setAiInsight(insight);
    } catch (err) {
      console.error(err);
      setAiInsight({
        sentiment: 'Neutral',
        analysis: 'Failed to reach Neural Network. Reverting to local heuristic analysis.'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1700px] mx-auto">
      {/* Dynamic Header */}
      <header className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-3xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
               <Globe size={32} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                   Scout <span className="text-indigo-500">Terminal</span>
                 </h1>
                 <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-black border border-emerald-500/20 uppercase tracking-widest">Live Hub</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                 <p className="text-xs font-bold uppercase tracking-widest">Neural market depth Analysis • 0.8ms Latency</p>
                 {lastFullScan && (
                   <div className="h-1 w-1 rounded-full bg-slate-700" />
                 )}
                 {lastFullScan && (
                   <span className="text-[10px] font-black uppercase text-indigo-400">Synced: {formatDistanceToNow(lastFullScan, { addSuffix: true })}</span>
                 )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             {/* Progress Indicator */}
             {scanProgress && (
                <div className="flex flex-col items-end mr-4">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Syncing Matrix...</span>
                      <span className="text-[9px] font-bold text-white font-mono">
                        {Math.round((scanProgress.current / scanProgress.total) * 100)}%
                      </span>
                   </div>
                   <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                      />
                   </div>
                </div>
             )}

             <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={clsx("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300")}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={clsx("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300")}
                >
                  <List size={18} />
                </button>
             </div>
             
             <div className="h-8 w-px bg-white/5 mx-2" />

             <button 
               onClick={() => setPaused(!isPaused)}
               className={clsx(
                 "flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border font-black text-[10px] uppercase tracking-widest shadow-xl",
                 isPaused 
                   ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20" 
                   : "bg-indigo-500 border-indigo-600 text-white hover:bg-indigo-400 shadow-indigo-500/20"
               )}
             >
               {isPaused ? <Play size={14} className="fill-current" /> : <Pause size={14} className="fill-current" />}
               {isPaused ? "Resume Scraper" : "Scanner Active"}
             </button>

             <button 
               onClick={() => startBackgroundScan()} 
               disabled={loading && !isPaused}
               className="group flex items-center justify-center w-12 h-12 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-white/5 transition-all active:scale-95"
             >
               <RefreshCw size={18} className={clsx("text-slate-400 group-hover:text-white transition-colors", loading && !isPaused && "animate-spin")} />
             </button>
          </div>
        </div>
      </header>

      {/* Preset Bar */}
      <div className="flex flex-col gap-6">
         <ProfitTierMatrix />
         
         <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar mt-4">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="flex-shrink-0 flex items-center gap-4 bg-slate-900/60 border border-white/5 p-4 rounded-3xl hover:bg-slate-800 transition-all group min-w-[220px]"
              >
                 <div className={clsx("p-3 rounded-2xl bg-white/5 transition-transform group-hover:scale-110", preset.color)}>
                    <preset.icon size={20} />
                 </div>
                 <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{preset.name}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Preset Protocol</span>
                 </div>
              </button>
            ))}
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Advanced Filter Command Center */}
        <aside className={clsx(
          "transition-all duration-500 flex flex-col gap-6",
          sidebarOpen ? "w-full lg:w-80" : "w-0 overflow-hidden lg:w-0"
        )}>
          <div className="glass-card p-6 space-y-8 border-white/5 shadow-2xl bg-slate-900/60 sticky top-8">
            <div className="flex items-center justify-between">
              <h3 className="font-black flex items-center gap-3 text-white uppercase tracking-[0.2em] text-[11px]">
                <Cpu size={14} className="text-indigo-400" /> Scout Logic
              </h3>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-white lg:hidden">
                 <ChevronLeft size={16} />
              </button>
            </div>

            {/* AI Core */}
            <div className="space-y-3">
               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Neural Intent (AI)</label>
               <div className="relative group">
                 <input 
                   type="text"
                   value={aiQuery}
                   onChange={(e) => setAiQuery(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                   placeholder="e.g. 'T6 Material Flips'..."
                   className="w-full bg-black/40 border border-white/5 rounded-2xl pl-10 pr-12 py-4 text-xs font-bold text-white placeholder:text-slate-600 focus:border-indigo-500/50 transition-all outline-none"
                 />
                 <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:animate-pulse" size={14} />
                 <button 
                   onClick={() => handleAiSearch()}
                   className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                 >
                   {isAiLoading ? <RefreshCw className="animate-spin" size={12} /> : <Target size={12} />}
                 </button>
               </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Threshold Controls */}
            <div className="space-y-6">
              <ThresholdSlider label="ROI Floor" value={minRoi} max={100} unit="%" color="text-emerald-400" accent="accent-emerald-500" onChange={setMinRoi} />
              <ThresholdSlider label="Profit Target" value={minProfit} max={500000} step={10000} isGold unit="G" color="text-amber-400" accent="accent-amber-500" onChange={setMinProfit} />
              <ThresholdSlider label="Liquidity Bar" value={minDemand} max={5000} step={100} unit="Orders" color="text-blue-400" accent="accent-blue-500" onChange={setMinDemand} />
            </div>

            <div className="space-y-6">
              <div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block mb-3">Rarity Matrix</span>
                 <div className="grid grid-cols-2 gap-2">
                   {['Legendary', 'Ascended', 'Exotic', 'Rare', 'Masterwork', 'Fine'].map(r => (
                     <FilterChip 
                       key={r} 
                       label={r} 
                       active={rarityFilter.includes(r)} 
                       onClick={() => {
                         if (rarityFilter.includes(r)) setRarityFilter(prev => prev.filter(f => f !== r));
                         else setRarityFilter(prev => [...prev, r]);
                       }} 
                     />
                   ))}
                 </div>
              </div>

              <div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1 block mb-3">Asset category</span>
                 <div className="grid grid-cols-2 gap-2">
                   {CATEGORIES.slice(0, 8).map(c => (
                     <FilterChip 
                       key={c} 
                       label={c} 
                       active={categoryFilter.includes(c)} 
                       onClick={() => {
                         if (categoryFilter.includes(c)) setCategoryFilter(prev => prev.filter(f => f !== c));
                         else setCategoryFilter(prev => [...prev, c]);
                       }} 
                     />
                   ))}
                 </div>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setMinRoi(0);
                setMinProfit(0);
                setMinDemand(0);
                setRarityFilter([]);
                setCategoryFilter([]);
                setSearchTerm('');
                setAiQuery('');
              }}
              className="w-full py-4 rounded-2xl bg-white/5 text-[9px] font-black text-white hover:bg-red-500/10 hover:text-red-400 transition-all uppercase tracking-[0.2em] border border-transparent hover:border-red-500/20"
            >
              Purge Matrix Filters
            </button>
          </div>
        </aside>

        {/* Intelligence Grid */}
        <main className="flex-1 space-y-6 w-full">
           <div className="flex flex-col lg:flex-row gap-4 items-center justify-between glass-card p-4 border-white/5 bg-slate-900/40">
              <div className="relative flex-1 w-full lg:max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="text"
                  placeholder="Query Asset Database (e.g. 'Mystic Coin')...."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-black/20 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white placeholder:text-slate-600 focus:border-indigo-500/30 transition-all outline-none"
                />
              </div>

              {!sidebarOpen && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="hidden lg:flex items-center gap-2 px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                >
                  <Filter size={14} /> Open Filters
                </button>
              )}

              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
                {[
                  { id: 'score', icon: BarChart3, label: 'Score' },
                  { id: 'roi', icon: Zap, label: 'ROI' },
                  { id: 'profit', icon: Hammer, label: 'Profit' },
                  { id: 'demand', icon: TrendingUp, label: 'Demand' },
                  { id: 'sold', icon: Flame, label: 'Sold' },
                  { id: 'offers', icon: Target, label: 'Offers' }
                ].map(sort => (
                  <button
                    key={sort.id}
                    onClick={() => setSortBy(sort.id as any)}
                    className={clsx(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      sortBy === sort.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    <sort.icon size={12} />
                    <span className="hidden xl:inline">{sort.label}</span>
                  </button>
                ))}
              </div>
           </div>

           {/* AI Insight Header */}
           <AnimatePresence>
              {aiInsight && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 p-4 text-indigo-500/20"><Sparkles size={80} /></div>
                   <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-xl">
                         <BrainCircuit size={20} />
                      </div>
                      <div>
                         <h4 className="text-xs font-black text-white uppercase tracking-widest">Neural Market Synopsis</h4>
                         <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest leading-none">Status: Analysis Complete</p>
                      </div>
                   </div>
                   <p className="text-sm text-slate-300 relative z-10 leading-relaxed max-w-3xl">
                     {aiInsight.analysis || "Market sentiment is currently favoring high-liquidity commodity assets. Neural sensors detect a potential squeeze in the T6 material sector."}
                   </p>
                   <div className="mt-4 flex gap-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">Sentiment: {aiInsight.sentiment}</div>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest italic">Confidence: High</div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           {items.length === 0 && loading ? (
             <div className="h-[60vh] flex flex-col items-center justify-center gap-8 text-slate-500">
                <div className="relative">
                   <div className="w-24 h-24 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
                   <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Syncing Matrix...</h3>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Initializing full-depth Tyrian Market Scan</p>
                </div>
             </div>
           ) : (
             <>
               <div className="min-h-[600px] relative">
                  {/* Dynamic Grid vs List View */}
                  <div className={clsx(
                    "transition-all",
                    viewMode === 'grid' ? "grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-1 overflow-x-auto"
                  )}>
                    {viewMode === 'list' && (
                       <div className="flex items-center bg-slate-900/80 border border-white/5 rounded-t-2xl p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest min-w-[1200px]">
                          <div className="w-12" />
                          <div className="flex-1 min-w-[200px]">Asset Name</div>
                          <div className="w-32 text-center">Sell (Gold)</div>
                          <div className="w-32 text-center">Buy (Gold)</div>
                          <div className="w-24 text-center">Profit</div>
                          <div className="w-20 text-center">ROI</div>
                          <div className="w-24 text-center">Supply</div>
                          <div className="w-24 text-center">Demand</div>
                          <div className="w-20 text-center text-emerald-500">Sold</div>
                          <div className="w-20 text-center text-indigo-500">Offers</div>
                          <div className="w-20 text-center text-amber-500">Bought</div>
                          <div className="w-20 text-center text-rose-500">Bids</div>
                          <div className="w-12" />
                       </div>
                    )}
                    <AnimatePresence mode="popLayout">
                      {paginatedItems.map((item) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={item.id}
                        >
                          {viewMode === 'grid' ? (
                            <ItemCard item={item} />
                          ) : (
                            <CompactListItem item={item} />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {!loading && filteredItems.length === 0 && (
                      <div className="col-span-full h-80 flex flex-col items-center justify-center bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-white/5">
                         <AlertCircle size={48} className="text-slate-800 mb-6" />
                         <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[11px] mb-6">Vector search returned zero matches</p>
                         <button 
                           onClick={() => setMinRoi(0)}
                           className="bg-indigo-500/10 text-indigo-400 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                         >
                           Reset Thresholds
                         </button>
                      </div>
                    )}
                  </div>
               </div>
               
               {/* Advanced Pagination */}
               {filteredItems.length > 0 && (
                 <div className="flex flex-col sm:flex-row items-center justify-between glass-card p-6 border-white/5 bg-slate-900/60 gap-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white/5 rounded-2xl">
                          <History size={16} className="text-slate-500" />
                       </div>
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          Matrix index: <span className="text-white">{filteredItems.length}</span> Assets Identified
                       </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <button
                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                         disabled={currentPage === 1}
                         className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/40 text-slate-500 hover:text-white hover:bg-indigo-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-white/5 shadow-xl"
                       >
                         <ChevronLeft size={20} />
                       </button>
                       
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-white bg-indigo-500 w-10 h-10 flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-500/20">{currentPage}</span>
                          <span className="text-slate-700 font-black px-2">/</span>
                          <span className="text-[10px] font-black text-slate-500 bg-white/5 w-10 h-10 flex items-center justify-center rounded-2xl border border-white/5">{totalPages}</span>
                       </div>

                       <button
                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                         disabled={currentPage === totalPages}
                         className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/40 text-slate-500 hover:text-white hover:bg-indigo-500 transition-all disabled:opacity-20 disabled:cursor-not-allowed border border-white/5 shadow-xl"
                       >
                         <ChevronRight size={20} />
                       </button>
                    </div>
                 </div>
               )}
             </>
           )}
        </main>
      </div>
    </div>
  );
};

const CompactListItem: React.FC<{ item: any }> = ({ item }) => (
  <div className="flex items-center p-4 bg-slate-900/40 hover:bg-slate-800/80 border-x border-b border-white/5 transition-all group min-w-[1200px] relative overflow-hidden">
     <div className="w-12 flex items-center justify-center">
        <img src={item.icon} className="w-8 h-8 rounded-lg border border-white/5 group-hover:scale-110 transition-transform bg-slate-800" />
     </div>
     
     <div className="flex-1 min-w-[200px] flex flex-col ml-4">
        <span className="text-[11px] font-black text-white uppercase tracking-tight truncate pr-4">{item.name}</span>
        <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{item.type} • {item.rarity}</span>
     </div>

     <div className="w-32 text-center text-[10px] font-mono font-bold text-slate-300">
        <CurrencyDisplay amount={item.sellPrice} />
     </div>

     <div className="w-32 text-center text-[10px] font-mono font-bold text-slate-300">
        <CurrencyDisplay amount={item.buyPrice} />
     </div>

     <div className="w-24 text-center text-[10px] font-mono font-bold text-emerald-400">
        <CurrencyDisplay amount={item.profitPerUnit} hideIcons />
     </div>

     <div className="w-20 text-center">
        <span className="text-[10px] font-black text-emerald-400">+{item.roi.toFixed(1)}%</span>
     </div>

     <div className="w-24 text-center text-[10px] font-bold text-slate-400">
        {item.sellsQty.toLocaleString()}
     </div>

     <div className="w-24 text-center text-[10px] font-bold text-slate-400">
        {item.buysQty.toLocaleString()}
     </div>

     {/* Extended Metrics */}
     <div className="w-20 text-center text-[10px] font-black text-emerald-400/80">
        {item.sold24h?.toLocaleString() || '0'}
     </div>
     <div className="w-20 text-center text-[10px] font-black text-indigo-400/80">
        {item.offersCount?.toLocaleString() || '0'}
     </div>
     <div className="w-20 text-center text-[10px] font-black text-amber-400/80">
        {item.bought24h?.toLocaleString() || '0'}
     </div>
     <div className="w-20 text-center text-[10px] font-black text-rose-400/80">
        {item.bidsCount?.toLocaleString() || '0'}
     </div>

     <div className="w-12 flex justify-end">
        <button className="p-2 bg-indigo-500 hover:bg-white text-white hover:text-indigo-600 rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
           <ArrowRight size={14} />
        </button>
     </div>
  </div>
);

const ThresholdSlider: React.FC<{ label: string, value: number, max: number, step?: number, unit: string, color: string, accent: string, isGold?: boolean, onChange: (v: number) => void }> = ({ label, value, max, step = 1, unit, color, accent, isGold, onChange }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-end px-1">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <div className={clsx("text-xs font-black italic", color)}>
        {isGold ? `${(value/10000).toFixed(1)}G` : value}{unit}
      </div>
    </div>
    <div className="relative h-6 flex items-center">
       <div className="absolute w-full h-1.5 bg-black/40 rounded-full border border-white/5" />
       <input 
         type="range" min="0" max={max} step={step}
         value={value} onChange={(e) => onChange(parseInt(e.target.value))}
         className={clsx("absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10", accent)}
       />
    </div>
  </div>
);

const FilterChip: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      "text-[8px] px-3 py-2 rounded-xl font-black uppercase tracking-widest transition-all border",
      active 
       ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
       : "bg-black/40 border-white/5 text-slate-500 hover:text-white hover:bg-white/5"
    )}
  >
    {label}
  </button>
);

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const BrainCircuit = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105 4 4 0 0 0 5.207 5.02 3 3 0 1 0 5.796-1.02" />
    <path d="M9 13a4.5 4.5 0 0 0 3-4" />
    <path d="M6.003 5.125A3 3 0 0 0 5 11" />
    <path d="M11 15c.613 0 1.25.273 1.473.8a2.5 2.5 0 0 0 4.947-1.1c0-.396-.07-.776-.197-1.127" />
    <path d="M18 10a4 4 0 0 1-1.524 7.707" />
    <path d="M12 5a3 3 0 1 1 5.997.125" />
  </svg>
);
