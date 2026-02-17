import React, { useState, useEffect } from 'react';

export default function LeftPanel({ problemData, currentStep }) {
  const targetDateStr = '2026-03-13T10:00:00+07:00'; 
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    let timer;
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000) * 1000; 
      const target = new Date(targetDateStr).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('0d 0h 0m 0s');
        if (timer) clearInterval(timer);
        return;
      }

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };

    const startSyncTimer = () => {
      calculateTimeLeft();
      const msUntilNextSecond = 1000 - (Date.now() % 1000);
      setTimeout(() => {
        calculateTimeLeft();
        timer = setInterval(calculateTimeLeft, 1000);
      }, msUntilNextSecond);
    };

    startSyncTimer();
    return () => { if (timer) clearInterval(timer); };
  }, [targetDateStr]);

  if (!problemData) return null;

  return (
    // Container หลัก: กรอบหนาและเงาเหลี่ยม
    <div className="bg-white rounded-xl border-[3px] border-slate-800 shadow-[8px_8px_0px_0px_#1e293b] flex flex-col h-full overflow-hidden">
      
      {/* 1. Time Remaining Section - เปลี่ยนพื้นหลังเป็น Gradient ตามรีเควสต์ */}
      <div className="bg-gradient-to-r from-[#DBDCFF] to-[#FFE5C4] p-6 text-center border-b-[3px] border-slate-800">
        <p className="text-slate-900 text-xs uppercase tracking-[0.2em] font-black mb-2 border-b-2 border-slate-900/20 inline-block pb-1">
          TIME REMAINING
        </p>
        <div className="flex justify-center items-center mt-2">
          <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter w-full max-w-[320px] font-mono drop-shadow-sm">
            {timeLeft || 'Calculating...'}
          </p>
        </div>
      </div>

      {/* 2. Content Section (Scrollable) */}
      <div className="p-8 overflow-y-auto custom-scrollbar flex-1 pb-10 bg-[#f8fafc]"> 

        {/* Problem Indicator - สไตล์ป้ายแท็ก 2D */}
        <div className="mb-8">
          <span className="text-white font-black text-sm uppercase tracking-widest bg-blue-600 px-3 py-1.5 rounded border-[3px] border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]">
            Problem: {currentStep}
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-6 leading-tight tracking-tight uppercase">
            {problemData.title}
          </h2>
        </div>

        {/* Description */}
        <div className="mb-10">
          <p className="text-slate-700 text-[19px] font-bold leading-relaxed border-l-[4px] border-blue-500 pl-4 bg-white p-4 rounded-r-lg shadow-sm">
            {problemData.description}
          </p>
        </div>

        {/* --- Requirements (Mission Objectives) --- */}
        <div className="mb-10 bg-white rounded-xl border-[3px] border-slate-800 shadow-[6px_6px_0px_0px_#1e293b] overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 border-b-[3px] border-slate-800 px-6 py-4 flex items-center justify-between">
            <h3 className="font-black text-white flex items-center text-lg tracking-widest uppercase">
              <span className="mr-3 text-2xl">🎯</span> Mission Objectives
            </h3>
            <span className="bg-[#FF4500] text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000000]">
              Rules
            </span>
          </div>

          {/* รายการ Requirements แบบแบนๆ */}
          <div className="p-6 space-y-4 bg-white">
            {problemData.requirements?.map((req, i) => (
              <div
                key={i}
                className="group flex items-start gap-4 p-4 rounded-lg border-[3px] border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-800 hover:shadow-[4px_4px_0px_0px_#1e293b] hover:-translate-y-1 hover:-translate-x-1 transition-all duration-200"
              >
                {/* กล่องตัวเลขทรงเหลี่ยม */}
                <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded border-[3px] border-slate-800 bg-white flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="text-slate-800 group-hover:text-white text-sm font-black font-mono">
                    {i + 1}
                  </span>
                </div>
                {/* ข้อความ */}
                <p className="text-slate-800 font-bold text-[16px] leading-relaxed pt-1">
                  {req}
                </p>
              </div>
            ))}
            {!problemData.requirements && (
              <div className="text-center py-6 text-slate-400 italic font-black uppercase">
                No explicit requirements.
              </div>
            )}
          </div>
        </div>
        {/* --- จบส่วน Requirements --- */}

        {/* Table Structure */}
        <div className="mb-0"> 
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-black text-slate-900 flex items-center text-lg tracking-widest uppercase">
              <span className="mr-3 text-2xl">📊</span> Table Structure
            </h3>
            <span className="text-white font-mono text-sm font-black bg-blue-600 px-4 py-2 rounded border-[3px] border-slate-900 shadow-[3px_3px_0px_0px_#0f172a]">
              {problemData.table}
            </span>
          </div>
          
          <div className="border-[3px] border-slate-800 rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_#1e293b] bg-white">
            <table className="w-full text-base border-collapse">
              <thead className="bg-slate-800 border-b-[3px] border-slate-800">
                <tr>
                  <th className="px-6 py-5 text-left font-black text-white uppercase text-[13px] tracking-widest border-r-[3px] border-slate-700">Column</th>
                  <th className="px-6 py-5 text-left font-black text-white uppercase text-[13px] tracking-widest">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y-[3px] divide-slate-800">
                {problemData.columns?.map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-r-[3px] border-slate-800">
                      <code className="text-blue-700 font-black font-mono text-[16px] bg-blue-50 px-2 py-1 rounded border-2 border-blue-200">
                        {col.name}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-bold font-mono text-[15px] uppercase">
                      {col.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}