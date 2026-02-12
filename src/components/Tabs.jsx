import React from 'react';

export default function Tabs({ selectedTab, onTabChange }) {
  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl shadow-md mb-6 overflow-hidden border border-slate-200">
      <div className="flex gap-2 p-3">
        <button
          onClick={() => onTabChange('description')}
          className={`flex-1 px-6 py-4 font-black text-sm tracking-wider transition-all duration-300 rounded-xl flex items-center justify-center gap-2 ${
            selectedTab === 'description'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
              : 'bg-white text-gray-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="text-lg">📝</span>
          DESCRIPTION
        </button>
        <button
          onClick={() => onTabChange('submissions')}
          className={`flex-1 px-6 py-4 font-black text-sm tracking-wider transition-all duration-300 rounded-xl flex items-center justify-center gap-2 ${
            selectedTab === 'submissions'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg scale-105'
              : 'bg-white text-gray-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="text-lg">✅</span>
          MY SUBMISSIONS
        </button>
      </div>
    </div>
  );
}
