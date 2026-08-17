import React, { useState, useEffect, useCallback } from 'react';
import { getContent, onStoreChange } from '../lib/instructor-store';

/**
 * Student-facing view of instructor-authored learning content.
 * Reads the shared store, live-updates, and shows each item as an
 * expandable accordion row. Renders nothing when there is no content.
 */
export default function StudentContent() {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);

  const refresh = useCallback(() => setItems(getContent()), []);

  useEffect(() => {
    refresh();
    const off = onStoreChange(() => refresh());
    return off;
  }, [refresh]);

  if (items.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#03045e]/10 text-[#03045e] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.247" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Learning Content</h3>
          <p className="text-xs text-slate-400">Notes and reading material from your instructor</p>
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {items.map((c) => {
          const isOpen = openId === c.id;
          return (
            <div key={c.id}>
              <button
                onClick={() => setOpenId(isOpen ? null : c.id)}
                className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors outline-none"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                  M{c.moduleId} · {c.type}
                </span>
                <span className="flex-1 min-w-0 font-semibold text-slate-800 text-sm truncate">{c.title}</span>
                <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-6 pb-5 -mt-1 animate-in fade-in duration-200">
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    {c.body || 'No content provided.'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
