import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sword, 
  Coins, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { toast } from 'react-toastify';

interface GuideTask {
  id: string;
  name_en: string;
  name_ar: string;
  category: 'World Boss' | 'Meta' | 'Farm';
  waypoint: string;
  chat_code: string;
  reward_est: string;
  time: string;
  description_en: string;
  description_ar: string;
}

const DAILY_TASKS: GuideTask[] = [
  {
    id: 'chak-gerent',
    name_en: 'Chak Gerent',
    name_ar: 'تشاك جيرنت',
    category: 'Meta',
    waypoint: 'SCAR Camp Waypoint',
    chat_code: '[&BPUHAAA=]',
    reward_est: '5-10 Gold',
    time: '20:30 UTC',
    description_en: 'Major meta event in Tangled Depths. High chance of infusions.',
    description_ar: 'حدث ميتا رئيسي في Tangled Depths. فرصة عالية للحصول على التسريبات.'
  },
  {
    id: 'tequatl',
    name_en: 'Tequatl the Sunless',
    name_ar: 'تيكواتل الذي لا يغرب',
    category: 'World Boss',
    waypoint: 'Broodmother Heights Waypoint',
    chat_code: '[&BNMAAAA=]',
    reward_est: '2 Gold + Mats',
    time: 'Reset + 0:00',
    description_en: 'Coordination-based world boss. Guaranteed 2 gold.',
    description_ar: 'زعيم عالمي يعتمد على التنسيق. مضمون 2 ذهب.'
  },
  {
    id: 'anom-farm',
    name_en: 'Fractal Farm (42)',
    name_ar: 'مزرعة الـ Fractals (42)',
    category: 'Farm',
    waypoint: 'Mistlock Observatory',
    chat_code: '[&BDkEAAA=]',
    reward_est: '15-20 Gold/Hr',
    time: 'Anytime',
    description_en: 'Repeatable high-speed fractal clear for liquid gold.',
    description_ar: 'تطهير فراكتل سريع قابل للتكرار للحصول على ذهب سائل.'
  },
  {
    id: 'octovine',
    name_en: 'Octovine (Auric Basin)',
    name_ar: 'أوكتوفاين (أوريك باسين)',
    category: 'Meta',
    waypoint: 'Forgotten City Waypoint',
    chat_code: '[&BMYHAAA=]',
    reward_est: '5-8 Gold',
    time: 'XX:00 (Even)',
    description_en: 'Multi-loot opportunity. Harvest rare materials and loot bags.',
    description_ar: 'فرصة غنائم متعددة. احصد المواد النادرة وأكياس الغنائم.'
  },
  {
    id: 'drakkar',
    name_en: 'Drakkar',
    name_ar: 'دراكار',
    category: 'World Boss',
    waypoint: 'Still Waters Waypoint',
    chat_code: '[&BDkMAAA=]',
    reward_est: '3-5 Gold',
    time: 'XX:05 (Odd)',
    description_en: 'High intensity boss in Bjora Marches. Chance for rare essences.',
    description_ar: 'زعيم عالي الكثافة في Bjora Marches. فرصة للحصول على جواهر نادرة.'
  }
];

export const DailiesGuides: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(isAr ? 'تم نسخ كود الدردشة!' : 'Chat code copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={clsx("space-y-8 max-w-5xl mx-auto", isAr ? "font-arabic rtl" : "font-sans")}>
      {/* Header */}
      <div className={clsx("flex flex-col gap-4", isAr ? "text-right" : "text-left")}>
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tighter uppercase">
          {t('dailies.title')}
        </h1>
        <p className="text-slate-400 flex items-center gap-2">
          {isAr && <Calendar size={18} className="text-indigo-400" />}
          {t('dailies.subtitle')}
          {!isAr && <Calendar size={18} className="text-indigo-400" />}
        </p>
      </div>

      {/* Routine Tabs or Sections */}
      <div className="space-y-4">
        {DAILY_TASKS.map((task) => (
          <motion.div 
            layout
            key={task.id}
            className={clsx(
              "glass-card overflow-hidden border-2 transition-all",
              expandedId === task.id ? "border-indigo-500/50 bg-indigo-500/5" : "border-slate-800 hover:border-slate-700"
            )}
          >
            <div 
              className="p-6 cursor-pointer flex items-center justify-between gap-6"
              onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
            >
              <div className={clsx("flex items-center gap-6", isAr ? "flex-row-reverse" : "flex-row")}>
                 <div className={clsx(
                   "p-3 rounded-2xl",
                   task.category === 'Meta' ? "bg-purple-500/10 text-purple-400" :
                   task.category === 'World Boss' ? "bg-red-500/10 text-red-400" :
                   "bg-emerald-500/10 text-emerald-400"
                 )}>
                   {task.category === 'Meta' ? <Sparkles size={24} /> : 
                    task.category === 'World Boss' ? <Sword size={24} /> : 
                    <Coins size={24} />}
                 </div>
                 <div className={isAr ? "text-right" : "text-left"}>
                    <h3 className="font-bold text-xl text-slate-100">{isAr ? task.name_ar : task.name_en}</h3>
                    <div className={clsx("flex items-center gap-4 mt-1 text-sm text-slate-500", isAr && "flex-row-reverse")}>
                       <span className="flex items-center gap-1.5"><Clock size={14} /> {task.time}</span>
                       <span className="flex items-center gap-1.5"><MapPin size={14} /> {task.waypoint}</span>
                    </div>
                 </div>
              </div>

              <div className={clsx("flex items-center gap-4", isAr && "flex-row-reverse")}>
                 <div className="text-center px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isAr ? 'المكافأة' : 'Reward'}</p>
                    <p className="text-sm font-bold text-gold-400">{task.reward_est}</p>
                 </div>
                 {expandedId === task.id ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
              </div>
            </div>

            <AnimatePresence>
              {expandedId === task.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 pt-2 border-t border-slate-800/50"
                >
                   <div className={clsx("flex flex-col md:flex-row gap-8 mt-4", isAr ? "flex-row-reverse" : "flex-row")}>
                      <div className="flex-1 space-y-4">
                         <div className={clsx("bg-slate-900/80 p-4 rounded-2xl border border-slate-700", isAr ? "text-right" : "text-left")}>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-start">
                               {isAr ? "معلومات الروتين" : "Routine Detail"} <Info size={14} />
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                               "{isAr ? task.description_ar : task.description_en}"
                            </p>
                         </div>
                         <div className="flex gap-2">
                            <button 
                              onClick={() => copyToClipboard(task.chat_code, task.id)}
                              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                            >
                               {copiedId === task.id ? <Check size={18} /> : <Copy size={18} />}
                               {isAr ? 'نسخ كود الدردشة' : 'Copy Chat Code'}
                            </button>
                            <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700">
                               <ExternalLink size={20} />
                            </button>
                         </div>
                      </div>

                      <div className="w-full md:w-64 space-y-3">
                         <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800 space-y-4">
                            <div>
                               <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">{isAr ? 'الكود' : 'Chat Code'}</label>
                               <code className="text-[10px] bg-slate-950 px-2 py-1 rounded text-indigo-400 block font-mono">
                                 {task.chat_code}
                               </code>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-500">{isAr ? 'النوع' : 'Category'}</span>
                               <span className="font-bold text-slate-300">{task.category}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                               <span className="text-slate-500">{isAr ? 'الهدف' : 'Target'}</span>
                               <span className="font-bold text-emerald-400 flex items-center gap-1"> {isAr ? 'ذهب' : 'Gold'} <Zap size={10} /></span>
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Advanced Speculation Section */}
      <div className={clsx("p-8 glass-card border-t-4 border-indigo-500 bg-indigo-500/5 flex flex-col md:flex-row gap-8 items-center", isAr ? "flex-row-reverse text-right" : "text-left")}>
         <div className="p-4 bg-indigo-500/20 rounded-3xl text-indigo-400">
            <Sparkles size={48} />
         </div>
         <div className="flex-1 space-y-2">
            <h4 className="text-xl font-black text-white uppercase tracking-tighter">{isAr ? 'خوارزمية روتين النخبة' : 'Elite Routine Algorithm'}</h4>
            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
               {isAr 
                 ? "يهدف هذا الروتين المنسق إلى تعظيم الذهب السائل الخاص بك بنسبة 150٪ من خلال استهداف أحداث الميتا ذات القيمة العالية المضمونة وزعمار العالم في التسلسل الزمني الأكثر كفاءة."
                 : "This curated routine targets maximizing your liquid gold by 150% by hitting guaranteed high-value metas and world bosses in the most time-efficient sequence possible."}
            </p>
         </div>
         <button className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10">
            {isAr ? 'تحديث الروتين' : 'Refresh Sequence'}
         </button>
      </div>
    </div>
  );
};
