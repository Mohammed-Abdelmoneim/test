import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, X } from 'lucide-react';

export const TopAnnouncement: React.FC = () => {
  const { settings } = useStore();
  const [dismissed, setDismissed] = React.useState(false);

  if (!settings.announcementBar.enabled || dismissed) return null;

  return (
    <aside 
      className="relative z-40 px-4 py-2 text-xs md:text-sm font-medium text-center text-white transition-all shadow-xs"
      style={{ backgroundColor: settings.announcementBar.bgColor || '#D82B76' }}
      aria-label="إعلان ترويجي"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-90" aria-hidden="true" />
        <span className="truncate">{settings.announcementBar.textAr}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-white/80 hover:text-white rounded-md transition-colors"
        aria-label="إغلاق الإعلان"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
