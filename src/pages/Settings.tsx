import React from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { Settings as SettingsIcon, Brain, ToggleLeft, ToggleRight, ShieldCheck, Zap, LineChart, Calendar, Coins, Database, Download, Upload } from 'lucide-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const SettingsPage: React.FC = () => {
  const { 
    apiKey, 
    setApiKey,
    aiApiKey, 
    setAiApiKey,
    aiFeatures, 
    toggleAiFeature,
    clearMemory,
    permissions,
    exportData,
    importData
  } = useAccountStore();
  
  const { t } = useTranslation();

  const [localApiKey, setLocalApiKey] = React.useState(apiKey || '');
  const [localAiApiKey, setLocalAiApiKey] = React.useState(aiApiKey || '');
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => { setLocalApiKey(apiKey || ''); }, [apiKey]);
  React.useEffect(() => { setLocalAiApiKey(aiApiKey || ''); }, [aiApiKey]);

  const handleSave = () => {
    setApiKey(localApiKey);
    setAiApiKey(localAiApiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={clsx("max-w-4xl mx-auto space-y-8 pb-20")}>
       
       <div className="flex flex-col gap-2">
         <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            {t('settings', 'CONFIGURATION')}
         </h1>
         <p className="text-slate-400">Manage your API connections and AI preferences.</p>
       </div>

       {/* Configuration Source Info */}
       <div className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-xl mb-6 flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
             <SettingsIcon size={18} />
          </div>
          <div>
             <h3 className="text-sm font-bold text-slate-200">System Configuration</h3>
             <p className="text-xs text-slate-500 mt-0.5">
                Configure your API keys and system preferences below.
             </p>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-8">
         <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
             <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <ShieldCheck className="text-green-400" />
               {t('credentials', 'Security & Credentials')}
             </h2>
             
             <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Guild Wars 2 API Key</label>
                  <input 
                     type="password"
                     value={localApiKey}
                     onChange={(e) => setLocalApiKey(e.target.value)}
                     className="w-full bg-black/30 p-4 rounded-xl border border-white/5 focus:border-indigo-500/50 outline-none font-mono text-sm text-slate-300 placeholder-slate-700 transition-colors"
                     placeholder="Ex: A1B2C3D4-..."
                  />
                  {permissions && permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                       {permissions.map(p => (
                          <span key={p} className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                             {p}
                          </span>
                       ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">AI Model API Key</label>
                  <input 
                     type="password"
                     value={localAiApiKey}
                     onChange={(e) => setLocalAiApiKey(e.target.value)}
                     className="w-full bg-black/30 p-4 rounded-xl border border-white/5 focus:border-indigo-500/50 outline-none font-mono text-sm text-slate-300 placeholder-slate-700 transition-colors"
                     placeholder="sk-..."
                  />
                  <p className="text-[10px] text-slate-600 mt-2">
                      Supports OpenAI (sk-...) and Google Gemini (AIza...) keys.
                   </p>
                </div>

                <div className="flex items-center justify-end pt-2">
                   {saved && (
                      <span className="text-green-400 text-sm font-bold flex items-center gap-2 mr-4 animate-pulse">
                         <ShieldCheck size={16} /> Saved
                      </span>
                   )}
                   <button 
                     onClick={handleSave}
                     className="bg-indigo-600/20 hover:bg-indigo-600 hover:text-white text-indigo-400 border border-indigo-500/30 font-bold py-2 px-6 rounded-lg transition-all"
                   >
                      Save Configuration
                   </button>
                </div>
             </div>
         </div>
       </div>

        {/* AI Features Toggle Section */}
        <div className="space-y-6">
           <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 h-full">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                 <Brain className="text-purple-400" />
                 AI Module Control
              </h2>
              <p className="text-sm text-slate-400 mb-6">Selectively enable or disable specific AI modules to manage API consumption or focus functionality.</p>
              
              <div className="space-y-4">
                 {/* Feature: Market Analysis */}
                 <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><LineChart size={20} /></div>
                       <div>
                          <div className="font-bold text-slate-200">Market Analysis</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Autonomous Trend Detection</div>
                       </div>
                    </div>
                    <button onClick={() => toggleAiFeature('marketAnalysis')} className={clsx("transition-colors", aiFeatures.marketAnalysis ? "text-green-400" : "text-slate-600")}>
                       {aiFeatures.marketAnalysis ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                 </div>

                 {/* Feature: Daily Plan */}
                 <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Calendar size={20} /></div>
                       <div>
                          <div className="font-bold text-slate-200">Daily Trading Plan</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Generates Daily Goals</div>
                       </div>
                    </div>
                    <button onClick={() => toggleAiFeature('dailyPlan')} className={clsx("transition-colors", aiFeatures.dailyPlan ? "text-green-400" : "text-slate-600")}>
                       {aiFeatures.dailyPlan ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                 </div>

                 {/* Feature: Investment Advice */}
                 <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400"><Coins size={20} /></div>
                       <div>
                          <div className="font-bold text-slate-200">Long-term Investment</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Strategic Hold Recommendations</div>
                       </div>
                    </div>
                    <button onClick={() => toggleAiFeature('investmentAdvice')} className={clsx("transition-colors", aiFeatures.investmentAdvice ? "text-green-400" : "text-slate-600")}>
                       {aiFeatures.investmentAdvice ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                 </div>

                 {/* Feature: Ask AI */}
                 <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400"><Zap size={20} /></div>
                       <div>
                          <div className="font-bold text-slate-200">Ask AI Advisor</div>
                          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">On-Demand Item Analysis</div>
                       </div>
                    </div>
                    <button onClick={() => toggleAiFeature('askAi')} className={clsx("transition-colors", aiFeatures.askAi ? "text-green-400" : "text-slate-600")}>
                       {aiFeatures.askAi ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Database className="text-blue-400" />
               Data Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                     <Download size={16} className="text-emerald-400" /> Export Backup
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 h-10">
                     Download a JSON file containing all your settings, positions, trade history, and AI learning data.
                  </p>
                  <button 
                     onClick={async () => {
                        const json = await exportData();
                        const blob = new Blob([json], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `gw2-baron-backup-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                     }}
                     className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                  >
                     Download Backup
                  </button>
               </div>

               <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                  <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                     <Upload size={16} className="text-amber-400" /> Import / Restore
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 h-10">
                     Restore data from a previous backup file. Warning: This will overwrite current data!
                  </p>
                  <label className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-all text-center block cursor-pointer">
                     Select File
                     <input 
                        type="file" 
                        accept=".json"
                        className="hidden"
                        onChange={async (e) => {
                           const file = e.target.files?.[0];
                           if (!file) return;
                           const text = await file.text();
                           const success = await importData(text);
                           if (success) {
                              alert("Data restored successfully! The page will now reload.");
                              window.location.reload();
                           } else {
                              alert("Failed to restore data. Check file format.");
                           }
                        }}
                     />
                  </label>
               </div>
            </div>
        </div>

        <div className="flex justify-end"> 
           <button 
             onClick={() => {
                if(confirm("Are you sure? This will wipe all stored data (except keys in user-config).")) {
                   clearMemory();
                   window.location.reload();
                }
             }}
             className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-widest border border-red-900/50 hover:bg-red-900/20 px-4 py-3 rounded-xl transition-all"
           >
              Clear All Data & Keys
           </button>
        </div>

    </div>
  );
};
