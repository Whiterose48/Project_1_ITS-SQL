import React, { useState } from 'react';
import erdImage from '../assets/erd.png'; 

function Tabs({ selectedTab, onTabChange }) {
  const [showER, setShowER] = useState(false);

  return (
    <>
      {/* Tabs Container */}
      <div className="bg-slate-100/70 backdrop-blur-sm rounded-2xl p-1.5 border border-slate-200/40 mb-6">
        <div className="flex flex-col sm:flex-row gap-1.5">
          
          {/* Description Tab */}
          <button
            onClick={() => onTabChange('description')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#03045e]/30 active:scale-[0.98]
              ${selectedTab === 'description'
                ? 'bg-[#03045e] text-white shadow-md shadow-indigo-950/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Description
          </button>

          {/* ER Diagram Tab (Modal Trigger) */}
          <button
            onClick={() => setShowER(true)}
            className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100/60 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 active:scale-[0.98]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 15.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM6.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9.25 6a.75.75 0 01.75-.75h2a3 3 0 013 3V11h.25a.75.75 0 010 1.5h-.25v.75a3 3 0 01-3 3h-2a.75.75 0 010-1.5h2a1.5 1.5 0 001.5-1.5v-.75H10a.75.75 0 010-1.5h3.5V8.25A1.5 1.5 0 0012 6.75h-2A.75.75 0 019.25 6z" />
            </svg>
            ER Diagram
          </button>

          {/* My Submissions Tab */}
          <button
            onClick={() => onTabChange('submissions')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 active:scale-[0.98]
              ${selectedTab === 'submissions'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.308 1.027l4.25 7.5a.75.75 0 001.308 0l4.25-7.5a.75.75 0 10-1.308-.741L10.5 10.83l-3.206-5.657a.75.75 0 00-1.027-.308z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M2 14.75a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
            My Submissions
          </button>

        </div>
      </div>

      {/* ER Diagram Modal */}
      {showER && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop Blur Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
            onClick={() => setShowER(false)}
          ></div>
          
          {/* Modal Box */}
          <div className="relative w-full max-w-5xl bg-white border border-slate-100 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.15)] rounded-3xl flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M12 1.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 15.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM6.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM9.25 6a.75.75 0 01.75-.75h2a3 3 0 013 3V11h.25a.75.75 0 010 1.5h-.25v.75a3 3 0 01-3 3h-2a.75.75 0 010-1.5h2a1.5 1.5 0 001.5-1.5v-.75H10a.75.75 0 010-1.5h3.5V8.25A1.5 1.5 0 0012 6.75h-2A.75.75 0 019.25 6z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  Database Relation Schema (ER Diagram)
                </h3>
              </div>
              
              {/* Premium Close Button */}
              <button 
                onClick={() => setShowER(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="p-6 bg-slate-50/50 overflow-y-auto flex-1 flex flex-col items-center">
              <div className="w-full border border-slate-200/60 rounded-2xl bg-white p-4 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
                
                <img 
                  src={erdImage} 
                  alt="ER Diagram" 
                  className="max-w-full max-h-[50vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                  }}
                />

                <a 
                  href={erdImage} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-900 transition-colors shadow-sm shadow-slate-900/10"
                >
                  Open Original Image
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(Tabs);