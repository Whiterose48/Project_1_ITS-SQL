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

  // ... (ส่วน Import และ Logic คงเดิม) ...

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
      
      {/* 1. Time Remaining Section */}
      <div className="bg-gradient-to-r from-[#DBDCFF] to-[#FFE5C4] p-6 text-center shadow-inner border-b border-gray-100">
        <p className="text-[#6B7280] text-xs uppercase tracking-[0.2em] font-black mb-2 opacity-80">
          TIME REMAINING
        </p>
        <div className="flex justify-center items-center">
          <p className="text-4xl font-black text-[#2D3748] tabular-nums tracking-tighter w-full max-w-[320px]">
            {timeLeft || 'Calculating...'}
          </p>
        </div>
      </div>

      {/* 2. Content Section (Scrollable) */}
      {/* ปรับ pb-32 ออก แล้วเปลี่ยนเป็น pb-10 เพื่อให้ขอบล่างชิดกล่องสุดท้ายมากขึ้น */}
      <div className="p-8 overflow-y-auto custom-scrollbar flex-1 pb-10"> 

        {/* Problem Indicator */}
        <div className="mb-8">
          <span className="text-blue-600 font-extrabold text-base uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            Problem: {currentStep}
          </span>
          <h2 className="text-3xl font-black text-gray-900 mt-5 leading-tight tracking-tight">
            {problemData.title}
          </h2>
        </div>

        {/* Description */}
        <div className="mb-10">
          <p className="text-gray-600 text-[19px] font-medium leading-relaxed">
            {problemData.description}
          </p>
        </div>

        {/* Requirements Section */}
        <div className="bg-slate-50 rounded-2xl p-7 mb-10 border border-slate-100 shadow-sm">
          <h3 className="font-black text-gray-800 mb-5 flex items-center text-lg tracking-wide uppercase">
            <span className="mr-3 text-xl">🔒</span> Requirements
          </h3>
          <ul className="space-y-5">
            {problemData.requirements?.map((req, idx) => (
              <li key={idx} className="text-[18px] text-gray-700 flex items-start leading-normal font-medium">
                <span className="text-blue-500 mr-4 font-black text-xl">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Table Structure (องค์ประกอบสุดท้าย) */}
        {/* ลบ mb-10 ออกเพื่อให้ตัวตารางเป็นจุดสิ้นสุดของพื้นที่ด้านล่างพอดี */}
        <div className="mb-0"> 
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-black text-gray-800 flex items-center text-lg tracking-wide uppercase">
              <span className="mr-3 text-2xl">📊</span> Table Structure
            </h3>
            <span className="text-blue-700 font-mono text-sm font-bold bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 shadow-sm">
              {problemData.table}
            </span>
          </div>
          
          <div className="border-2 border-purple-100 rounded-2xl overflow-hidden shadow-md">
            <table className="w-full text-base">
              <thead className="bg-purple-50 border-b-2 border-purple-100">
                <tr>
                  <th className="px-6 py-5 text-left font-black text-purple-900 uppercase text-[13px] tracking-widest">Column</th>
                  <th className="px-6 py-5 text-left font-black text-purple-900 uppercase text-[13px] tracking-widest">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-purple-50">
                {problemData.columns?.map((col, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <code className="text-blue-600 font-black font-mono text-[17px]">{col.name}</code>
                    </td>
                    <td className="px-6 py-5 text-gray-500 font-bold italic text-[16px]">{col.type}</td>
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