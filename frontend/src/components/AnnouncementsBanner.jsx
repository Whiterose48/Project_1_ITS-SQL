import React, { useState, useEffect, useCallback } from 'react';
import { getAnnouncements, onStoreChange } from '../lib/instructor-store';

const DISMISS_KEY = 'its_dismissed_ann';

function readDismissed() {
  try { return new Set(JSON.parse(localStorage.getItem(DISMISS_KEY)) || []); }
  catch { return new Set(); }
}

const priorityDot = {
  high: 'bg-rose-500',
  medium: 'bg-[#f48c06]',
  low: 'bg-emerald-500',
};

/**
 * Compact announcements panel shown to students. Reads instructor-posted
 * announcements from the shared store and live-updates. Items are dismissible
 * per-id (persisted in localStorage).
 */
export default function AnnouncementsBanner() {
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState(readDismissed);

  const refresh = useCallback(() => setItems(getAnnouncements()), []);

  useEffect(() => {
    refresh();
    const off = onStoreChange(() => refresh());
    return off;
  }, [refresh]);

  const visible = items.filter((a) => !dismissed.has(a.id)).slice(0, 3);
  if (visible.length === 0) return null;

  const dismiss = (id) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]));
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
      {visible.map((a) => (
        <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#03045e]/5 text-[#03045e] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`w-1.5 h-1.5 rounded-full ${priorityDot[a.priority] || priorityDot.medium}`}></span>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{a.title}</h4>
              {a.pinned && <span className="text-[9px] font-bold uppercase tracking-widest text-[#03045e] bg-[#03045e]/5 border border-[#03045e]/10 px-1.5 py-0.5 rounded">Pinned</span>}
            </div>
            {a.body && <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap leading-relaxed">{a.body}</p>}
            {a.author && <p className="text-[11px] text-slate-400 mt-2 font-medium">— {a.author}</p>}
          </div>
          <button onClick={() => dismiss(a.id)} title="Dismiss" className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 outline-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
