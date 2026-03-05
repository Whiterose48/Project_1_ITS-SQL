import React, { useState } from 'react';
import erdImage from '../assets/erd.png'; 

export default function Tabs({ selectedTab, onTabChange }) {
  const [showER, setShowER] = useState(false);

  return (
    <>
      <div className="bg-slate-50 rounded-xl border-[3px] border-slate-200 mb-6 p-2.5">
        <div className="flex gap-4">
          
          <button
            onClick={() => onTabChange('description')}
            className={`flex-1 px-4 py-4 font-black text-sm tracking-widest uppercase transition-all duration-200 rounded-lg flex items-center justify-center gap-2 border-[3px] z-10 ${
              selectedTab === 'description'
                ? 'bg-[#000066] text-white border-[#000066] shadow-[4px_4px_0px_0px_#0a0a3a] -translate-y-1 -translate-x-0.5'
                : 'bg-white text-slate-500 border-slate-300 shadow-[4px_4px_0px_0px_#cbd5e1] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-slate-50'
            } active:translate-y-[2px] active:translate-x-[2px] active:shadow-none`}
          >
            <span className="text-xl drop-shadow-sm">📝</span>
            DESCRIPTION
          </button>

          <button
            onClick={() => setShowER(true)}
            className="flex-1 px-4 py-4 font-black text-sm tracking-widest uppercase transition-all duration-200 rounded-lg flex items-center justify-center gap-2 border-[3px] z-10 bg-white text-orange-600 border-orange-300 shadow-[4px_4px_0px_0px_#fdba74] hover:-translate-y-1 hover:-translate-x-0.5 hover:bg-orange-50 hover:border-orange-400 hover:shadow-[6px_6px_0px_0px_#fdba74] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
          >
            <span className="text-xl drop-shadow-sm">🗺️</span>
            ER DIAGRAM
          </button>

          <button
            onClick={() => onTabChange('submissions')}
            className={`flex-1 px-4 py-4 font-black text-sm tracking-widest uppercase transition-all duration-200 rounded-lg flex items-center justify-center gap-2 border-[3px] z-10 ${
              selectedTab === 'submissions'
                ? 'bg-[#059669] text-white border-[#047857] shadow-[4px_4px_0px_0px_#064e3b] -translate-y-1 -translate-x-0.5'
                : 'bg-white text-slate-500 border-slate-300 shadow-[4px_4px_0px_0px_#cbd5e1] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-slate-50'
            } active:translate-y-[2px] active:translate-x-[2px] active:shadow-none`}
          >
            <span className="text-xl drop-shadow-sm">✅</span>
            MY SUBMISSIONS
          </button>

        </div>
      </div>

      {showER && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm cursor-pointer" 
            onClick={() => setShowER(false)}
          ></div>
          
          <div className="relative w-full max-w-5xl bg-white border-[4px] border-slate-900 shadow-[12px_12px_0px_0px_#000000] rounded-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            <div className="flex items-center justify-between p-4 border-b-[4px] border-slate-900 bg-[#f97316]">
              <h3 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3 drop-shadow-[2px_2px_0px_#000000]">
                <span className="text-3xl">🗺️</span> Database Schema
              </h3>
              
              <button 
                onClick={() => setShowER(false)}
                className="w-12 h-12 bg-red-500 border-[3px] border-slate-900 rounded-lg flex items-center justify-center text-white font-black text-2xl shadow-[4px_4px_0px_0px_#000000] hover:-translate-y-1 active:translate-y-[2px] active:shadow-none transition-all"
              >
                X
              </button>
            </div>

            <div className="p-6 bg-slate-100 overflow-auto max-h-[75vh]">
              <div className="border-[4px] border-slate-900 rounded-xl overflow-hidden bg-white p-4 flex flex-col items-center justify-center min-h-[400px]">
                
                <img 
                  src={erdImage} 
                  alt="ER Diagram" 
                  className="max-w-full h-auto object-contain"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/800x400?text=Image+Not+Found";
                  }}
                />

                <a 
                  href={erdImage} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded hover:bg-black transition-colors"
                >
                  OPEN ORIGINAL IMAGE ↗
                </a>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}