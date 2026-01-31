import React, { useState } from 'react';
import { Timer, Bell, Star, MapPin, ExternalLink, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

// Example Event Data
const WORLD_EVENTS = [
  { id: 'sb', name: 'Shadow Behemoth', map: 'Queensdale', type: 'Boss' },
  { id: 'teq', name: 'Tequatl the Sunless', map: 'Sparkfly Fen', type: 'Hardcore Boss' },
  { id: 'claw', name: 'Claw of Jormag', map: 'Frostgorge Sound', type: 'Boss' },
  { id: 'mk', name: 'Mad King Says', map: 'Lion\'s Arch', type: 'Festival' },
];

export const EventTimers: React.FC = () => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const toggleFavorite = (id: string) => {
    const event = WORLD_EVENTS.find(e => e.id === id);
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(f => f !== id));
    } else {
      setFavorites(prev => [...prev, id]);
      toast.info(`⭐ Added ${event?.name} to favorites`);
    }
  };

  const toggleNotification = (id: string) => {
    const event = WORLD_EVENTS.find(e => e.id === id);
    if (notifications.includes(id)) {
      setNotifications(prev => prev.filter(n => n !== id));
    } else {
      setNotifications(prev => [...prev, id]);
      toast.success(`🔔 Warning set: We'll notify you 5m before ${event?.name}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-glow">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <Timer className="text-indigo-400" size={32} /> {t('timers.title')}
          </h1>
          <p className="text-slate-400 mt-1">{t('timers.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {WORLD_EVENTS.map((event) => {
            const isFav = favorites.includes(event.id);
            const isNotified = notifications.includes(event.id);
            
            return (
              <div key={event.id} className="glass-card p-4 hover:border-indigo-500/30 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-800 p-3 rounded-xl text-indigo-400">
                    <Timer size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 flex items-center gap-2">
                      {event.name}
                      {event.type === 'Hardcore Boss' && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase">Hardcore</span>}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {event.map}</span>
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-400">{t('timers.starts_in')}: --:--</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleNotification(event.id)}
                    className={clsx(
                      "p-2 rounded-lg transition-all",
                      isNotified ? "bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/10" : "hover:bg-slate-800 text-slate-500"
                    )}
                    title="Notify 5 min before"
                  >
                    <Bell size={18} fill={isNotified ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => toggleFavorite(event.id)}
                    className={clsx(
                      "p-2 rounded-lg transition-all",
                      isFav ? "bg-gold-500/10 text-gold-500" : "hover:bg-slate-800 text-slate-500"
                    )}
                  >
                    <Star size={18} fill={isFav ? "currentColor" : "none"} />
                  </button>
                  <a href={`https://wiki.guildwars2.com/wiki/${event.name.replace(/ /g, '_')}`} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-gold-500/20">
            <h2 className="text-xl font-bold text-gold-400 flex items-center gap-2 mb-4">
              <Star size={20} /> My Favorites
            </h2>
            {favorites.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-8">No favorite events tracked yet.</p>
            ) : (
              <div className="space-y-3">
                {favorites.map(id => {
                  const event = WORLD_EVENTS.find(e => e.id === id);
                  return event && (
                    <div key={id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
                      <span className="text-sm font-medium">{event.name}</span>
                      <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">05:12</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card p-6 border-indigo-500/20">
            <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2 mb-4">
              <Info size={20} /> Pro Tips
            </h2>
            <ul className="text-xs text-slate-400 space-y-3 leading-relaxed">
              <li>• Park alts at world boss locations to complete dailies quickly.</li>
              <li>• Arrival 5 minutes early ensures you get into a full "Main" instance.</li>
              <li>• Hardcore bosses like Tequatl and Triple Trouble require coordinated squads.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
